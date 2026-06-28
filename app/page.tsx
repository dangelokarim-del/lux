import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { StatementSection } from "@/components/landing/StatementSection";
import { FlowSection } from "@/components/landing/FlowSection";
import { DashboardShowcase } from "@/components/landing/DashboardShowcase";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="relative">
      <Nav />

      {/* 1 — Hero with floating dashboard */}
      <Hero />

      {/* 2 — Statement */}
      <StatementSection id="problem" eyebrow="The problem">
        Luxury hospitality
        <br />
        still runs on <span className="text-ink-3">chaos.</span>
      </StatementSection>

      {/* 3 — Product flow */}
      <FlowSection />

      {/* 4 — Dashboard showcase */}
      <DashboardShowcase />

      {/* 5 — Statement */}
      <StatementSection>
        Every request.
        <br />
        <span className="chrome">Under control.</span>
      </StatementSection>

      {/* 6 — Final CTA */}
      <CTASection />

      <Footer />
    </main>
  );
}
