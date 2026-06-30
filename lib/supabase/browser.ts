"use client";

/**
 * Browser Supabase client (anon key, cookie-based session via @supabase/ssr).
 * Cookie storage lets the Next.js middleware read the session and gate routes
 * server-side. Used by the live store for reads, realtime and staff writes
 * (RLS = active staff member). A single instance per tab.
 */
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/config";

let client: SupabaseClient | null = null;

export function browserSupabase(): SupabaseClient {
  if (client) return client;
  client = createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    realtime: { params: { eventsPerSecond: 10 } },
  });
  return client;
}
