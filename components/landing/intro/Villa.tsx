"use client";

import { motion } from "framer-motion";

/**
 * A handcrafted, atmospheric modern-villa scene at dusk — built entirely from
 * layered light, form and reflection (no photos, no 3D assets). Soft warm
 * interior light through glass, a still infinity-pool reflection, drifting
 * palms, dusk haze. Composition fills the frame: sky · villa · pool · deck.
 *
 * The central glass bay sits at ~(50%, 48%) — the camera dollies into it.
 */
export function Villa() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#04050a]">
      {/* dusk sky */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: "62%",
          background:
            "linear-gradient(180deg,#05070e 0%,#070a13 40%,#0b0c14 66%,#181219 86%,#241823 100%)",
        }}
      />
      {/* horizon afterglow */}
      <div
        className="absolute inset-x-0"
        style={{
          top: "34%",
          height: "30%",
          background:
            "radial-gradient(70% 100% at 50% 100%, rgba(255,168,104,0.20), rgba(255,140,90,0.06) 45%, transparent 72%)",
        }}
      />
      {/* faint stars */}
      {[[14, 10], [28, 7], [46, 12], [63, 8], [78, 14], [88, 9], [36, 18], [70, 20]].map(([x, y], n) => (
        <span key={n} className="absolute h-px w-px rounded-full bg-white/40" style={{ left: `${x}%`, top: `${y}%`, opacity: 0.5 }} />
      ))}

      {/* ---- villa massing ---- */}
      {/* upper tier (set back, dimmer) */}
      <div className="absolute" style={{ left: "30%", right: "30%", top: "30%", height: "5%", background: "linear-gradient(180deg,#0c0e15,#070810)" }} />
      {[38, 58].map((x) => (
        <div key={x} className="absolute" style={{ left: `${x}%`, top: "31.5%", width: "5%", height: "2.6%", background: "linear-gradient(180deg,rgba(255,196,140,0.5),rgba(255,170,110,0.3))", filter: "blur(0.6px)" }} />
      ))}

      {/* roof slab */}
      <div className="absolute" style={{ left: "20%", right: "20%", top: "35%", height: "3.4%", background: "linear-gradient(180deg,#0e1118,#070810)", boxShadow: "0 1px 0 rgba(255,255,255,0.05) inset" }} />
      {/* warm under-eave wash */}
      <div className="absolute" style={{ left: "22%", right: "22%", top: "38%", height: "0.5%", background: "rgba(255,178,116,0.5)", filter: "blur(1px)" }} />

      {/* main floor — dark glass + warm interior */}
      <div className="absolute" style={{ left: "21%", right: "21%", top: "38.5%", height: "19.5%", background: "linear-gradient(180deg,#0a0c12 0%,#070810 100%)" }} />

      {/* soft warm interior glow behind glass (blurred, not a hard bar) */}
      <div
        className="pointer-events-none absolute"
        style={{ left: "16%", right: "16%", top: "37%", height: "24%", background: "radial-gradient(54% 60% at 50% 46%, rgba(255,176,112,0.5), rgba(255,150,92,0.14) 55%, transparent 78%)", filter: "blur(14px)" }}
      />

      {/* glass bays — three warm windows separated by dark structure */}
      <div className="absolute" style={{ left: "23%", right: "23%", top: "41.5%", height: "13.5%" }}>
        {[0, 1, 2].map((bay) => (
          <div
            key={bay}
            className="absolute top-0 bottom-0 overflow-hidden"
            style={{ left: `${bay * 34}%`, width: "32%" }}
          >
            {/* interior warmth, brighter low (floor lamps) */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(255,196,146,0.30) 0%, rgba(255,176,120,0.5) 62%, rgba(232,158,104,0.62) 100%)" }} />
            <div className="absolute inset-0" style={{ background: "radial-gradient(60% 50% at 50% 78%, rgba(255,228,196,0.55), transparent 72%)" }} />
            {/* faint interior silhouettes */}
            <div className="absolute bottom-[14%] left-[22%] h-[26%] w-[14%] rounded-sm" style={{ background: "rgba(40,26,14,0.4)" }} />
            <div className="absolute bottom-[14%] right-[20%] h-[34%] w-[10%]" style={{ background: "rgba(40,26,14,0.35)" }} />
            {/* floor line */}
            <div className="absolute inset-x-0 bottom-0 h-[8%]" style={{ background: "rgba(46,28,16,0.6)" }} />
          </div>
        ))}
        {/* mullions / structure between bays */}
        {[32, 66].map((x) => (
          <div key={x} className="absolute top-[-6%] bottom-[-6%]" style={{ left: `${x}%`, width: "2%", background: "linear-gradient(180deg,#0b0d13,#070810)" }} />
        ))}
      </div>

      {/* ---- infinity pool ---- */}
      <div className="absolute inset-x-[24%]" style={{ top: "57.6%", height: "1.5px", background: "linear-gradient(90deg,transparent,rgba(255,186,124,0.55),transparent)" }} />
      <div className="absolute inset-x-0" style={{ top: "58%", bottom: 0, background: "linear-gradient(180deg,#070910 0%,#05070d 45%,#03040a 100%)" }} />
      {/* reflection of the warm bays */}
      <motion.div
        className="absolute left-[26%] right-[26%]"
        style={{ top: "58.2%", height: "20%", background: "linear-gradient(180deg, rgba(255,176,116,0.42) 0%, rgba(210,142,94,0.16) 45%, transparent 100%)", filter: "blur(9px)", transformOrigin: "top" }}
        animate={{ scaleY: [1, 1.06, 1], opacity: [0.7, 0.95, 0.7] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {[64, 70, 78, 88].map((t, i) => (
        <motion.div
          key={t}
          className="absolute left-[24%] right-[24%]"
          style={{ top: `${t}%`, height: "1px", background: "rgba(255,196,150,0.14)" }}
          animate={{ opacity: [0.04, 0.2, 0.04], scaleX: [1, 1.05, 1] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }}
        />
      ))}

      {/* ---- palms (foreground) ---- */}
      <Palm className="left-[3%] bottom-[2%]" scale={1.25} delay={0} flip />
      <Palm className="right-[2%] bottom-[1%]" scale={1.45} delay={1.1} />

      {/* haze, vignette, light leak */}
      <div className="pointer-events-none absolute inset-x-0" style={{ top: "50%", height: "20%", background: "linear-gradient(180deg, rgba(255,180,120,0.05), transparent)", filter: "blur(8px)" }} />
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(125% 105% at 50% 46%, transparent 48%, rgba(0,0,0,0.72) 100%)" }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3" style={{ background: "radial-gradient(60% 100% at 62% 0%, rgba(255,168,108,0.05), transparent 70%)" }} />
    </div>
  );
}

function Palm({ className, delay = 0, scale = 1, flip = false }: { className?: string; delay?: number; scale?: number; flip?: boolean }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      style={{ transformOrigin: "bottom center", transform: `${flip ? "scaleX(-1) " : ""}scale(${scale})` }}
      animate={{ rotate: [0, 1.3, -0.5, 0] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <svg width="180" height="380" viewBox="0 0 180 380" fill="none" className="opacity-95">
        <path d="M90 380 C87 270 86 200 89 110" stroke="#03040a" strokeWidth="5.5" strokeLinecap="round" />
        {[-86, -56, -28, 8, 40, 72, 104].map((deg, i) => (
          <path key={i} d="M89 110 C112 80 150 64 180 62 C146 74 118 92 89 110Z" fill="#03040a" transform={`rotate(${deg} 89 110)`} />
        ))}
      </svg>
    </motion.div>
  );
}
