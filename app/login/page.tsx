"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LuxaMark, Card, Field, Input, Button } from "@/components/ui";

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

      <Link href="/" aria-label="LUXA" className="absolute left-6 top-6">
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
          <form onSubmit={onSubmit} className="space-y-4 p-6">
            <Field label="Email" htmlFor="email">
              <Input id="email" type="email" required defaultValue="manager@luxa.app" placeholder="you@villa.com" />
            </Field>
            <Field label="Password" htmlFor="password">
              <Input id="password" type="password" required defaultValue="demo1234" placeholder="••••••••" />
            </Field>

            <Button type="submit" loading={loading} size="lg" className="w-full">
              {loading ? "Signing in…" : "Sign in"}
            </Button>

            <p className="text-center text-[12px] text-ink-3">
              Demo access — any credentials open the dashboard.
            </p>
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
