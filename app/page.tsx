import { SiteHeader } from "@/components/landing/SiteHeader";
import { VideoHero } from "@/components/landing/VideoHero";
import { Statement } from "@/components/landing/Statement";
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

        {/* 1 — Video hero: the villa at blue hour; the film darkens into the dark
            background as you scroll, so the problem below emerges from it. */}
        <VideoHero />

        {/* 2 — The problem, emerging from the same darkened atmosphere (no hard
            cut, no black page). Huge, elegant, dramatic. */}
        <div className="relative">
          {/* faint blue-hour residual at the seam — the video's colour fading down
              into the dark, bridging hero → problem so there is no colour jump */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70vh]"
            style={{ background: "radial-gradient(72% 60% at 50% 0%, rgba(46,110,200,0.07), transparent 72%)" }}
          />
          <Statement tall>
            Luxury hospitality
            <br />
            still runs on <span className="text-white/35">WhatsApp.</span>
          </Statement>
        </div>

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
