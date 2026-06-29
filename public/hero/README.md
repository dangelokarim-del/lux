# Cinematic hero film

Drop the pre-rendered hero film here to replace the handcrafted placeholder.

## Files
Drop either format (or both) — the player tries **`hero.webm` first**, then
falls back to **`hero.mp4`**. You only need one for it to go live.

- **`hero.webm`** — preferred (smaller). VP9/Opus, ~8 s, 3840×2160 (or 1920×1080).
  Tried first because it's typically the leanest.
- **`hero.mp4`** — fallback / broadest compatibility. H.264/AAC, ~8 s, same length.
  - Mute either export; the hero autoplays muted. Keep it lean (ideally < 6–8 MB).
- **`hero-poster.jpg`** — optional first frame, shown before the video is ready.

That's it. The moment a `hero.webm` or `hero.mp4` exists, the hero switches from
the handcrafted villa placeholder to your film automatically — every overlay is
identical. If neither file exists, the cinematic CSS villa scene plays instead.

## Tuning to your edit
All overlay beats are driven by the **video's own playback clock**, so they stay
in sync. To line them up with your cut, edit the `FILM` object in
`components/landing/intro/CinematicIntro.tsx`:

- `notifyIn / notifyOut` — when the WhatsApp message is on screen
- `detect` — when the electric-blue line draws to the window
- `chips` — when the AI entity chips surface
- `dissolve` — when the film glass-dissolves into the dashboard
- `dashboard` — when the dashboard is fully sharp (task + stats run)
- `reveal` — when "Luxury. Automated." appears
- `end` — hand off to the resting product hero
- `window.x / window.y` — point the line + chips at the lit window in your footage (in %)

No other code changes are needed.

## Reading the exact timestamps (calibration HUD)
You don't have to guess the numbers. Open the homepage with **`?film=1&debug=1`**:

- `?film=1` force-replays the intro (ignores the once-per-session lock)
- `?debug=1` shows a live `clock 0.00s` readout in the top-left

Watch your film play and note the `clock` value at each moment:

| When you see…                                   | Set this field            |
| ----------------------------------------------- | ------------------------- |
| the phone / WhatsApp message appear → disappear  | `notifyIn` → `notifyOut`  |
| the AI finishes "reading" the request            | `detect`                  |
| the extracted entity chips should surface        | `chips`                   |
| the shot should start dissolving to the dashboard| `dissolve`                |
| the dashboard is fully sharp                      | `dashboard`               |
| the brand line should appear                      | `reveal`                  |
| the film is fully done → hand off to the site     | `end`                     |

`detect → dissolve` should land within your ~8 s video; `reveal` and `end` are
allowed to run a little past the video's end — the clock free-runs after the
last frame so the dashboard + brand reveal finish cleanly, then the whole intro
fades into the live homepage hero underneath. Tune, re-load `?film=1&debug=1`,
repeat until it locks.
