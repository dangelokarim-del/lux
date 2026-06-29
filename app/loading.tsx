import { LuxaMark } from "@/components/ui";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#050505]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[640px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 opacity-60 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(46,125,255,0.12), transparent 70%)" }}
      />
      <LuxaMark className="w-[min(360px,68vw)]" />
    </div>
  );
}
