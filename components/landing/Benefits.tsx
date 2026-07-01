"use client";

import { motion } from "framer-motion";

const ease = [0.4, 0, 0.2, 1] as const;

const STATS = [
  { n: "85%", l: "Faster guest response" },
  { n: "24/7", l: "AI Concierge" },
  { n: "0", l: "Missed requests" },
  { n: "1", l: "WhatsApp for everything" },
];

/* ------------------------------------------------------------------ *
 *  SECTION 4 — the proof, in four large numbers. Minimal, lots of air;
 *  each rises gently into place as it scrolls in.
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
              {s.n}
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
