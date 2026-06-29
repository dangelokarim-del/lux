"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const steps = [
  { title: "Guest Message", note: "A request arrives by WhatsApp." },
  { title: "AI understands", note: "Intent, villa and urgency parsed." },
  { title: "Task Created", note: "Structured automatically." },
  { title: "Assigned", note: "Routed to the right team." },
  { title: "Completed", note: "Tracked and confirmed.", last: true },
];

export function ProductFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 65%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="how" className="relative px-5 py-32 sm:py-40">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="mb-20 text-center"
        >
          <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">How it works</div>
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-white sm:text-5xl">
            One message in.
            <br />
            A finished operation out.
          </h2>
        </motion.div>

        <div ref={ref} className="relative mx-auto max-w-md">
          {/* base rail */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.08]" />
          {/* drawn accent rail */}
          <motion.div
            style={{ scaleY: lineScale }}
            className="absolute left-[7px] top-2 bottom-2 w-px origin-top bg-gradient-to-b from-[#2E7DFF] to-[#2E7DFF]/30"
          />

          <div className="space-y-12">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, x: 8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease }}
                className="relative flex items-start gap-5 pl-0"
              >
                <span
                  className={`relative z-10 mt-1 grid h-[15px] w-[15px] shrink-0 place-items-center rounded-full border ${
                    s.last
                      ? "border-[#2E7DFF] bg-[#2E7DFF]"
                      : "border-white/20 bg-[#0A0A0C]"
                  }`}
                >
                  {s.last && (
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <div className="-mt-0.5">
                  <div className="text-lg font-medium tracking-tight text-white sm:text-xl">{s.title}</div>
                  <div className="mt-0.5 text-[14px] text-white/40">{s.note}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
