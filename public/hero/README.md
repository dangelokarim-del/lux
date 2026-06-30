# Hero video

The homepage hero plays **two clips as one continuous cinematic** — an exterior
villa shot that crossfades, exactly on its final frame, into an interior
continuation, then loops back with the same invisible dissolve. Driven by
`components/landing/VideoBackdrop.tsx` (mounted by `SpatialExperience.tsx`).

## The files in this folder

| File | What it is |
| --- | --- |
| `villa-part1.mp4` | **Exterior** villa clip — the real hero (H.264). |
| `villa-part2.mp4` | **Interior** continuation — the real hero (H.264). |
| `villa-part1.webm` / `villa-part2.webm` | Lightweight **stylised fallbacks** for the rare browser that can't decode H.264. Safe to delete; H.264 is universally supported. |
| `villa-poster.jpg` | Frame shown while part 1 loads (`preload="auto"`). |

To update the hero, just replace `villa-part1.mp4` / `villa-part2.mp4` with your
new exports (same names — no code changes). Recommended: 1080p, seamless,
no audio, H.264, `-movflags +faststart`, compressed efficiently (CRF ~23).

## How the seamless loop works

Two stacked `<video>` elements are cross-dissolved by GPU-composited opacity:

- Part 1 plays. ~0.35 s before its final frame, part 2 (already buffered) starts
  from frame 0 and the opacity crossfades part 1 → part 2. Part 1's last frame and
  part 2's first frame are the same composition, so this reads as a hidden match
  cut — one continuous camera move.
- Part 2 plays. Near its end it crossfades back to part 1 from frame 0.
- Repeat forever. There is never a black frame, flash, pause or restart — the
  outgoing clip holds its last frame if the next isn't buffered, and the incoming
  clip is only revealed once it has a real frame to show.
- Bandwidth is staggered: part 1 loads eagerly; part 2 only buffers in full once
  part 1 is playing. Both videos pause when the hero scrolls off-screen.

Tune the dissolve length with `FADE_MS` at the top of `VideoBackdrop.tsx`.

## Hosting on a CDN instead

```
NEXT_PUBLIC_HERO_PART1=https://cdn.example.com/luxa/villa-part1.mp4
NEXT_PUBLIC_HERO_PART2=https://cdn.example.com/luxa/villa-part2.mp4
NEXT_PUBLIC_HERO_POSTER=https://cdn.example.com/luxa/villa-poster.jpg
```

## The on-video story

A WhatsApp message rides the guest's phone through the interior clip: it appears
on the phone and **follows it** as he walks across the room, then leaves the phone
as an electric-blue AI line travels into the villa and lights the master bedroom;
analysis chips follow and the dashboard emerges.

The phone is tracked by `PHONE_TRACK` near the top of `VideoBackdrop.tsx` — a list
of `{ t, x, y }` keyframes where `t` is part-2 playback seconds and `x`/`y` are
normalised to the video frame (0–1). These were measured frame-by-frame from the
current footage; if you swap in a new `villa-part2.mp4`, re-measure the phone path
and update those keyframes (the overlay maps them through the same `object-fit:
cover` math, so it stays locked to the phone on any screen size).
