import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { FlowSection } from "@/components/landing/FlowSection";
import { ProductSection } from "@/components/landing/ProductSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <ProblemSection />
      <FlowSection />
      <ProductSection />
      <CTASection />
      <Footer />
    </main>
  );
}
