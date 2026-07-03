import { Sidebar } from "@/components/app/Sidebar";
import { MobileNav } from "@/components/app/MobileNav";
import { ToastProvider } from "@/components/product/Toast";
import { AiManager } from "@/components/product/AiManager";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div
        className="flex min-h-screen"
        style={{ background: "radial-gradient(130% 90% at 50% -8%, #0c0e13 0%, #060608 46%, #030304 100%)" }}
      >
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col pb-16 lg:pb-0">{children}</div>
        <MobileNav />
        {/* the always-on AI presence, on every screen */}
        <AiManager />
      </div>
    </ToastProvider>
  );
}
