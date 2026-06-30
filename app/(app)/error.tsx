"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[luxa] dashboard error", error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center px-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-[14px] border border-line bg-bg-elev text-urgent">
          <RotateCw size={20} />
        </div>
        <h1 className="mt-5 text-[17px] font-medium text-ink">Something interrupted operations</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-3">
          The dashboard hit an unexpected error. Your data is safe — reloading usually clears it.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2.5">
          <Button onClick={reset} variant="accent" size="md">
            <RotateCw size={15} /> Try again
          </Button>
          <Button onClick={() => window.location.reload()} variant="secondary" size="md">
            Reload page
          </Button>
        </div>
        {error.digest && <p className="mt-4 font-mono text-[11px] text-ink-4">ref {error.digest}</p>}
      </div>
    </div>
  );
}
