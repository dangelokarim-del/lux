"use client";

import { motion } from "framer-motion";
import { ProductDashboard } from "./ProductDashboard";

export function DashboardShowcase() {
  return (
    <section id="product" className="relative px-5 py-32 sm:py-40">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">The product</div>
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
            className="pointer-events-none absolute -inset-x-8 -top-6 bottom-0 -z-10 opacity-60 blur-3xl"
            style={{ background: "radial-gradient(50% 50% at 50% 30%, rgba(46,125,255,0.12), transparent 70%)" }}
          />
          <div className="shadow-[0_70px_160px_-50px_rgba(0,0,0,0.95)]">
            <ProductDashboard />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
