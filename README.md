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

- phone: `http://<local-ip>:3000/phone`
- TV:    `http://<local-ip>:3000/tv`

Open each on its device (same Wi-Fi). Both should show `ws: connected`.

## Stage 0 check

Tap **Send test frame** on the phone → the JSON appears on the TV page.

## Known: camera needs HTTPS

`getUserMedia` only works on a secure context. `http://<local-ip>` is not one, so Stage 1
(camera capture) will need either a self-signed cert on the server, a tunnel (ngrok/cloudflared),
or Chrome's `chrome://flags/#unsafely-treat-insecure-origin-as-secure`. Deal with it in Stage 1.
