import { SiteHeader } from "@/components/landing/SiteHeader";
import { VideoHero } from "@/components/landing/VideoHero";
import { OperationsStory } from "@/components/landing/OperationsStory";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { Atmosphere } from "@/components/landing/anim/Atmosphere";

export default function LandingPage() {
  return (
    <>
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

        {/* 1 — Video hero → 2 — the problem statement emerges from the darkening
            film inside the same screen (one continuous beat, no separate page). */}
        <VideoHero />

        {/* 3 — The request becomes intelligence → live operations dashboard, one
            continuous vertical sequence connected by an electric-blue thread. */}
        <OperationsStory />

        {/* 4 — Final CTA — the natural ending of the same story. */}
        <FinalCTA />

        <SiteFooter />
      </main>
    </>
  );
}
