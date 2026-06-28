"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DashboardPreview } from "./DashboardPreview";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pt-40 sm:pt-48">
      {/* backdrop */}
      <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0 -z-20 opacity-60" />
      <div className="pointer-events-none absolute left-1/2 top-24 -z-10 h-[460px] w-[820px] -translate-x-1/2 glow-accent blur-3xl opacity-70" />

      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.02] px-3.5 py-1.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="text-[12px] text-ink-2">Private beta · Marbella</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.05 }}
          className="chrome text-balance text-[15vw] font-semibold leading-[0.9] tracking-[-0.05em] sm:text-[120px]"
        >
          LUXA
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.15 }}
          className="mt-6 text-2xl font-medium tracking-tight text-ink sm:text-3xl"
        >
          Luxury. Automated.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.22 }}
          className="mx-auto mt-4 max-w-xl text-balance text-[17px] leading-relaxed text-ink-2"
        >
          The AI Operating System for luxury hospitality. Every guest request
          becomes an organized operation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.3 }}
          className="mt-9 flex items-center justify-center gap-3"
        >
          <Link href="/login" className="btn-accent px-6 py-3 text-[15px]">
            Book a Demo
          </Link>
          <a href="#dashboard" className="btn-ghost px-6 py-3 text-[15px]">
            See the product
          </a>
        </motion.div>
      </div>

      <div className="mx-auto mt-20 max-w-6xl pb-24">
        <DashboardPreview />
      </div>
    </section>
  );
}
