"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function VillaShowcase() {
  return (
    <section className="px-5">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto mt-8 max-w-6xl sm:mt-12"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] border border-[#E7E3DA] shadow-[0_40px_90px_-50px_rgba(40,30,10,0.45)] sm:aspect-[16/9] sm:rounded-[36px]">
          {/* golden-hour sky */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg,#FDF1DD 0%,#F8E4C6 34%,#F0D2A8 56%,#E7C599 64%,#E9D6B6 70%,#Eadcc4 100%)",
            }}
          />
          {/* sun bloom */}
          <div
            className="absolute right-[18%] top-[14%] h-56 w-56 rounded-full opacity-90 blur-2xl"
            style={{ background: "radial-gradient(closest-side,#FFF7E8,transparent 70%)" }}
          />
          <div className="absolute right-[26%] top-[26%] h-16 w-16 rounded-full bg-[#FFFDF6] opacity-80 blur-md" />

          {/* calm sea / pool band with reflection */}
          <div
            className="absolute inset-x-0 bottom-0 h-[36%]"
            style={{ background: "linear-gradient(180deg,#E4CFA4 0%,#E9D9BC 40%,#EFE3CC 100%)" }}
          />
          <div className="absolute inset-x-0 bottom-[34%] h-px bg-[#D8BE8F]/60" />
          {[0.62, 0.55, 0.46].map((b, i) => (
            <div
              key={i}
              className="absolute inset-x-[12%] h-px bg-white/40"
              style={{ bottom: `${b * 36}%` }}
            />
          ))}

          {/* elegant palm fronds (abstract, tasteful) */}
          <svg
            className="absolute bottom-[30%] right-[7%] h-44 w-44 text-[#241d10] opacity-[0.16] sm:h-56 sm:w-56"
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden
          >
            <path d="M50 100 C50 70 50 50 50 34" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            {[-70, -40, -12, 16, 44, 72].map((deg, i) => (
              <path
                key={i}
                d="M50 34 C58 22 74 16 92 18 C76 22 64 30 50 34Z"
                fill="currentColor"
                transform={`rotate(${deg} 50 34)`}
              />
            ))}
          </svg>

          {/* modern villa terrace silhouette near horizon */}
          <div className="absolute bottom-[34%] left-[10%] h-10 w-40 rounded-t-md bg-[#caa974]/30 blur-[1px] sm:w-56" />
          <div className="absolute bottom-[34%] left-[16%] h-16 w-24 bg-[#b89a64]/20 blur-[1px] sm:h-20 sm:w-32" />

          {/* glass card overlay */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-5 left-5 right-5 max-w-[320px] rounded-[20px] border border-white/70 bg-white/55 p-5 shadow-[0_20px_50px_-20px_rgba(40,30,10,0.4)] backdrop-blur-xl sm:bottom-8 sm:left-8 sm:right-auto"
          >
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A9854A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A9854A]">
                LUXA
              </span>
            </div>
            <div className="mt-3 flex items-start gap-3">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#0E0E0F] text-white">
                <Check size={14} />
              </span>
              <div>
                <div className="text-[15px] font-medium text-[#0E0E0F]">Guest request received</div>
                <div className="text-[13px] text-[#6b6a70]">Beach club reservation</div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
