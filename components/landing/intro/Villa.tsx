"use client";

import { motion } from "framer-motion";

/**
 * Handcrafted, atmospheric modern-villa scene at dusk — layered light, form
 * and reflection only (no photos, no 3D). Darker night mood, warm interior
 * light through glass, a still infinity-pool reflection, drifting palms, depth.
 *
 * `lit` softly illuminates the upper-floor "issue" window (~58%, 31%) — the
 * camera dollies toward it.
 */
export function Villa({ lit = false }: { lit?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020306]">
      {/* deep dusk sky */}
      <div
        className="absolute inset-x-0 top-0"
        style={{ height: "63%", background: "linear-gradient(180deg,#03040a 0%,#05070e 42%,#080913 66%,#130e17 88%,#1d1320 100%)" }}
      />
      {/* low horizon afterglow */}
      <div
        className="absolute inset-x-0"
        style={{ top: "36%", height: "28%", background: "radial-gradient(72% 100% at 50% 100%, rgba(255,150,92,0.16), rgba(255,128,80,0.05) 46%, transparent 72%)" }}
      />
      {[[12, 9], [26, 6], [44, 11], [60, 7], [74, 13], [86, 8], [34, 17], [68, 19], [20, 22]].map(([x, y], n) => (
        <span key={n} className="absolute h-px w-px rounded-full bg-white/35" style={{ left: `${x}%`, top: `${y}%` }} />
      ))}

      {/* receding side wing (depth) */}
      <div className="absolute" style={{ left: "70%", right: "12%", top: "41%", height: "15%", background: "linear-gradient(180deg,#070912,#04050b)", transform: "skewX(-12deg)", opacity: 0.85 }} />
      <div className="absolute" style={{ left: "72%", right: "16%", top: "44%", height: "6%", background: "linear-gradient(180deg,rgba(255,168,108,0.22),rgba(255,150,92,0.06))", filter: "blur(2px)", transform: "skewX(-12deg)" }} />

      {/* ---- villa massing ---- */}
      {/* upper tier */}
      <div className="absolute" style={{ left: "31%", right: "31%", top: "29.5%", height: "5.4%", background: "linear-gradient(180deg,#0a0c14,#05060d)", boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }} />
      {/* upper windows */}
      <div className="absolute" style={{ left: "37%", top: "31%", width: "4%", height: "2.7%", background: "linear-gradient(180deg,rgba(255,190,134,0.4),rgba(255,166,108,0.24))", filter: "blur(0.5px)" }} />
      {/* the issue window (upper-floor) */}
      <motion.div
        className="absolute"
        style={{ left: "56%", top: "30.6%", width: "4.4%", height: "3.4%" }}
        animate={{ opacity: lit ? 1 : 0.55 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(255,214,168,0.95),rgba(255,180,120,0.7))" }} />
        <motion.div
          className="absolute -inset-[140%]"
          style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(255,196,140,0.55), transparent 70%)", filter: "blur(10px)" }}
          animate={{ opacity: lit ? 1 : 0.25 }}
          transition={{ duration: 0.9 }}
        />
      </motion.div>

      {/* roof slab */}
      <div className="absolute" style={{ left: "19%", right: "19%", top: "34.7%", height: "3.4%", background: "linear-gradient(180deg,#0c0f16,#05060d)", boxShadow: "0 1px 0 rgba(255,255,255,0.045) inset" }} />
      <div className="absolute" style={{ left: "21%", right: "21%", top: "38%", height: "0.45%", background: "rgba(255,170,108,0.45)", filter: "blur(1px)" }} />

      {/* main floor */}
      <div className="absolute" style={{ left: "20%", right: "20%", top: "38.4%", height: "19.6%", background: "linear-gradient(180deg,#080a11 0%,#05060d 100%)" }} />

      {/* warm interior glow (soft, blurred) */}
      <div className="pointer-events-none absolute" style={{ left: "15%", right: "15%", top: "37%", height: "24%", background: "radial-gradient(54% 60% at 50% 48%, rgba(255,164,100,0.46), rgba(255,140,84,0.12) 56%, transparent 78%)", filter: "blur(15px)" }} />

      {/* glass bays */}
      <div className="absolute" style={{ left: "22%", right: "22%", top: "41.4%", height: "13.6%" }}>
        {[0, 1, 2].map((bay) => (
          <div key={bay} className="absolute top-0 bottom-0 overflow-hidden" style={{ left: `${bay * 34}%`, width: "32%" }}>
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(255,186,134,0.26) 0%, rgba(255,164,108,0.46) 64%, rgba(226,146,92,0.6) 100%)" }} />
            <div className="absolute inset-0" style={{ background: "radial-gradient(60% 50% at 50% 80%, rgba(255,222,186,0.5), transparent 72%)" }} />
            {/* glass sheen */}
            <div className="absolute inset-y-0 left-[10%] w-[14%]" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.1), transparent)" }} />
            {/* interior silhouettes */}
            <div className="absolute bottom-[14%] left-[24%] h-[24%] w-[12%] rounded-[1px]" style={{ background: "rgba(34,22,12,0.45)" }} />
            <div className="absolute bottom-[14%] right-[22%] h-[34%] w-[8%]" style={{ background: "rgba(34,22,12,0.4)" }} />
            <div className="absolute inset-x-0 bottom-0 h-[8%]" style={{ background: "rgba(40,24,14,0.6)" }} />
          </div>
        ))}
        {[32, 66].map((x) => (
          <div key={x} className="absolute top-[-6%] bottom-[-6%]" style={{ left: `${x}%`, width: "1.8%", background: "linear-gradient(180deg,#090b12,#05060d)" }} />
        ))}
      </div>

      {/* ---- infinity pool ---- */}
      <div className="absolute inset-x-[24%]" style={{ top: "57.6%", height: "1.5px", background: "linear-gradient(90deg,transparent,rgba(255,174,116,0.55),transparent)" }} />
      <div className="absolute inset-x-0" style={{ top: "58%", bottom: 0, background: "linear-gradient(180deg,#05070e 0%,#04050b 45%,#020308 100%)" }} />
      {/* mirrored warm bays */}
      <motion.div
        className="absolute left-[27%] right-[27%]"
        style={{ top: "58.3%", height: "19%", background: "linear-gradient(180deg, rgba(255,164,108,0.4) 0%, rgba(206,138,90,0.15) 46%, transparent 100%)", filter: "blur(8px)", transformOrigin: "top" }}
        animate={{ scaleY: [1, 1.05, 1], opacity: [0.68, 0.92, 0.68] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      {[0, 1, 2].map((bay) => (
        <motion.div
          key={bay}
          className="absolute"
          style={{ left: `${30 + bay * 14}%`, width: "10%", top: "58.4%", height: "12%", background: "linear-gradient(180deg, rgba(255,180,120,0.34), transparent)", filter: "blur(5px)" }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 6 + bay, repeat: Infinity, ease: "easeInOut", delay: bay * 0.5 }}
        />
      ))}
      {[64, 71, 80, 90].map((t, i) => (
        <motion.div
          key={t}
          className="absolute left-[24%] right-[24%]"
          style={{ top: `${t}%`, height: "1px", background: "rgba(255,188,140,0.13)" }}
          animate={{ opacity: [0.04, 0.18, 0.04], scaleX: [1, 1.05, 1] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }}
        />
      ))}

      {/* foreground deck */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: "12%", background: "linear-gradient(180deg,transparent,#010205)" }} />

      {/* palms (foreground) */}
      <Palm className="left-[2%] bottom-[1%]" scale={1.35} delay={0} flip />
      <Palm className="right-[1%] bottom-0" scale={1.5} delay={1.1} />

      {/* haze, vignette, leak */}
      <div className="pointer-events-none absolute inset-x-0" style={{ top: "50%", height: "20%", background: "linear-gradient(180deg, rgba(255,168,108,0.045), transparent)", filter: "blur(8px)" }} />
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(128% 108% at 50% 44%, transparent 46%, rgba(0,0,0,0.76) 100%)" }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3" style={{ background: "radial-gradient(60% 100% at 60% 0%, rgba(255,160,104,0.045), transparent 70%)" }} />
    </div>
  );
}

function Palm({ className, delay = 0, scale = 1, flip = false }: { className?: string; delay?: number; scale?: number; flip?: boolean }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      style={{ transformOrigin: "bottom center", transform: `${flip ? "scaleX(-1) " : ""}scale(${scale})` }}
      animate={{ rotate: [0, 1.2, -0.5, 0] }}
      transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <svg width="180" height="380" viewBox="0 0 180 380" fill="none" className="opacity-95">
        <path d="M90 380 C87 270 86 200 89 110" stroke="#020308" strokeWidth="5.5" strokeLinecap="round" />
        {[-86, -56, -28, 8, 40, 72, 104].map((deg, i) => (
          <path key={i} d="M89 110 C112 80 150 64 180 62 C146 74 118 92 89 110Z" fill="#020308" transform={`rotate(${deg} 89 110)`} />
        ))}
      </svg>
    </motion.div>
  );
}
