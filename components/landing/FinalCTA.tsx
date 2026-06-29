"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden px-5 py-52 sm:py-64">
      {/* the only accent glow on the page lives here, over a soft spotlight */}
      <div aria-hidden className="spotlight pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[380px] w-[700px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 opacity-75 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(46,125,255,0.16), transparent 70%)" }}
      />
      <div className="mx-auto max-w-3xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-balance text-[clamp(2.5rem,7.5vw,5.5rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-white"
        >
          Bring order to luxury operations.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12"
        >
          <Link href="/login" className={buttonVariants({ variant: "accent", size: "lg" })}>
            Book a Demo
          </Link>
          <p className="mt-5 text-[13px] text-white/35">A 20-minute private walkthrough.</p>
        </motion.div>
      </div>
    </section>
  );
}
