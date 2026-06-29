import { SiteHeader } from "@/components/landing/SiteHeader";
import { Hero } from "@/components/landing/Hero";
import { VillaShowcase } from "@/components/landing/VillaShowcase";
import { TrustedBy } from "@/components/landing/TrustedBy";
import { Features } from "@/components/landing/Features";
import { ClosingCTA } from "@/components/landing/ClosingCTA";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function LandingPage() {
  return (
    <>
      {/* light theme — overrides the dark global body for the marketing site */}
      <div aria-hidden className="fixed inset-0 -z-50 bg-[#FAF9F6]" />

      <main className="relative min-h-screen bg-[#FAF9F6] text-[#0E0E0F] antialiased">
        <SiteHeader />
        <Hero />
        <VillaShowcase />
        <TrustedBy />
        <Features />
        <ClosingCTA />
        <SiteFooter />
      </main>
    </>
  );
}
