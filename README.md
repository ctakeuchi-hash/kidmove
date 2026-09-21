# Kids Motion Game

Phone camera → pose data over WebSocket → TV-connected browser renders the game.

## Packages

- `server/` — Express + `ws`. Serves both web apps **and** relays WebSocket messages between them.
- `phone-app/` — static page opened on the phone (camera capture + pose detection).
- `tv-app/` — static page opened on the TV-connected device (Canvas renderer).

One server serves both apps, so there is only one URL/IP to deal with and no CORS.

## Run

```sh
npm install
npm run dev        # PORT=3000 by default
```

The server prints the LAN URLs on start:

- phone: `https://<local-ip>:3000/phone`
- TV:    `https://<local-ip>:3000/tv`

Open each on its device (same Wi-Fi). Both should show `ws: connected`.

## Stage 1: latency check

Servers use a self-signed HTTPS cert (auto-generated in `server/` on first run; needed for camera access).
Accept the browser warning once on each device. Phone: allow camera. Wave your hand; the TV shows dots
plus a rolling latency average (clocks synced via the server). Target: consistently under ~150ms.
