"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui";
import { CursorGlow } from "./anim/CursorGlow";
import { Magnetic } from "./anim/Magnetic";

export function FinalCTA() {
  const ease = [0.62, 0.04, 0.2, 1] as const;
  return (
    <section className="relative overflow-hidden px-5 pb-40 pt-16 sm:pb-48 sm:pt-20">
      {/* the only accent glow on the page lives here, over a soft spotlight */}
      <div aria-hidden className="spotlight pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[380px] w-[700px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 opacity-75 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(46,125,255,0.16), transparent 70%)" }}
      />
      <CursorGlow size={520} color="rgba(46,125,255,0.05)" />
      <div className="relative mx-auto max-w-3xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 32, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.5, ease }}
          className="text-balance text-[clamp(2.4rem,6.6vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-white"
        >
          Ready to automate
          <br />
          <span className="text-white/45">luxury hospitality?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.2, ease }}
          className="mx-auto mt-8 max-w-xl text-balance text-[17px] leading-relaxed text-white/70 sm:text-[18px]"
        >
          See how LUXA can automate your operations in days, not months.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, delay: 0.35, ease }}
          className="mt-12 flex items-center justify-center"
        >
          <Magnetic className="inline-block" strength={0.3}>
            <span className="relative inline-block">
              {/* a stronger, calm blue glow behind the single primary CTA */}
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-5 -z-10 rounded-full opacity-90"
                style={{ background: "radial-gradient(closest-side, rgba(46,125,255,0.5), transparent 72%)", filter: "blur(6px)" }}
              />
              <Link
                href="/login"
                className={`${buttonVariants({ variant: "accent", size: "lg" })} h-[54px] px-9 text-[16px] shadow-[0_18px_50px_-12px_rgba(46,125,255,0.6)] transition-transform duration-300 hover:-translate-y-0.5`}
              >
                Book a Demo
              </Link>
            </span>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}
