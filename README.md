# Kids Motion Game

Your phone's camera tracks your body → the server relays it → a TV-connected browser shows the games.
Games: **Letter Sky-Writing** (trace letters in the air with your arm) and **Jump Dodge** (jump over spikes).
Voice commands and AI-generated themes are optional extras.

## What you need
- A computer to run the server (Node 20+), a phone, and a TV-connected browser (laptop/HDMI, Chromecast-with-browser, smart TV browser). All on the **same Wi-Fi**.
- Optional: `ANTHROPIC_API_KEY` (voice commands), `TOGETHER_API_KEY` (AI theme images).

## Start it

```sh
npm install
export ANTHROPIC_API_KEY=sk-ant-...     # optional: enables voice commands
export TOGETHER_API_KEY=...             # optional: real theme images (otherwise a colored placeholder)
npm run dev
```

The server prints two URLs, e.g.

```
phone: https://192.168.1.149:3000/phone
tv:    https://192.168.1.149:3000/tv
```

1. **TV:** open the `tv` URL. Accept the certificate warning (Advanced → Proceed) — it's a self-signed cert, needed so the phone camera works. Click the page or press any key once to enable sound.
2. **Phone:** open the `phone` URL, accept the warning, allow the **camera** and **microphone/speech** prompts.
3. Prop the phone up so the camera sees the player **from the waist up (Letters) or head-to-knees (Jump — hips must be visible)**, about 2–3 m away.
4. Move. The TV top-left shows a latency number; under ~150 ms feels good.

## Play

**Letter Sky-Writing:** a faint letter appears. Wave your hand (the one moving most is used) to paint over it. Fill about 70% and it celebrates, then moves on (A–Z).

**Jump Dodge:** spikes scroll in from the right. Jump when they reach the blue character. Three lives; a confetti burst every 5 cleared.

**Switching games:** buttons on the TV (top right), buttons on the phone page, keys `1`/`2` on the TV, or say *"let's play the jump game"* / *"letter game"*.

**Voice** (phone listens continuously; needs `ANTHROPIC_API_KEY`), examples:
- "restart the game" · "next letter" · "make it easier / harder"
- "make it dogs in a jungle" → TV shows "Painting…" then swaps the background

**Session:** after ~15 minutes of active play a "time for a break" screen appears. A grown-up presses **Enter** (or taps the bottom of the screen) to start a new one.

## Tuning (TV keyboard / URL)

| What | How |
|---|---|
| Letters: how much to fill | `↑`/`↓`, or `?threshold=0.6` |
| Letters: brush width | `?brush=0.12` (bigger = more forgiving) |
| Letters: skip | `→`/`←` |
| Jump: how high you must jump | `↑`/`↓` (in Jump mode), or `?jumpThreshold=0.04` |
| Jump: spike speed | `?jumpSpeed=0.25` |
| Session length | `?sessionMin=10` |
| Mascot "hand near camera" | `?closeZ=-0.4` |
| Mute | `M` |
| Test without a phone | `?mouse=1` (mouse = wrist), `Space` = fake jump |

Combine: `https://<ip>:3000/tv/?game=jump&jumpSpeed=0.25`

## Environment variables
`PORT` (default 3000) · `ANTHROPIC_API_KEY` · `KMG_MODEL` (default `claude-opus-5`; `claude-haiku-4-5` is faster/cheaper for voice) · `TOGETHER_API_KEY` · `IMAGE_PROVIDER` (`together`|`mock`) · `IMAGE_MODEL` · `IMAGE_PROMPT_TEMPLATE` (use `{theme}`) · `MOCK_DELAY_MS`

Generated images are cached in `server/cache/`, so repeat themes are free and instant.

## Troubleshooting
- **Phone page can't open camera:** you must use the `https://` URL and accept the cert warning.
- **Dots/character don't move:** phone page must say "tracking" and the TV `/s` number should be ~30. Make sure the body is in frame and lit.
- **High latency:** check the phone's `inference` ms (phone too slow → close other apps) vs. Wi-Fi (move closer to the router).
- **No sound:** click or press a key on the TV page; check the 🔊 button isn't muted.
- **Voice does nothing:** `ANTHROPIC_API_KEY` must be set in the terminal that runs `npm run dev`; the phone page shows what it heard and which command matched. Speech recognition works in Chrome (Android) and Safari (iOS).
- **TV can't reach the server:** use the LAN IP printed at startup, not `localhost`; a firewall may need to allow port 3000.
