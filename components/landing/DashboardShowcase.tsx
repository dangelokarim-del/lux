"use client";

import { motion } from "framer-motion";
import { DashboardPreview } from "./DashboardPreview";

export function DashboardShowcase() {
  return (
    <section id="dashboard" className="relative border-t border-line px-5 py-32 sm:py-44">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="eyebrow">The product</div>
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-6xl">
            One screen.
            <span className="chrome"> Every operation.</span>
          </h2>
        </motion.div>

        <div className="mt-20">
          <DashboardPreview tilt={false} />
        </div>
      </div>
    </section>
  );
}
