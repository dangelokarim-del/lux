import { Reveal } from "./Reveal";

const chaos = [
  "WhatsApp messages",
  "Phone calls",
  "Missed requests",
  "Manual coordination",
];

export function ProblemSection() {
  return (
    <section id="problem" className="relative border-t border-line px-5 py-32 sm:py-40">
      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <div className="eyebrow">The problem</div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl">
            Luxury hospitality still
            <br className="hidden sm:block" /> runs on chaos.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-lg text-balance text-lg text-ink-2">
            WhatsApp messages. Calls. Missed requests. Manual coordination.
            The most exclusive properties are run on the least reliable tools.
          </p>
        </Reveal>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          {chaos.map((c, i) => (
            <Reveal key={c} delay={0.15 + i * 0.07}>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.02] px-4 py-2 text-[14px] text-ink-2 line-through decoration-urgent/60">
                {c}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
