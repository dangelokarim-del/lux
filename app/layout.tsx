import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUXA — Luxury. Automated.",
  description:
    "The AI Operating System for luxury hospitality. Every guest request becomes an organized operation.",
  metadataBase: new URL("https://luxa.app"),
  openGraph: {
    title: "LUXA — Luxury. Automated.",
    description: "The AI Operating System for luxury hospitality.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // inline deep blue-black so the very first paint is branded, never a black
    // flash — even before the CSS bundle loads (render-blocking). The hero's
    // villa poster then resolves over it.
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} style={{ backgroundColor: "#05070c" }}>
      <body className="min-h-screen bg-bg text-ink antialiased" style={{ backgroundColor: "#05070c" }}>
        {children}
      </body>
    </html>
  );
}
