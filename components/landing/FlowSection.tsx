import { Reveal } from "./Reveal";
import { flowSteps } from "@/lib/data";

export function FlowSection() {
  return (
    <section id="flow" className="relative border-t border-line px-5 py-32 sm:py-40">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <Reveal>
            <div className="eyebrow">How it works</div>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
              One message in.
              <br />
              A finished operation out.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-md text-lg text-ink-2">
              LUXA turns an unstructured request into a tracked, assigned and
              completed task — without anyone touching a spreadsheet.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {flowSteps.map((step, i) => (
            <Reveal key={step.k} delay={i * 0.06}>
              <div className="panel-hover group relative h-full bg-bg p-7">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] text-ink-4">{step.k}</span>
                  {i < flowSteps.length - 1 && (
                    <span className="text-ink-4 transition-colors group-hover:text-accent">
                      →
                    </span>
                  )}
                </div>
                <h3 className="mt-8 text-xl font-medium tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
                  {step.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
