"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LuxaMark, Card, Field, Input, Button } from "@/components/ui";
import { isLive } from "@/lib/config";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      if (isLive()) {
        // real Supabase email/password auth (cookie session → middleware)
        const { browserSupabase } = await import("@/lib/supabase/browser");
        const { error: authError } = await browserSupabase().auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      }
      router.replace(next.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't sign you in. Check your details and try again.");
      setLoading(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5">
      <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0 -z-20 opacity-50" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[360px] w-[620px] -translate-x-1/2 glow-accent blur-3xl opacity-60" />

      <Link href="/" aria-label="LUXA" className="focus-ring absolute left-6 top-6 rounded-md">
        <LuxaMark className="h-[24px] w-auto" />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[380px]"
      >
        <div className="text-center">
          <LuxaMark className="mx-auto w-[160px]" />
          <h1 className="mt-7 text-2xl font-semibold tracking-[-0.03em]">Sign in</h1>
          <p className="mt-2 text-[14px] text-ink-2">Luxury. Automated.</p>
        </div>

        <Card className="mt-8">
          <form onSubmit={onSubmit} className="space-y-4 p-6" noValidate>
            <Field label="Email" htmlFor="email">
              <Input id="email" name="email" type="email" required autoComplete="email" autoFocus placeholder="you@villa.com" />
            </Field>
            <Field label="Password" htmlFor="password">
              <Input id="password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" />
            </Field>

            <AnimatePresence initial={false}>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-[var(--radius-control)] border border-[rgba(255,92,92,0.3)] bg-[rgba(255,92,92,0.08)] px-3 py-2 text-[12.5px] text-urgent"
                  role="alert"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <Button type="submit" loading={loading} size="lg" className="w-full">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Card>

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
