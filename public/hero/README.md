# Cinematic hero film

Drop the pre-rendered hero film here to replace the handcrafted placeholder.

## Files
- **`hero.mp4`** — the 8-second 4K cinematic plate (required to go live).
  - H.264/AAC `.mp4`, ~8 s, 3840×2160 (or 1920×1080). Mute it; it autoplays muted.
  - Keep it lean for a hero (ideally < 6–8 MB). Consider also exporting
    `hero.webm` if you want a smaller alternative (then add a `<source>`).
- **`hero-poster.jpg`** — optional first frame, shown before the video is ready.

That's it. The moment `hero.mp4` exists, the hero switches from the handcrafted
villa placeholder to your film automatically — every overlay is identical.

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
