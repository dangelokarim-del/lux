"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui";
import { CursorGlow } from "./anim/CursorGlow";
import { Magnetic } from "./anim/Magnetic";

export function FinalCTA() {
  const ease = [0.62, 0.04, 0.2, 1] as const;
  return (
    <section className="relative -mt-[26vh] overflow-hidden px-5 pb-56 pt-40 sm:pb-64 sm:pt-48">
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
          className="text-balance text-[clamp(2.7rem,7.8vw,5.8rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-white"
        >
          Luxury operations.
          <br />
          <span className="text-white/45">Perfectly orchestrated.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.2, ease }}
          className="mx-auto mt-8 max-w-xl text-balance text-[17px] leading-relaxed text-white/70 sm:text-[18px]"
        >
          One platform for guests, staff and every request.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, delay: 0.35, ease }}
          className="mt-12"
        >
          <Magnetic className="inline-block" strength={0.3}>
            <Link href="/login" className={buttonVariants({ variant: "accent", size: "lg" })}>
              Book a Demo
            </Link>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}
