"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const ease = [0.4, 0, 0.2, 1] as const;

const STATS: { count?: number; suffix?: string; text?: string; l: string }[] = [
  { count: 85, suffix: "%", l: "Faster guest response" },
  { text: "24/7", l: "AI Concierge" },
  { count: 0, suffix: "", l: "Missed guest requests" },
  { count: 1, suffix: "", l: "WhatsApp for everything" },
];

/* counts up from 0 to `to` the first time it scrolls into view */
function CountUp({ to, suffix = "", duration = 1.6 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || to === 0) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setN(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {n}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 *  The proof, in four large numbers. Minimal, lots of air; each rises
 *  gently into place and counts up as it scrolls in.
 * ------------------------------------------------------------------ */
export function Benefits() {
  return (
    <section className="relative px-6 py-28 sm:py-40">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-x-8 gap-y-16 sm:grid-cols-4 sm:gap-x-10">
        {STATS.map((s, i) => (
          <motion.div
            key={s.l}
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.2, delay: i * 0.12, ease }}
            className="text-center"
          >
            <div className="text-[clamp(3rem,9vw,5rem)] font-semibold leading-none tracking-[-0.05em] text-white">
              {s.text ? s.text : <CountUp to={s.count ?? 0} suffix={s.suffix} />}
            </div>
            <div className="mx-auto mt-4 max-w-[180px] text-balance text-[14px] leading-relaxed text-white/50 sm:text-[15px]">
              {s.l}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
