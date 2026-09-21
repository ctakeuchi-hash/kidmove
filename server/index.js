import { createServer } from 'node:http'
import { networkInterfaces } from 'node:os'
import express from 'express'
import { WebSocketServer } from 'ws'

const PORT = process.env.PORT || 3000
const app = express()

app.use('/phone', express.static(new URL('../phone-app', import.meta.url).pathname))
app.use('/tv', express.static(new URL('../tv-app', import.meta.url).pathname))
app.get('/', (_req, res) => res.send('<a href="/phone">phone-app</a> · <a href="/tv">tv-app</a>'))

const server = createServer(app)
const wss = new WebSocketServer({ server })

// ponytail: dumb broadcast relay — every message goes to every other client.
// Add per-role/per-room routing only when there's more than one phone or TV.
wss.on('connection', (ws) => {
  ws.on('message', (data, isBinary) => {
    for (const client of wss.clients) {
      if (client !== ws && client.readyState === 1) client.send(data, { binary: isBinary })
    }
  })
})

const lanIp = Object.values(networkInterfaces()).flat()
  .find((i) => i.family === 'IPv4' && !i.internal)?.address ?? 'localhost'

server.listen(PORT, () => {
  console.log(`phone: http://${lanIp}:${PORT}/phone`)
  console.log(`tv:    http://${lanIp}:${PORT}/tv`)
})
