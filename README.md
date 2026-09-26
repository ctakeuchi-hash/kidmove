# Kids Motion Game

Your phone's camera tracks your body → the server relays it → a TV-connected browser shows the games. Your body appears on the TV as a cartoon bear.

**Games**
- **Trace** (arm-writing): capital letters (ABC), small letters (abc), numbers (123), Japanese **hiragana** (あ) and **katakana** (ア). Follow the numbered start dot and arrows, stroke by stroke, in the right order and direction. Practice a subset (vowels/consonants, or a kana row) and shuffle the order; each character shows a picture+word clue while you trace it.
- **Jump Dodge**: jump over spikes.
- **Alicorn Flight**: fly through a mountain landscape - bank/pitch with your arms (or keyboard) and flap to climb. Dodge freestanding boulders and thread bridge/hill gates cleanly for points; hitting one just bounces you gently, no fail state. 4 levels of increasing difficulty, each its own themed landscape (Green Valley → Red Canyon → Snowy Peaks → Dusk Peaks), auto-advancing on finish and carrying your score forward - loops back to Green Valley with a fresh score after Dusk Peaks. `?level=2` jumps straight to a level.
- **Taiko Drums**: a Taiko-no-Tatsujin-style rhythm game - notes scroll down two lanes toward a ring; swing a hand down like a drumstick when a note arrives (left hand for the blue lane, right hand for the orange lane) to score and build a combo. The backing beat always plays in full, so it sounds like a real song even before you're good at it - no fail state. 4 songs of increasing tempo and density (Sunshine Beat → Bouncy Bus → Jungle Groove → Rocket Rhythm), auto-advancing on finish and carrying your score forward - loops back to Sunshine Beat with a fresh score after Rocket Rhythm. `?song=2` jumps straight to a song.
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

**Trace:** picking a set from the menu opens a screen to choose what to practice — **All**, **Vowels**/**Consonants** (letters), or a kana **row** (あ-row, か-row, ...) — plus a **🔀 Shuffle** toggle to mix up the order. Then: a faint character appears made of numbered strokes. Start at the pulsing yellow **1**, follow the moving arrows. Paint only appears where you have traced the correct stroke, in order, in the right direction; scribbling or going the wrong way does nothing. A "🎯 N to go" counter tracks progress, and most characters show a picture+word clue (e.g. A → 🍎 Apple) while you trace. Finish a stroke to move to the next; finish all to hear it called out (e.g. "A! A is for Apple!"), celebrate, and move to the next character. Kana show how to say them in the bottom-left, and the TV says the character out loud both when it appears and when you finish it.

**Two players:** choose "2 Players" (menu, phone button, `P` key, or say "two players"). Stand left and right of each other in view. Each side has its own copy; when both are done it celebrates together. (If only one person is in view, they play on whichever side they stand.)

**Voice** (needs `ANTHROPIC_API_KEY`; the phone listens continuously): "play hiragana", "small letters", "numbers", "jump game", "two players", "go to the menu", "next letter", "restart", "make it easier", "make it dogs in a jungle", "just vowels", "consonants only", "the ka row", "shuffle the letters", "put them back in order".

**Session:** after ~15 minutes of active play a break screen appears. A grown-up presses **Enter** (or taps the bottom of the screen) to start again.

## Tuning (TV keyboard / URL)

| What | How |
|---|---|
| Pick a set / game | `1`-`5` sets, `6` Jump, `7` Alicorn Flight, `8` Taiko Drums, `Esc` menu, `P` 1/2 players |
| How much of each stroke is needed | `↑`/`↓` or `?threshold=0.7` |
| How far your hand may stray from the line | `?brush=0.12` (bigger = more forgiving) |
| Easier to start a stroke | `?startZone=3` (the glowing circle around the yellow dot; default 2.5), `?resumeZone=2.5` |
| Prev / next character | `←` / `→` (or the ⏭ button) |
| Arm reach (bigger = smaller movements) | `[` / `]` or `?reach=0.6` |
| Jump: how high | `↑`/`↓` in Jump, or `?jumpThreshold=0.04`; speed `?jumpSpeed=0.25` |
| Taiko Drums: jump to a song | `taiko.html?song=2`; no phone, use `F`/`J` keys or click the top/bottom half |
| Session length | `?sessionMin=10` |
| Hold-to-press time | `?dwellMs=1500` |
| Start straight in a game | `?set=hiragana&players=2`, `?game=jump` |
| Practice a subset | groups screen (after picking a set), voice, or `?group=vowels` / `?group=consonants` / `?group=row0`.."row9" |
| Randomize character order | groups screen's 🔀 Shuffle tile, voice ("shuffle the letters"), or `?shuffle=1` |
| Jumpy tracking | `?smooth=2` (steadier, a little more lag); `?smooth=0` turns smoothing off. On the phone page: `?model=full` (steadier pose model, a bit slower) |
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
Kana stroke order and shapes come from [KanjiVG](http://kanjivg.tagaini.net) © Ulrich Apel and contributors, licensed [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). The derived data in `tv-app/kana.js` is shared under the same license. Latin letter and digit strokes in `tv-app/strokes.js` are hand-made single-line skeletons. The picture/word clues in `tv-app/clues.js` and the practice groupings in `tv-app/groups.js` are original, hand-authored content (not derived from KanjiVG).

## Checks
`npm test` (or `node tv-app/check.js`) validates the character/group/clue data (no test framework — a plain assert-based script).
