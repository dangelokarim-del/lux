"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo, buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";

const links = [
  { label: "Product", href: "#product" },
  { label: "Solutions", href: "#how" },
  { label: "About", href: "#footer" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled ? "border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl" : "border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-9 text-[14px] text-white/55 md:flex">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-[14px] text-white/55 transition-colors hover:text-white sm:block">
            Sign in
          </Link>
          <Link href="/login" className={buttonVariants({ variant: "accent", size: "sm" })}>
            Book a Demo
          </Link>
        </div>
      </div>
    </header>
  );
}
