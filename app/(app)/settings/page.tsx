"use client";

import { Topbar } from "@/components/app/Topbar";
import { SettingsWorkspace } from "@/components/product/SettingsWorkspace";
import { useSettings } from "@/lib/store/hooks";

export default function SettingsPage() {
  const settings = useSettings();
  return (
    <>
      <Topbar title="Settings" subtitle={`${settings.portfolioName} · configure your operation`} />
      <SettingsWorkspace />
    </>
  );
}
