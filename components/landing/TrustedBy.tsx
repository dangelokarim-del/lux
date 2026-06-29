"use client";

import { motion } from "framer-motion";

const names = ["Puente Romano", "Nobu Marbella", "Marbella Club", "LØV Marbella"];

export function TrustedBy() {
  return (
    <section className="px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-[12px] uppercase tracking-[0.22em] text-[#9a9890]">
          Trusted by Marbella&apos;s finest
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 sm:gap-x-16">
          {names.map((n, i) => (
            <motion.span
              key={n}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-[17px] font-medium tracking-[-0.01em] text-[#3a3a3e] sm:text-xl"
            >
              {n}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
