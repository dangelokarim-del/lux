"use client";

import { motion } from "framer-motion";

/**
 * One big calm statement. Reused across the site for the large
 * full-bleed editorial lines. Pass an optional eyebrow and an action.
 */
export function StatementSection({
  eyebrow,
  children,
  action,
  id,
}: {
  eyebrow?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="relative border-t border-line px-5 py-40 sm:py-56">
      <div className="mx-auto max-w-5xl text-center">
        {eyebrow && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="eyebrow mb-10"
          >
            {eyebrow}
          </motion.div>
        )}

        <motion.h2
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-balance text-[clamp(2.5rem,8.5vw,7rem)] font-semibold leading-[0.95] tracking-[-0.045em]"
        >
          {children}
        </motion.h2>

        {action && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-14"
          >
            {action}
          </motion.div>
        )}
      </div>
    </section>
  );
}
