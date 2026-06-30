"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { MotionValue } from "framer-motion";

/* Two-part hero, played as ONE continuous cinematic. Drop your exports at:
     public/hero/villa-part1.mp4   (exterior villa)
     public/hero/villa-part2.mp4   (interior continuation)
   The .mp4s are the real hero (H.264, universally supported). Optional
   stylised .webm companions sit beside them as a graceful fallback for the
   rare browser that can't decode H.264. Override the .mp4 paths with
   NEXT_PUBLIC_HERO_PART1 / NEXT_PUBLIC_HERO_PART2 to host them on a CDN. */
const PARTS = [
  { mp4: process.env.NEXT_PUBLIC_HERO_PART1 || "/hero/villa-part1.mp4", webm: "/hero/villa-part1.webm" },
  { mp4: process.env.NEXT_PUBLIC_HERO_PART2 || "/hero/villa-part2.mp4", webm: "/hero/villa-part2.webm" },
];
const POSTER = process.env.NEXT_PUBLIC_HERO_POSTER || "/hero/villa-poster.jpg";

// hidden match cut: part 1's last frame and part 2's first frame are the same
// composition, so a short 350ms dissolve reads as one continuous camera move
const FADE_MS = 350;

/* The phone's screen position through part 2 (the interior clip), measured frame
   by frame from the footage. Coordinates are normalised to the video (0..1);
   `t` is part-2 playback seconds. The guest walks left→right holding the phone,
   so the WhatsApp overlay can ride this path and "follow the phone". */
const VIDEO_W = 1932;
const VIDEO_H = 1072;
const PHONE_TRACK: { t: number; x: number; y: number }[] = [
  { t: 0.0, x: 0.295, y: 0.52 },
  { t: 0.5, x: 0.30, y: 0.52 },
  { t: 0.8, x: 0.32, y: 0.52 },
  { t: 1.2, x: 0.37, y: 0.51 },
  { t: 1.6, x: 0.41, y: 0.51 },
  { t: 2.0, x: 0.44, y: 0.515 },
  { t: 2.4, x: 0.47, y: 0.52 },
  { t: 2.8, x: 0.50, y: 0.52 },
  { t: 3.2, x: 0.53, y: 0.52 },
  { t: 3.56, x: 0.555, y: 0.52 },
];

function sampleTrack(t: number) {
  const k = PHONE_TRACK;
  if (t <= k[0].t) return { x: k[0].x, y: k[0].y };
  if (t >= k[k.length - 1].t) return { x: k[k.length - 1].x, y: k[k.length - 1].y };
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i], b = k[i + 1];
    if (t >= a.t && t <= b.t) {
      const f = (t - a.t) / (b.t - a.t);
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    }
  }
  return { x: k[0].x, y: k[0].y };
}

// the message lands on the phone (fade in) once the guest is up and walking with
// it — the clean, well-tracked phase — follows it, then lifts off + fades
// ("sent") near the end of the clip. The earlier seated→standing morph is skipped.
function trackVisibility(t: number) {
  if (t < 0.95) return 0;
  if (t < 1.35) return (t - 0.95) / 0.4;
  if (t < 2.8) return 1;
  if (t < 3.4) return 1 - (t - 2.8) / 0.6;
  return 0;
}

type PhoneOut = { x: MotionValue<number>; y: MotionValue<number>; vis: MotionValue<number> };

/**
 * The cinematic backdrop. Plays part 1 (exterior) → part 2 (interior) → part 1 …
 * forever, crossfading exactly as one clip reaches its final frame into the next,
 * so the viewer believes it is a single continuous camera move. There is never a
 * black frame, flash, pause or restart: the outgoing clip holds its last frame if
 * the next isn't buffered yet, and the incoming clip is only revealed once it has
 * a real frame to show.
 *
 * Two stacked <video>s are cross-dissolved purely by GPU-composited opacity. The
 * pair is lazy-armed (sources attach only near the viewport), paused when the hero
 * scrolls off-screen (battery/perf), and falls back to the CSS villa if H.264
 * can't be decoded at all — the page is never broken.
 */
