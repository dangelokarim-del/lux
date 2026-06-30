"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* The Artlist hero export. Drop your file at public/hero/villa.mp4 (the .mp4
   <source> is listed first, so it wins wherever it can play); villa.webm is a
   lightweight modern-codec companion / fallback. Override either with
   NEXT_PUBLIC_HERO_VIDEO / NEXT_PUBLIC_HERO_POSTER if you host them on a CDN. */
const MP4 = process.env.NEXT_PUBLIC_HERO_VIDEO || "/hero/villa.mp4";
const WEBM = "/hero/villa.webm";
const POSTER = process.env.NEXT_PUBLIC_HERO_POSTER || "/hero/villa-poster.jpg";

/**
 * The cinematic backdrop: the looping hero video, full-bleed (object-cover, no
 * borders), GPU-composited, muted + inline + autoplay. It is lazy-armed (sources
 * attach only once it nears the viewport) and shows the poster until the first
 * frame can paint, so there is never a black flash or layout shift. If the video
 * cannot load at all, the handcrafted CSS villa `fallback` takes over silently —
 * the page is never broken, but the video is always the hero when present.
 */
export function VideoBackdrop({ fallback }: { fallback: ReactNode }) {
  const holderRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  // lazy: attach the sources only when the hero is on/near screen
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

  // once armed, load the (now-attached) sources + autoplay; reveal on first paint
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !armed) return;
    v.load();
    const reveal = () => setPlaying(true);
    const tryPlay = () => v.play().catch(() => {});
    // a transient <source> miss (e.g. an absent .mp4) does NOT set v.error — the
    // browser just advances to the next candidate. Only flag failure when the
    // element itself ends up with a MediaError (all candidates exhausted).
    const onError = () => {
      if (v.error) setFailed(true);
    };
    v.addEventListener("loadeddata", reveal);
    v.addEventListener("canplay", tryPlay);
    v.addEventListener("playing", reveal);
    v.addEventListener("error", onError);
    tryPlay();
    return () => {
      v.removeEventListener("loadeddata", reveal);
      v.removeEventListener("canplay", tryPlay);
      v.removeEventListener("playing", reveal);
      v.removeEventListener("error", onError);
    };
  }, [armed]);

  return (
    <div ref={holderRef} className="absolute inset-0 overflow-hidden bg-[#070809]">
      {/* CSS villa underneath: paints instantly, and stays if the video fails */}
      <div
        className="absolute inset-0 transition-opacity duration-[1200ms] ease-out"
        style={{ opacity: playing && !failed ? 0 : 1 }}
      >
        {fallback}
      </div>

      {/* the video is never unmounted on a transient error — it stays put and is
          simply hidden (revealing the fallback) until it can actually paint */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out"
        style={{
          opacity: playing && !failed ? 1 : 0,
          transform: "translate3d(0,0,0)",
          willChange: "opacity",
          backfaceVisibility: "hidden",
        }}
        poster={POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        aria-hidden="true"
      >
        {armed && <source src={MP4} type="video/mp4" />}
        {armed && <source src={WEBM} type="video/webm" />}
      </video>
    </div>
  );
}
