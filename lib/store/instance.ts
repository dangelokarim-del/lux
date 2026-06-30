/**
 * The singleton store instance. One per browser session (the demo's "database").
 * Survives client navigations; recreated on full reload.
 */
import { LuxaStore } from "./store";
import { createSeed } from "./seed";

declare global {
  // eslint-disable-next-line no-var
  var __luxaStore: LuxaStore | undefined;
}

export const store: LuxaStore = globalThis.__luxaStore ?? new LuxaStore(createSeed());
if (process.env.NODE_ENV !== "production") globalThis.__luxaStore = store;
