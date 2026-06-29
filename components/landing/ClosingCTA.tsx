"use client";

import { motion } from "framer-motion";
import { PrimaryPill, SecondaryPill } from "./MarketingUI";

export function ClosingCTA() {
  return (
    <section className="px-5 pb-24 sm:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] border border-[#ECE6D8] px-6 py-20 text-center sm:py-28"
        style={{ background: "linear-gradient(180deg,#F6EFE1 0%,#F1E6D1 100%)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-64 w-[700px] max-w-[90%] -translate-x-1/2 opacity-70 blur-3xl"
          style={{ background: "radial-gradient(closest-side,#FCEFD6,transparent 70%)" }}
        />
        <h2 className="text-balance text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-[#0E0E0F]">
          Luxury, perfectly run.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-balance text-[17px] text-[#5b5a60]">
          See LUXA in a private 20-minute demo, built around your properties.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <PrimaryPill href="/login" className="w-full sm:w-auto">
            Book a Demo
          </PrimaryPill>
          <SecondaryPill href="#features" className="w-full sm:w-auto">
            See how it works
          </SecondaryPill>
        </div>
      </motion.div>
    </section>
  );
}
