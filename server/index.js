import { createServer } from 'node:https'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { networkInterfaces } from 'node:os'
import express from 'express'
import { WebSocketServer } from 'ws'

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

const app = express()
app.use('/phone', express.static(new URL('../phone-app', import.meta.url).pathname))
app.use('/tv', express.static(new URL('../tv-app', import.meta.url).pathname))
app.get('/', (_req, res) => res.send('<a href="/phone">phone-app</a> · <a href="/tv">tv-app</a>'))

const server = createServer({ key: readFileSync(key), cert: readFileSync(cert) }, app)
const wss = new WebSocketServer({ server })

// ponytail: role comes from ?role=phone|tv; phone messages are forwarded verbatim to every TV. No rooms until >1 phone.
wss.on('connection', (ws, req) => {
  ws.role = new URL(req.url, 'http://x').searchParams.get('role')
  ws.on('message', (data, isBinary) => {
    // Clock sync: reply with server time so each client can compute its offset (phone/TV clocks differ).
    if (!isBinary) {
      const m = data.toString()
      if (m.startsWith('{"type":"sync"')) return ws.send(JSON.stringify({ ...JSON.parse(m), s: Date.now() }))
    }
    if (ws.role !== 'phone') return
    for (const c of wss.clients) if (c.role === 'tv' && c.readyState === 1) c.send(data, { binary: isBinary })
  })
})

server.listen(PORT, () => {
  console.log(`phone: https://${lanIp}:${PORT}/phone`)
  console.log(`tv:    https://${lanIp}:${PORT}/tv`)
})
