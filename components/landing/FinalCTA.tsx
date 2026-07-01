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
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Magnetic className="inline-block" strength={0.3}>
            <Link href="/login" className={`${buttonVariants({ variant: "accent", size: "lg" })} transition-transform duration-300 hover:-translate-y-0.5`}>
              Book a Demo
            </Link>
          </Magnetic>
          <Link
            href="/login"
            className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-[var(--radius-control)] border border-white/15 bg-white/[0.03] px-6 text-[15px] font-medium text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:text-white"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full border border-white/30 transition-colors group-hover:border-white/55">
              <span className="ml-[1.5px] h-0 w-0 border-y-[3.5px] border-l-[6px] border-y-transparent border-l-white/75" />
            </span>
            Watch Live Demo
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
