import { SiteHeader } from "@/components/landing/SiteHeader";
import { Hero } from "@/components/landing/Hero";
import { Statement } from "@/components/landing/Statement";
import { ProductFlow } from "@/components/landing/ProductFlow";
import { DashboardShowcase } from "@/components/landing/DashboardShowcase";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { IntroProvider } from "@/components/landing/intro/IntroContext";
import { CinematicIntro } from "@/components/landing/intro/CinematicIntro";

export default function LandingPage() {
  return (
    <IntroProvider>
      <div aria-hidden className="fixed inset-0 -z-50 bg-[#050505]" />

      {/* cinematic opening film — plays once, then rests on the product */}
      <CinematicIntro />

      <main className="relative min-h-screen bg-[#050505] text-white antialiased">
        <SiteHeader />

        {/* 1 — Hero with floating dashboard */}
        <Hero />

        {/* 2 — Problem */}
        <Statement eyebrow="The problem">
          Luxury hospitality still
          <br />
          runs on <span className="text-white/35">WhatsApp.</span>
        </Statement>

        {/* 3 — Product flow */}
        <ProductFlow />

        {/* 4 — Dashboard showcase */}
        <DashboardShowcase />

        {/* 5 — Payoff statement */}
        <Statement>
          Every request.
          <br />
          <span className="chrome">Under control.</span>
        </Statement>

        {/* 6 — Final CTA */}
        <FinalCTA />

        <SiteFooter />
      </main>
    </IntroProvider>
  );
}
