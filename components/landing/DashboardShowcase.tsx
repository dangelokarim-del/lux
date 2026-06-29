"use client";

import { motion } from "framer-motion";
import { ProductDashboard } from "./ProductDashboard";
import { CursorGlow } from "./anim/CursorGlow";
import { ShinyText } from "./anim/ShinyText";
import { SpotlightCard } from "./anim/SpotlightCard";

export function DashboardShowcase() {
  return (
    <section id="product" className="relative px-5 py-32 sm:py-40">
      <CursorGlow size={620} color="rgba(255,255,255,0.045)" />
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="text-[11px] font-medium uppercase tracking-[0.2em]">
            <ShinyText>The product</ShinyText>
          </div>
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl">
            One screen. Every operation.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-16"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-12 -top-10 bottom-4 -z-10 opacity-70 blur-3xl"
            style={{ background: "radial-gradient(55% 55% at 50% 32%, rgba(46,125,255,0.13), transparent 72%)" }}
          />
          <SpotlightCard className="overflow-hidden rounded-[28px] shadow-[var(--shadow-float)] transition-transform duration-700 ease-[var(--ease-premium)] hover:-translate-y-1.5">
            <ProductDashboard />
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
}
