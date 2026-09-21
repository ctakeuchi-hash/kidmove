# Kids Motion Game

Your phone's camera tracks your body → the server relays it → a TV-connected browser shows the games. Your body appears on the TV as a cartoon bear.

**Games**
- **Trace** (arm-writing): capital letters (ABC), small letters (abc), numbers (123), Japanese **hiragana** (あ) and **katakana** (ア). Follow the numbered start dot and arrows, stroke by stroke, in the right order and direction.
- **Jump Dodge**: jump over spikes.
- **1 or 2 players**: in Trace, two people (one on each side of the room) trace the same character together; it counts as done when both finish.

## What you need
- A computer to run the server (Node 20+), a phone, and a TV-connected browser (laptop/HDMI, smart-TV browser, etc.). All on the **same Wi-Fi**.
- Optional: `ANTHROPIC_API_KEY` (voice commands), `TOGETHER_API_KEY` (AI theme images).

## Start it

```sh
cd ~/kids-motion-game
npm install
npm run dev
```

(With keys: run `export ANTHROPIC_API_KEY=sk-ant-your-key` and/or `export TOGETHER_API_KEY=your-key` on their own lines first, in the same terminal. No comments on those lines: macOS zsh treats `#` text as arguments.)

The server prints two URLs, e.g. `https://192.168.1.149:3000/phone` and `.../tv`.

1. **TV:** open the `tv` URL, accept the certificate warning (Advanced → Proceed; the cert is self-signed, needed so the phone camera works). Click the page or press a key once to turn sound on.
2. **Phone:** open the `phone` URL, accept the warning, allow camera (and microphone for voice). Prop it up 2-3 m away so it sees you head to hips (Jump: head to knees).
3. The TV shows a menu. Pick something (below). The version number is at the bottom of both screens.

## Using it

**Menu (on the TV):** big buttons for each character set, Jump Dodge, and 1 / 2 Players. Press one by **clicking it**, by **holding your hand on it for a second** (a bar fills), from the **phone buttons**, or by **voice**. Top right: 🏠 Menu, ⏭ Skip, 🔊 sound.

**Trace:** a faint character appears made of numbered strokes. Start at the pulsing yellow **1**, follow the moving arrows. Paint only appears where you have traced the correct stroke, in order, in the right direction; scribbling or going the wrong way does nothing. Finish a stroke to move to the next; finish all to celebrate and move to the next character. Kana show how to say them in the bottom-left, and the TV says the character out loud.

**Two players:** choose "2 Players" (menu, phone button, `P` key, or say "two players"). Stand left and right of each other in view. Each side has its own copy; when both are done it celebrates together. (If only one person is in view, they play on whichever side they stand.)

**Voice** (needs `ANTHROPIC_API_KEY`; the phone listens continuously): "play hiragana", "small letters", "numbers", "jump game", "two players", "go to the menu", "next letter", "restart", "make it easier", "make it dogs in a jungle".

**Session:** after ~15 minutes of active play a break screen appears. A grown-up presses **Enter** (or taps the bottom of the screen) to start again.

## Tuning (TV keyboard / URL)

| What | How |
|---|---|
| Pick a set / game | `1`-`5` sets, `6` Jump, `Esc` menu, `P` 1/2 players |
| How much of each stroke is needed | `↑`/`↓` or `?threshold=0.7` |
| How far your hand may stray from the line | `?brush=0.12` (bigger = more forgiving) |
| Prev / next character | `←` / `→` (or the ⏭ button) |
| Arm reach (bigger = smaller movements) | `[` / `]` or `?reach=0.6` |
| Jump: how high | `↑`/`↓` in Jump, or `?jumpThreshold=0.04`; speed `?jumpSpeed=0.25` |
| Session length | `?sessionMin=10` |
| Hold-to-press time | `?dwellMs=1500` |
| Start straight in a game | `?set=hiragana&players=2`, `?game=jump` |
| Mute | `M` |
| Test without a phone | `?mouse=1` (mouse = wrist), `Space` = fake jump |

## Environment variables
`PORT` (default 3000) · `ANTHROPIC_API_KEY` · `KMG_MODEL` (default `claude-opus-5`; `claude-haiku-4-5` is faster/cheaper for voice) · `TOGETHER_API_KEY` · `IMAGE_PROVIDER` (`together`|`mock`) · `IMAGE_MODEL` · `IMAGE_PROMPT_TEMPLATE` (use `{theme}`) · `MOCK_DELAY_MS`

Generated images are cached in `server/cache/`.

## Troubleshooting
- **Phone can't open camera:** use the `https://` URL and accept the cert warning.
- **Avatar doesn't move:** the phone page must say "tracking" and the TV `/s` number should be ~30; keep your shoulders and hips in frame.
- **High latency:** check the phone's `inference` ms (phone too slow → close other apps; 2-player mode needs more) vs Wi-Fi.
- **No sound / no speech:** click or press a key on the TV page; check 🔊 isn't muted. Text-to-speech depends on the TV browser having voices.
- **Voice does nothing:** `ANTHROPIC_API_KEY` must be set in the terminal running `npm run dev`; the phone page shows what it heard.
- **Old behaviour after an update:** restart the server and refresh both pages; the version at the bottom should match.

## Credits
Kana stroke order and shapes come from [KanjiVG](http://kanjivg.tagaini.net) © Ulrich Apel and contributors, licensed [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). The derived data in `tv-app/kana.js` is shared under the same license. Latin letter and digit strokes in `tv-app/strokes.js` are hand-made single-line skeletons.
