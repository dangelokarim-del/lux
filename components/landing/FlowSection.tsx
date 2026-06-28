"use client";

import { motion } from "framer-motion";

const steps = [
  "Guest Message",
  "AI Understands",
  "Task Created",
  "Team Assigned",
  "Dashboard Updated",
  "Completed",
];

const ease = [0.16, 1, 0.3, 1] as const;

export function FlowSection() {
  return (
    <section id="flow" className="relative border-t border-line px-5 py-32 sm:py-44">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="eyebrow">How it works</div>
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-6xl">
            From message to done.
          </h2>
        </motion.div>

        {/* desktop — horizontal stepper */}
        <div className="relative mt-24 hidden sm:block">
          <div className="absolute inset-x-0 top-[5px] h-px bg-line" />
          <div className="grid grid-cols-6">
            {steps.map((s, i) => {
              const last = i === steps.length - 1;
              return (
                <motion.div
                  key={s}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease }}
                  className="relative flex flex-col items-center px-2 text-center"
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full shadow-[0_0_0_5px_var(--color-bg)] ${
                      last ? "bg-accent" : "bg-ink-4"
                    }`}
                  />
                  <span className="mt-6 font-mono text-[11px] text-ink-4">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`mt-2 text-[15px] font-medium tracking-tight ${
                      last ? "text-ink" : "text-ink-2"
                    }`}
                  >
                    {s}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* mobile — vertical timeline */}
        <div className="mt-16 sm:hidden">
          {steps.map((s, i) => {
            const last = i === steps.length - 1;
            return (
              <motion.div
                key={s}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.06, ease }}
                className="relative flex gap-5 pb-9 last:pb-0"
              >
                <div className="relative flex flex-col items-center">
                  <span className={`h-2.5 w-2.5 rounded-full ${last ? "bg-accent" : "bg-ink-4"}`} />
                  {!last && <span className="mt-1 w-px flex-1 bg-line" />}
                </div>
                <div className="-mt-1">
                  <div className="font-mono text-[11px] text-ink-4">{String(i + 1).padStart(2, "0")}</div>
                  <div className={`mt-1 text-lg font-medium tracking-tight ${last ? "text-ink" : "text-ink-2"}`}>
                    {s}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
