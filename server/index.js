import { createServer } from 'node:https'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { networkInterfaces } from 'node:os'
import express from 'express'
import { WebSocketServer } from 'ws'
import { interpret } from './voice.js'
import { getThemeImage, CACHE_DIR } from './images.js'

const PORT = process.env.PORT || 3000
const lanIp = Object.values(networkInterfaces()).flat()
  .find((i) => i.family === 'IPv4' && !i.internal)?.address ?? 'localhost'

// Camera access needs a secure context, so serve HTTPS with a self-signed cert (accept the warning once per device).
const dir = new URL('./', import.meta.url).pathname
const [key, cert] = [`${dir}key.pem`, `${dir}cert.pem`]
if (!existsSync(cert)) {
  execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '365', '-subj', '/CN=kidmove',
    '-addext', `subjectAltName=IP:${lanIp},DNS:localhost`, '-keyout', key, '-out', cert], { stdio: 'ignore' })
}

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)))
const app = express()
app.get('/version', (_req, res) => res.json({ version })) // shown on the phone and TV pages
app.use(express.json({ limit: '4kb' }))
app.use('/theme-assets', express.static(CACHE_DIR))
app.post('/api/theme', async (req, res) => {
  try { res.json(await getThemeImage(req.body?.theme ?? '')) } catch (e) { res.status(502).json({ error: e.message }) }
})
app.post('/api/voice', async (req, res) => res.json({ command: await interpret(req.body?.transcript ?? '') }))
app.use('/phone', express.static(new URL('../phone-app', import.meta.url).pathname))
app.use('/tv', express.static(new URL('../tv-app', import.meta.url).pathname))
app.get('/', (_req, res) => res.send('<a href="/phone">phone-app</a> · <a href="/tv">tv-app</a>'))

const toTVs = (msg) => { for (const c of wss.clients) if (c.role === 'tv' && c.readyState === 1) c.send(JSON.stringify(msg)) }
// Theme change: tell TVs to show a loading state, generate (or fetch from cache), then push the asset.
async function applyTheme(theme) {
  toTVs({ type: 'theme_loading', theme })
  try { toTVs({ type: 'theme_asset', ...(await getThemeImage(theme)) }) }
  catch (e) { console.error('theme failed:', e.message); toTVs({ type: 'theme_error', theme }) }
}

const server = createServer({ key: readFileSync(key), cert: readFileSync(cert) }, app)
const wss = new WebSocketServer({ server })

// ponytail: role comes from ?role=phone|tv; phone messages are forwarded verbatim to every TV. No rooms until >1 phone.
let config = null // last {type:'config', players} sent by a TV: how many people the phone should track
wss.on('connection', (ws, req) => {
  ws.role = new URL(req.url, 'http://x').searchParams.get('role')
  if (ws.role === 'phone' && config) ws.send(config)
  ws.on('message', (data, isBinary) => {
    // Clock sync: reply with server time so each client can compute its offset (phone/TV clocks differ).
    if (!isBinary) {
      const m = data.toString()
      if (m.startsWith('{"type":"sync"')) return ws.send(JSON.stringify({ ...JSON.parse(m), s: Date.now() }))
    }
    if (ws.role === 'tv' && !isBinary && data.toString().startsWith('{"type":"config"')) {
      config = data.toString()
      for (const c of wss.clients) if (c.role === 'phone' && c.readyState === 1) c.send(config)
      return
    }
    if (ws.role !== 'phone') return
    // Voice: turn the transcript into a structured command for the TVs; the phone gets the result back for display.
    if (!isBinary && data.toString().startsWith('{"type":"voice_command"')) {
      let text; try { text = JSON.parse(data.toString()).text } catch { return }
      return interpret(text).then((command) => {
        ws.send(JSON.stringify({ type: 'voice_result', text, command }))
        if (command?.name === 'change_theme') applyTheme(command.input.theme)
        else if (command) toTVs({ type: 'game_command', name: command.name, input: command.input })
      })
    }
    for (const c of wss.clients) if (c.role === 'tv' && c.readyState === 1) c.send(data, { binary: isBinary })
  })
})

server.listen(PORT, () => {
  console.log(`kids-motion-game v${version}`)
  console.log(`phone: https://${lanIp}:${PORT}/phone`)
  console.log(`tv:    https://${lanIp}:${PORT}/tv`)
})
