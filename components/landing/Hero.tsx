"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Wordmark, buttonVariants } from "@/components/ui";
import { DashboardPreview } from "./DashboardPreview";

const ease = [0.16, 1, 0.3, 1] as const;

function Up({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pt-44 sm:pt-52">
      {/* calm, neutral backdrop — no colored wash */}
      <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0 -z-20 opacity-40" />
      <div className="glow-soft pointer-events-none absolute left-1/2 top-20 -z-10 h-[520px] w-[900px] -translate-x-1/2 blur-3xl" />

      <div className="mx-auto max-w-5xl text-center">
        <Up>
          <Wordmark className="text-[clamp(3.5rem,15vw,9rem)] leading-none" />
        </Up>

        <Up delay={0.1}>
          <h1 className="mt-10 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-ink sm:text-6xl">
            Luxury. Automated.
          </h1>
        </Up>

        <Up delay={0.18}>
          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-ink-2 sm:text-xl">
            The AI Operating System for Luxury Hospitality.
          </p>
        </Up>

        <Up delay={0.24}>
          <p className="mx-auto mt-2 max-w-md text-balance text-[15px] text-ink-3">
            Every guest request becomes an organized operation.
          </p>
        </Up>

        <Up delay={0.32}>
          <div className="mt-10">
            <Link href="/login" className={buttonVariants({ variant: "accent", size: "lg" })}>
              Book a Demo
            </Link>
          </div>
        </Up>
      </div>

      <div className="mx-auto mt-24 max-w-6xl pb-28 sm:mt-28">
        <DashboardPreview tilt />
      </div>
    </section>
  );
}
