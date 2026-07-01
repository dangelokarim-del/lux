"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const ease = [0.4, 0, 0.2, 1] as const;

const WITHOUT = ["WhatsApp chaos", "Manual assignment", "Forgotten tasks", "Slow replies", "No visibility"];
const WITH = ["AI understands every request", "Automatic task creation", "Instant staff assignment", "Live dashboard", "Guests always informed"];

/* ------------------------------------------------------------------ *
 *  The before / after — two premium glass cards. The contrast makes the
 *  value obvious at a glance, no reading required.
 * ------------------------------------------------------------------ */
export function Comparison() {
  return (
    <section className="relative px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 22, filter: "blur(7px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease }}
          className="text-center text-[clamp(1.9rem,5vw,3.2rem)] font-semibold leading-tight tracking-[-0.04em] text-white"
        >
          Without LUXA <span className="text-white/35">vs</span> With LUXA
        </motion.h2>

        <div className="mt-14 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-6">
          {/* WITHOUT */}
          <motion.div
            initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.1, ease }}
            className="relative overflow-hidden rounded-[24px] p-7 transition-shadow duration-500 sm:p-9"
            style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07), 0 40px 90px -50px rgba(0,0,0,0.8)", background: "rgba(255,255,255,0.012)" }}
          >
            <div className="glass absolute inset-0" aria-hidden />
            <div className="relative">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">Without LUXA</div>
              <ul className="mt-7 space-y-4">
                {WITHOUT.map((t, i) => (
                  <motion.li
                    key={t}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.7, delay: 0.15 + i * 0.09, ease }}
                    className="flex items-center gap-3.5 text-[15px] text-white/55 sm:text-[16px]"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white/40">
                      <X className="h-3.5 w-3.5" />
                    </span>
                    {t}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* WITH */}
          <motion.div
            initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.1, delay: 0.1, ease }}
            className="relative overflow-hidden rounded-[24px] p-7 transition-shadow duration-500 sm:p-9"
            style={{ boxShadow: "inset 0 0 0 1px rgba(46,125,255,0.28), 0 50px 110px -50px rgba(0,0,0,0.85)", background: "rgba(46,125,255,0.04)" }}
          >
            <div className="glass absolute inset-0" aria-hidden />
            <div aria-hidden className="pointer-events-none absolute -inset-8 -z-10" style={{ background: "radial-gradient(55% 60% at 50% 20%, rgba(46,125,255,0.14), transparent 72%)", filter: "blur(28px)" }} />
            <div className="relative">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8fbcff]">With LUXA</div>
              <ul className="mt-7 space-y-4">
                {WITH.map((t, i) => (
                  <motion.li
                    key={t}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.7, delay: 0.25 + i * 0.09, ease }}
                    className="flex items-center gap-3.5 text-[15px] text-white sm:text-[16px]"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#2E7DFF]/30 bg-[#2E7DFF]/12 text-[#5fe0a0]">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {t}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
