/**
 * The active data backend, chosen at runtime:
 *   • Supabase live store when the project is configured (real DB + realtime);
 *   • in-memory demo store otherwise (no infra required).
 * One instance per browser session.
 */
import { isLive } from "@/lib/config";
import { createWorkspaceSeed } from "./seed";
import { LuxaStore } from "./store";
import { SupabaseLiveStore } from "./supabase-store";
import type { OpsGateway } from "./gateway";

declare global {
  // eslint-disable-next-line no-var
  var __luxaStore: OpsGateway | undefined;
}

function createStore(): OpsGateway {
  return isLive() ? new SupabaseLiveStore() : new LuxaStore(createWorkspaceSeed());
}

export const store: OpsGateway = globalThis.__luxaStore ?? createStore();
if (process.env.NODE_ENV !== "production") globalThis.__luxaStore = store;
