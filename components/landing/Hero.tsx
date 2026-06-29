"use client";

import { motion } from "framer-motion";
import { PrimaryPill, SecondaryPill } from "./MarketingUI";

const ease = [0.16, 1, 0.3, 1] as const;

function Up({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="relative px-5 pt-36 sm:pt-44">
      {/* warm halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[480px] w-[820px] max-w-[92vw] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
        style={{ background: "radial-gradient(closest-side, #F3E6CD, transparent 70%)" }}
      />

      <div className="mx-auto max-w-3xl text-center">
        <Up>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E7E3DA] bg-white/60 px-3.5 py-1.5 text-[13px] text-[#57565C]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#A9854A]" />
            Luxury hospitality · Marbella
          </span>
        </Up>

        <Up delay={0.08}>
          <h1 className="mt-8 text-balance text-[clamp(3rem,11vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-[#0E0E0F]">
            Luxury made simple.
          </h1>
        </Up>

        <Up delay={0.16}>
          <p className="mx-auto mt-7 max-w-xl text-balance text-xl text-[#57565C] sm:text-2xl">
            The AI Operating System for luxury hospitality.
          </p>
        </Up>

        <Up delay={0.22}>
          <p className="mx-auto mt-3 text-[15px] text-[#8B8A90]">
            One platform. Every request. Under control.
          </p>
        </Up>

        <Up delay={0.3}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PrimaryPill href="/login" className="w-full sm:w-auto">
              Book a Demo
            </PrimaryPill>
            <SecondaryPill href="#features" className="w-full sm:w-auto">
              See how it works
            </SecondaryPill>
          </div>
        </Up>
      </div>
    </section>
  );
}
