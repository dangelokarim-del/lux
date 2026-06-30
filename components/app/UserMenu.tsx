"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { Avatar } from "@/components/ui";
import { isLive } from "@/lib/config";

/**
 * Header account control. In live mode it shows the signed-in staff member and a
 * sign-out action; in demo mode it's a static avatar (no auth backend).
 */
export function UserMenu({ size = 36 }: { size?: number }) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isLive()) return;
    let active = true;
    import("@/lib/supabase/browser").then(({ browserSupabase }) => {
      const sb = browserSupabase();
      sb.auth.getUser().then(({ data }) => active && setEmail(data.user?.email ?? null));
      const { data: sub } = sb.auth.onAuthStateChange((_e, session) => active && setEmail(session?.user?.email ?? null));
      return () => sub.subscription.unsubscribe();
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const name = email ? email.split("@")[0].replace(/[._]/g, " ") : "Operator";

  async function signOut() {
    setBusy(true);
    const { browserSupabase } = await import("@/lib/supabase/browser");
    await browserSupabase().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  // Demo mode: no auth, just an avatar.
  if (!isLive()) return <Avatar name="Operator" size={size} />;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="focus-ring rounded-full transition-opacity hover:opacity-90"
        aria-label="Account"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={name} size={size} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            role="menu"
            className="absolute right-0 z-50 mt-2 w-[220px] overflow-hidden rounded-xl border border-line-2 bg-bg-elev shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)]"
          >
            <div className="border-b border-line px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.12em] text-ink-4">Signed in</div>
              <div className="mt-0.5 truncate text-[13px] text-ink">{email ?? "—"}</div>
            </div>
            <button
              onClick={signOut}
              disabled={busy}
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] text-ink-2 transition-colors hover:bg-white/[0.04] hover:text-ink disabled:opacity-50"
            >
              <LogOut size={15} className="text-ink-3" />
              {busy ? "Signing out…" : "Sign out"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
