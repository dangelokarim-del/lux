import Link from "next/link";
import { Reveal } from "./Reveal";

export function CTASection() {
  return (
    <section className="relative overflow-hidden border-t border-line px-5 py-36 sm:py-44">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 glow-accent blur-3xl opacity-70" />
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <h2 className="text-balance text-5xl font-semibold leading-[1.0] tracking-[-0.04em] sm:text-7xl">
            Luxury.
            <span className="chrome"> Automated.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mx-auto mt-6 max-w-md text-lg text-ink-2">
            See how LUXA runs your properties in a 20-minute private demo.
          </p>
        </Reveal>
        <Reveal delay={0.14}>
          <div className="mt-9 flex items-center justify-center gap-3">
            <Link href="/login" className="btn-accent px-7 py-3.5 text-[15px]">
              Book a Demo
            </Link>
            <Link href="/dashboard" className="btn-ghost px-7 py-3.5 text-[15px]">
              Explore the dashboard
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
