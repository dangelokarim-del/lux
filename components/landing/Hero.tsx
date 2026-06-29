"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Wordmark, buttonVariants } from "@/components/ui";
import { ProductDashboard } from "./ProductDashboard";
import { ParallaxScene, ParallaxLayer } from "./anim/Parallax";

const ease = [0.16, 1, 0.3, 1] as const;

function Up({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="relative px-5 pt-40 sm:pt-48">
      {/* neutral ambient light, very faint */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-16 -z-10 h-[440px] w-[820px] max-w-[95vw] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.06), transparent 70%)" }}
      />

      <div className="mx-auto max-w-4xl text-center">
        <Up>
          <Wordmark className="text-[clamp(3rem,12vw,7.5rem)] leading-none" />
        </Up>

        <Up delay={0.12}>
          <h1 className="mt-10 text-balance text-[clamp(2.75rem,9vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-white">
            Luxury. Automated.
          </h1>
        </Up>

        <Up delay={0.2}>
          <p className="mx-auto mt-7 max-w-xl text-balance text-lg text-white/60 sm:text-xl">
            The AI Operating System for Luxury Hospitality.
          </p>
        </Up>

        <Up delay={0.26}>
          <p className="mx-auto mt-3 max-w-md text-balance text-[15px] text-white/35">
            The quiet infrastructure behind the world&apos;s most exclusive villas.
          </p>
        </Up>

        <Up delay={0.34}>
          <div className="mt-10">
            <Link href="/login" className={buttonVariants({ variant: "accent", size: "lg" })}>
              Book a Demo
            </Link>
          </div>
        </Up>
      </div>

      {/* floating dashboard */}
      <ParallaxScene className="mx-auto mt-24 max-w-6xl pb-28 sm:mt-28">
        <div className="relative" style={{ perspective: 1800 }}>
          {/* accent pool behind */}
          <ParallaxLayer depth={-14} className="pointer-events-none absolute -inset-x-10 top-10 bottom-0 -z-10">
            <div
              className="h-full w-full opacity-70 blur-3xl"
              style={{ background: "radial-gradient(60% 60% at 50% 40%, rgba(46,125,255,0.16), transparent 70%)" }}
            />
          </ParallaxLayer>

          <ParallaxLayer depth={22}>
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 1.2, ease }}
              className="[transform-style:preserve-3d]"
            >
              <div className="origin-top shadow-[0_70px_160px_-50px_rgba(0,0,0,0.95)] sm:[transform:perspective(1800px)_rotateX(6deg)]">
                <ProductDashboard />
              </div>
            </motion.div>
          </ParallaxLayer>
        </div>
      </ParallaxScene>
    </section>
  );
}
