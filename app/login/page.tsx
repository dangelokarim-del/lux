"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // mock auth — no backend
    setTimeout(() => router.push("/dashboard"), 650);
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5">
      <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0 -z-20 opacity-50" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[360px] w-[620px] -translate-x-1/2 glow-accent blur-3xl opacity-60" />

      <Link href="/" className="absolute left-6 top-6">
        <Logo />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[380px]"
      >
        <div className="text-center">
          <div className="eyebrow">Welcome back</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">
            Sign in to LUXA
          </h1>
          <p className="mt-2 text-[14px] text-ink-2">
            Luxury. Automated.
          </p>
        </div>

        <form onSubmit={onSubmit} className="panel mt-8 space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-[12px] text-ink-2">Email</label>
            <input
              type="email"
              required
              defaultValue="manager@luxa.app"
              className="w-full rounded-[10px] border border-line-2 bg-bg-elev px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-4 focus:border-accent"
              placeholder="you@villa.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-ink-2">Password</label>
            <input
              type="password"
              required
              defaultValue="demo1234"
              className="w-full rounded-[10px] border border-line-2 bg-bg-elev px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-4 focus:border-accent"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-accent w-full py-3 text-[14px]">
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-center text-[12px] text-ink-3">
            Demo access — any credentials open the dashboard.
          </p>
        </form>

        <p className="mt-6 text-center text-[13px] text-ink-3">
          Don&apos;t have access?{" "}
          <Link href="/" className="text-accent hover:underline">
            Book a demo
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
