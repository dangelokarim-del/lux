import { LuxaMark } from "@/components/ui";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#050505]">
      <LuxaMark className="w-[min(340px,66vw)]" />
    </div>
  );
}
