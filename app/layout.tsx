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
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
