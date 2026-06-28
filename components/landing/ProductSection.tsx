import Link from "next/link";
import { buttonVariants } from "@/components/ui";
import { Reveal } from "./Reveal";

const features = [
  { title: "Operations dashboard", desc: "Open tasks, urgent requests and check-ins — one live view." },
  { title: "Smart task routing", desc: "Every request assigned to the right team by role and load." },
  { title: "Guest request inbox", desc: "WhatsApp, email and calls captured and structured automatically." },
  { title: "Villa overview", desc: "Occupancy, arrivals and open work across the whole portfolio." },
];

export function ProductSection() {
  return (
    <section id="dashboard" className="relative border-t border-line px-5 py-32 sm:py-40">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <Reveal>
              <div className="eyebrow">The product</div>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
                A command center for
                <span className="chrome"> every property.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-md text-lg text-ink-2">
                Built for villa managers, concierge teams and owners who expect
                hotel-grade operations — without the hotel.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <Link href="/dashboard" className={`${buttonVariants({ variant: "accent", size: "lg" })} mt-8`}>
                Open live demo
              </Link>
            </Reveal>
          </div>

          <div className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.07}>
                <div className="panel-hover h-full bg-bg p-6">
                  <div className="mb-5 h-8 w-8 rounded-lg border border-line-2 bg-bg-elev" />
                  <h3 className="text-[15px] font-medium">{f.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
                    {f.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
