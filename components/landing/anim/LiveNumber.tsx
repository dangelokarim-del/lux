"use client";

import { useEffect, useRef, useState } from "react";

/** Rolls smoothly from its previous value to `value` whenever `value` changes. */
export function LiveNumber({
  value,
  pad = 2,
  duration = 1.1,
  className,
}: {
  value: number;
  pad?: number;
  duration?: number;
  className?: string;
}) {
  const [disp, setDisp] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      // ease-in-out cubic — a natural settle rather than an abrupt change
      const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      setDisp(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className={className}>{String(disp).padStart(pad, "0")}</span>;
}
