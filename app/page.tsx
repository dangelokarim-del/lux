import { SiteHeader } from "@/components/landing/SiteHeader";
import { VideoHero } from "@/components/landing/VideoHero";
import { ProductDemo } from "@/components/landing/ProductDemo";
import { LiveDashboard } from "@/components/landing/LiveDashboard";
import { Integrations } from "@/components/landing/Integrations";
import { Benefits } from "@/components/landing/Benefits";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { Atmosphere } from "@/components/landing/anim/Atmosphere";

export default function LandingPage() {
  return (
    <>
      {/* Preload the villa poster so the hero's first frame is the villa itself —
          never a black flash or empty container (React 19 hoists this to <head>). */}
      <link rel="preload" as="image" href="/hero/villa-poster.jpg" fetchPriority="high" />

      {/* ONE shared deep blue-black background for the whole landing page, so the
          scroll reads as a single continuous cinematic sequence — never separate
          slides or sudden black blocks. */}
      <div
        aria-hidden
        className="fixed inset-0 -z-50"
        style={{ background: "radial-gradient(135% 115% at 50% 2%, #0a1322 0%, #06090f 44%, #04060a 76%, #03060a 100%)" }}
      />
      <Atmosphere />

      <main className="relative min-h-screen text-white antialiased">
        <SiteHeader />

        {/* 1 — Video hero → the problem statement emerges from the darkening
            film inside the same screen (one continuous beat, no separate page). */}
        <VideoHero />

        {/* 2 — The product demo: five cards light up one by one, then the guest
            message drifts up into the dashboard below. */}
        <ProductDemo />

        {/* 3 — The live operations dashboard solves the request in real time. */}
        <LiveDashboard />

        {/* 4 — Fits the stack the team already runs. */}
        <Integrations />

        {/* 5 — The proof, in four large numbers. */}
        <Benefits />

        {/* 5 — Final CTA — the natural ending of the same story. */}
        <FinalCTA />

        <SiteFooter />
      </main>
    </>
  );
}
