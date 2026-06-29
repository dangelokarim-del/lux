"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";

/* react-spline is heavy + WebGL — load it only on demand, client-only.
   Use the Next.js entry point (the bare "." export isn't webpack-resolvable). */
const Spline = dynamic(() => import("@splinetool/react-spline/next"), { ssr: false, loading: () => null });

/* the exported .splinecode URL (Spline → Export → Code/React).
   Set NEXT_PUBLIC_SPLINE_SCENE in the environment to go live with the 3D villa.
   While unset, the handcrafted CSS villa renders everywhere — nothing breaks. */
const SCENE_URL = process.env.NEXT_PUBLIC_SPLINE_SCENE;

class SplineBoundary extends Component<{ onFail: () => void; children: ReactNode }> {
  static getDerivedStateFromError() {
    return {};
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.props.children;
  }
}

/**
 * The hero stage: the Spline Marbella-villa scene when one is configured and the
 * session can afford it (desktop, motion allowed, WebGL ok) — otherwise the
 * handcrafted CSS villa `fallback`. The fallback also paints underneath until
 * Spline finishes loading, so there is never a blank frame.
 *
 * Spline drives ONLY the environment / hero object; all interactive overlays
 * stay in React, layered above this.
 */
export function SplineStage({ fallback, sceneUrl = SCENE_URL }: { fallback: ReactNode; sceneUrl?: string }) {
  const reduce = useReducedMotion();
  const [eligible, setEligible] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!sceneUrl || reduce) return;
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    // respect data-saver / very slow links
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const slow = conn?.saveData || /2g/.test(conn?.effectiveType ?? "");
    setEligible(desktop && !slow);
  }, [sceneUrl, reduce]);

  // no scene / not eligible / errored → pure CSS villa (verifiable everywhere)
  if (!sceneUrl || !eligible || failed) return <>{fallback}</>;

  return (
    <div className="absolute inset-0">
      {/* CSS villa underneath — fades out once the 3D scene is painted */}
      <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: ready ? 0 : 1 }}>
        {fallback}
      </div>
      <SplineBoundary onFail={() => setFailed(true)}>
        <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: ready ? 1 : 0 }}>
          <Spline scene={sceneUrl} onLoad={() => setReady(true)} style={{ width: "100%", height: "100%" }} />
        </div>
      </SplineBoundary>
    </div>
  );
}