export function VideoBackdrop({ fallback, phone }: { fallback: ReactNode; phone?: PhoneOut }) {
  const holderRef = useRef<HTMLDivElement>(null);
  const v0Ref = useRef<HTMLVideoElement>(null); // part 1
  const v1Ref = useRef<HTMLVideoElement>(null); // part 2
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);
  const [failed, setFailed] = useState(false);
  const ctrl = useRef({ active: 0, transitioning: false, visible: true });

  // lazy: attach sources only when the hero nears the viewport
  useEffect(() => {
    const el = holderRef.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setArmed(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setArmed(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // pause both when the hero is fully off-screen; resume the active one on return
  useEffect(() => {
    const el = holderRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([e]) => {
        ctrl.current.visible = e.isIntersecting;
        const vids = [v0Ref.current, v1Ref.current];
        if (e.isIntersecting) vids[ctrl.current.active]?.play().catch(() => {});
        else vids.forEach((v) => v?.pause());
      },
      { threshold: 0.001 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // the seamless controller
  useEffect(() => {
    if (!armed) return;
    const a = v0Ref.current;
    const c = v1Ref.current;
    if (!a || !c) return;
    const vids: HTMLVideoElement[] = [a, c];

    vids.forEach((v) => {
      v.muted = true;
      v.style.opacity = "0";
      v.load(); // attach the <source> children
    });

    // stagger bandwidth: part 1 loads eagerly; part 2 only buffers in full once
    // part 1 is actually playing (it has the whole first clip to get ready)
    const upgradeNext = () => {
      if (c.preload !== "auto") {
        c.preload = "auto";
        c.load();
      }
    };

    const reveal = () => setShown(true);
    const onError = (v: HTMLVideoElement) => () => {
      // both <source>s for this clip exhausted → fall back to the CSS villa
      if (v.error) setFailed(true);
    };
    const onErr0 = onError(a);
    const onErr1 = onError(c);
    a.addEventListener("playing", reveal);
    a.addEventListener("error", onErr0);
    c.addEventListener("error", onErr1);

    // start part 1
    a.currentTime = 0;
    a.play().then(() => {
      a.style.opacity = "1";
      setShown(true);
      upgradeNext();
    }).catch(() => {});
    a.addEventListener("playing", upgradeNext, { once: true });

    let raf = 0;
    const holder = holderRef.current;
    const tick = () => {
      const st = ctrl.current;
      const cur = vids[st.active];
      const nxt = vids[1 - st.active];

      // WhatsApp overlay rides the phone, but only while part 2 (v1, the interior
      // clip) is the one actually showing — otherwise it is hidden
      if (phone) {
        const part2 = vids[1];
        if (st.active === 1 && st.visible && holder && part2.duration) {
          const tt = part2.currentTime;
          const { x: nx, y: ny } = sampleTrack(tt);
          const vw = part2.videoWidth || VIDEO_W;
          const vh = part2.videoHeight || VIDEO_H;
          const cw = holder.clientWidth, ch = holder.clientHeight;
          const s = Math.max(cw / vw, ch / vh); // object-fit: cover
          const offX = (cw - vw * s) / 2, offY = (ch - vh * s) / 2;
          // slight lift-off as it "sends" near the end
          const lift = tt > 2.9 ? Math.min((tt - 2.9) / 0.6, 1) * 0.06 : 0;
          phone.x.set(offX + nx * vw * s);
          phone.y.set(offY + (ny - lift) * vh * s);
          phone.vis.set(trackVisibility(tt));
        } else {
          phone.vis.set(0);
        }
      }

      if (cur && nxt && !st.transitioning && st.visible && cur.duration) {
        const remaining = cur.duration - cur.currentTime;
        // near the final frame — begin the crossfade once the next clip can paint
        if (remaining <= FADE_MS / 1000 + 0.04 && nxt.readyState >= 3) {
          st.transitioning = true;
          nxt.currentTime = 0;
          nxt
            .play()
            .then(() => {
              // reveal the incoming clip only now that it has a real frame
              cur.style.transition = `opacity ${FADE_MS}ms linear`;
              nxt.style.transition = `opacity ${FADE_MS}ms linear`;
              nxt.style.opacity = "1";
              cur.style.opacity = "0";
              window.setTimeout(() => {
                cur.pause();
                cur.currentTime = 0;
                cur.style.transition = "";
                st.active = 1 - st.active;
                st.transitioning = false;
              }, FADE_MS);
            })
            .catch(() => {
              st.transitioning = false;
            });
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      a.removeEventListener("playing", reveal);
      a.removeEventListener("error", onErr0);
      c.removeEventListener("error", onErr1);
    };
  }, [armed]);

  const videoClass =
    "pointer-events-none absolute inset-0 h-full w-full object-cover";
  const videoStyle = {
    opacity: 0,
    transform: "translate3d(0,0,0)",
    willChange: "opacity",
    backfaceVisibility: "hidden" as const,
  };

  return (
    <div ref={holderRef} className="absolute inset-0 overflow-hidden bg-[#070809]">
      {/* CSS villa underneath: paints instantly, and stays if H.264 can't decode */}
      <div
        className="absolute inset-0 transition-opacity duration-[1200ms] ease-out"
        style={{ opacity: shown && !failed ? 0 : 1 }}
      >
        {fallback}
      </div>

      {!failed && (
        <>
          <video ref={v0Ref} className={videoClass} style={videoStyle} poster={POSTER} muted loop={false} playsInline preload="auto" disablePictureInPicture aria-hidden="true">
            {armed && <source src={PARTS[0].mp4} type="video/mp4" />}
            {armed && <source src={PARTS[0].webm} type="video/webm" />}
          </video>
          <video ref={v1Ref} className={videoClass} style={videoStyle} muted loop={false} playsInline preload="metadata" disablePictureInPicture aria-hidden="true">
            {armed && <source src={PARTS[1].mp4} type="video/mp4" />}
            {armed && <source src={PARTS[1].webm} type="video/webm" />}
          </video>
        </>
      )}
    </div>
  );
}
