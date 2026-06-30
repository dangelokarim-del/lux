"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LuxaMark, buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Magnetic } from "./anim/Magnetic";

const links = [
  { label: "Product", href: "#product" },
  { label: "About", href: "#footer" },
];

function NavLink({ label, href }: { label: string; href: string }) {
  return (
    <a href={href} className="group relative py-1 text-white/55 transition-colors duration-300 hover:text-white">
      {label}
      <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-white/60 transition-transform duration-300 ease-[var(--ease-premium)] group-hover:scale-x-100" />
    </a>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[var(--ease-premium)]",
        scrolled ? "border-b border-white/[0.06] bg-[#070708]/70 backdrop-blur-2xl saturate-150" : "border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="LUXA" className="transition-opacity duration-300 hover:opacity-80">
          <LuxaMark className="h-[26px] w-auto" />
        </Link>

        <nav className="hidden items-center gap-10 text-[14px] md:flex">
          {links.map((l) => (
            <NavLink key={l.label} {...l} />
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden text-[14px] text-white/55 transition-colors duration-300 hover:text-white sm:block">
            Sign in
          </Link>
          <Magnetic className="inline-block" strength={0.2}>
            <Link href="/login" className={buttonVariants({ variant: "accent", size: "sm" })}>
              Book a Demo
            </Link>
          </Magnetic>
        </div>
      </div>
    </header>
  );
}
