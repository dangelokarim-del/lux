"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { LuxaMark, buttonVariants } from "@/components/ui";
import { ProductDashboard } from "./ProductDashboard";
import { ParallaxScene, ParallaxLayer } from "./anim/Parallax";
import { CursorGlow } from "./anim/CursorGlow";
import { Magnetic } from "./anim/Magnetic";

const ease = [0.16, 1, 0.3, 1] as const;

/** Slow, premium fade + rise + blur-in, on a shared timeline. */
function Rise({ children, delay = 0, blur = 6 }: { children: React.ReactNode; delay?: number; blur?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 22, filter: `blur(${blur}px)` }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.2, ease, delay }}
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
        style={{ background: "radial-gradient(120% 90% at 50% 22%, transparent 58%, rgba(0,0,0,0.5))" }}
      />
      {/* very soft Vision-Pro light following the cursor */}
      <CursorGlow className="-z-10" size={680} color="rgba(255,255,255,0.035)" />
      <CursorGlow className="-z-10" size={420} color="rgba(46,125,255,0.05)" />

      <div className="mx-auto max-w-4xl text-center">
        {/* logo — 25% smaller, revealed letter by letter */}
        <LuxaMark intro className="mx-auto w-[min(435px,63vw)]" />

        {/* headline — larger, heavier, each line independent */}
        <h1 className="mt-16 text-balance font-semibold leading-[0.92] tracking-[-0.045em] text-white text-[clamp(3.4rem,11vw,7rem)]">
          <motion.span
            className="block"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease, delay: 0.6 }}
          >
            Luxury.
          </motion.span>
          <motion.span
            className="block"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease, delay: 0.82 }}
          >
            Automated.
          </motion.span>
        </h1>

        <Rise delay={1.2}>
          <p className="mx-auto mt-9 max-w-xl text-balance text-lg leading-relaxed text-white/65 sm:text-xl">
            The AI Operating System for Luxury Hospitality.
          </p>
        </Rise>

        <Rise delay={1.4}>
          <p className="mx-auto mt-3.5 max-w-md text-balance text-[15px] leading-relaxed text-white/35">
            The quiet infrastructure behind the world&apos;s most exclusive villas.
          </p>
        </Rise>

        <Rise delay={1.6}>
          <div className="mt-12">
            <Magnetic className="inline-block" strength={0.3}>
              <Link href="/login" className={buttonVariants({ variant: "accent", size: "lg" })}>
                Book a Demo
              </Link>
            </Magnetic>
          </div>
        </Rise>
      </div>

      {/* floating dashboard — fades up on the timeline at 2.0s */}
      <ParallaxScene className="mx-auto mt-28 max-w-6xl pb-32 sm:mt-36">
        <div className="relative" style={{ perspective: 2000 }}>
          {/* grounding light beneath */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-16 bottom-16 top-24 -z-10 opacity-80 blur-3xl"
            style={{ background: "radial-gradient(60% 60% at 50% 45%, rgba(46,125,255,0.14), transparent 72%)" }}
          />

          <ParallaxLayer depth={18}>
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 80, scale: 0.965 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 1.6, ease }}
              className="[transform-style:preserve-3d]"
            >
              {/* slow continuous float */}
              <motion.div
                animate={reduce ? undefined : { y: [0, -9, 0] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="origin-top shadow-[var(--shadow-dash)] sm:[transform:perspective(2000px)_rotateX(7deg)]">
                  <ProductDashboard animated introDelay={700} />
                </div>
              </motion.div>
            </motion.div>
          </ParallaxLayer>
        </div>
      </ParallaxScene>
    </section>
  );
}
