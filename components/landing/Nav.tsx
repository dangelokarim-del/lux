"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

export function Nav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2 rounded-full border border-line bg-black/40 px-4 py-2 backdrop-blur-xl">
          <Logo />
        </div>

        <nav className="hidden items-center gap-8 rounded-full border border-line bg-black/40 px-7 py-2.5 text-[13px] text-ink-2 backdrop-blur-xl md:flex">
          <a href="#problem" className="transition-colors hover:text-ink">Problem</a>
          <a href="#flow" className="transition-colors hover:text-ink">How it works</a>
          <a href="#dashboard" className="transition-colors hover:text-ink">Product</a>
        </nav>

        <div className="flex items-center gap-2 rounded-full border border-line bg-black/40 p-1 pl-4 backdrop-blur-xl">
          <Link href="/login" className="hidden text-[13px] text-ink-2 transition-colors hover:text-ink sm:block">
            Sign in
          </Link>
          <Link href="/login" className="btn-accent px-4 py-2 text-[13px]">
            Book a Demo
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
