# Hero video

The homepage hero is a full-screen looping video (`components/landing/VideoBackdrop.tsx`,
mounted by `components/landing/SpatialExperience.tsx`).

## Drop your Artlist export here

1. **`villa.mp4`** — your final Artlist export (H.264/AAC or H.265). This is the
   primary source and wins wherever the browser can play it. Recommended:
   1080p, ~6–12 s, seamless loop, no audio, compressed efficiently
   (CRF ~23, `-movflags +faststart`).
2. **`villa.webm`** *(optional but recommended)* — a VP9/AV1 companion for smaller
   size on modern browsers. A lightweight **placeholder** clip ships here today so
   the hero is never blank; **replace it** (or delete it) once `villa.mp4` is in.
3. **`villa-poster.jpg`** — a single frame shown while the video loads
   (`preload="metadata"`). Export a frame from your video so the poster matches
   the first painted frame. A placeholder poster ships here today — replace it.

No code changes are needed — just drop the files in with these names.

## Hosting on a CDN instead

Set environment variables and the component will use them:

```
NEXT_PUBLIC_HERO_VIDEO=https://cdn.example.com/luxa/villa.mp4
NEXT_PUBLIC_HERO_POSTER=https://cdn.example.com/luxa/villa-poster.jpg
```

## Matching the on-video story to your composition

As the visitor scrolls, a WhatsApp message appears **above the guest's phone**,
then leaves it and an electric-blue AI line travels into the villa. Set where the
phone sits in your final frame via the `PHONE = { x, y }` constant near the top of
`SpatialExperience.tsx` (share of the viewport) so the message lands on the phone.
