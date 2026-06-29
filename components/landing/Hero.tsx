"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Wordmark, buttonVariants } from "@/components/ui";
import { ProductDashboard } from "./ProductDashboard";
import { ParallaxScene, ParallaxLayer } from "./anim/Parallax";

const ease = [0.16, 1, 0.3, 1] as const;

/** Slow, premium fade + rise + blur-in. */
function Rise({ children, delay = 0, blur = 6 }: { children: React.ReactNode; delay?: number; blur?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, filter: `blur(${blur}px)` }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.1, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative px-5 pt-44 sm:pt-56">
      {/* deliberate lighting: soft top spotlight + edge vignette for depth */}
      <div aria-hidden className="spotlight pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "radial-gradient(120% 90% at 50% 22%, transparent 55%, rgba(0,0,0,0.55))" }}
      />

      <div className="mx-auto max-w-4xl text-center">
        <Rise blur={4}>
          <Wordmark className="text-[clamp(3rem,12vw,7.5rem)] leading-none" />
        </Rise>

        <Rise delay={0.16} blur={10}>
          <h1 className="mt-14 text-balance text-[clamp(2.75rem,9vw,5.5rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-white">
            Luxury. Automated.
          </h1>
        </Rise>

        <Rise delay={0.28}>
          <p className="mx-auto mt-8 max-w-xl text-balance text-lg leading-relaxed text-white/65 sm:text-xl">
            The AI Operating System for Luxury Hospitality.
          </p>
        </Rise>

        <Rise delay={0.36}>
          <p className="mx-auto mt-3.5 max-w-md text-balance text-[15px] leading-relaxed text-white/35">
            The quiet infrastructure behind the world&apos;s most exclusive villas.
          </p>
        </Rise>

        <Rise delay={0.46}>
          <div className="mt-12">
            <Link href="/login" className={buttonVariants({ variant: "accent", size: "lg" })}>
              Book a Demo
            </Link>
          </div>
        </Rise>
      </div>

      {/* floating dashboard */}
      <ParallaxScene className="mx-auto mt-28 max-w-6xl pb-32 sm:mt-36">
        <div className="relative" style={{ perspective: 2000 }}>
          {/* grounding light beneath */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-16 bottom-16 top-24 -z-10 opacity-80 blur-3xl"
            style={{ background: "radial-gradient(60% 60% at 50% 45%, rgba(46,125,255,0.14), transparent 72%)" }}
          />

          <ParallaxLayer depth={20}>
            <motion.div
              initial={{ opacity: 0, y: 70, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 1.4, ease }}
              className="[transform-style:preserve-3d]"
            >
              {/* slow continuous float */}
              <motion.div
                animate={reduce ? undefined : { y: [0, -9, 0] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="origin-top shadow-[var(--shadow-float)] sm:[transform:perspective(2000px)_rotateX(7deg)]">
                  <ProductDashboard />
                </div>
              </motion.div>
            </motion.div>
          </ParallaxLayer>
        </div>
      </ParallaxScene>
    </section>
  );
}
