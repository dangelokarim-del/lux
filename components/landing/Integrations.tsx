"use client";

import { motion } from "framer-motion";

const ease = [0.4, 0, 0.2, 1] as const;

const TOOLS = ["WhatsApp", "Airbnb", "Booking.com", "Guesty", "Hostaway", "Google Calendar", "Stripe"];

/* ------------------------------------------------------------------ *
 *  Integrations — quiet reassurance that LUXA fits the stack a luxury
 *  team already runs. Monochrome badges, no colourful logos.
 * ------------------------------------------------------------------ */
export function Integrations() {
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 22, filter: "blur(7px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease }}
          className="text-balance text-[clamp(1.6rem,4vw,2.6rem)] font-semibold leading-tight tracking-[-0.035em] text-white"
        >
          Works with the tools your team already uses.
        </motion.h2>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5 sm:mt-14 sm:gap-3">
          {TOOLS.map((t, i) => (
            <motion.span
              key={t}
              initial={{ opacity: 0, y: 14, filter: "blur(5px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, delay: i * 0.07, ease }}
              className="rounded-full border border-white/[0.12] bg-white/[0.03] px-5 py-2.5 text-[14px] font-medium text-white/70 transition-colors duration-300 hover:border-white/25 hover:text-white sm:text-[15px]"
            >
              {t}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
