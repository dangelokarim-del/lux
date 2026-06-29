"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface IntroState {
  /** true once the film has finished (or was skipped / disabled). */
  done: boolean;
  /** whether the cinematic intro should play at all (decided client-side). */
  shouldRun: boolean | null;
  finish: () => void;
}

const Ctx = createContext<IntroState>({ done: true, shouldRun: false, finish: () => {} });

export function useIntro() {
  return useContext(Ctx);
}

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [shouldRun, setShouldRun] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let run = false;
    try {
      // dev toggle: ?film=1 force-replays the intro regardless of session/motion
      const force = new URLSearchParams(window.location.search).get("film") === "1";
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const played = sessionStorage.getItem("luxa_intro_played") === "1";
      run = force || (!reduce && !played);
    } catch {
      run = false;
    }
    setShouldRun(run);
    if (!run) setDone(true);
  }, []);

  const finish = () => {
    try {
      sessionStorage.setItem("luxa_intro_played", "1");
    } catch {}
    setDone(true);
  };

  return <Ctx.Provider value={{ done, shouldRun, finish }}>{children}</Ctx.Provider>;
}
