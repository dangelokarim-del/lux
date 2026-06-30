"use client";

/**
 * Browser Supabase client (anon key). Used by the live store for reads,
 * realtime subscriptions and authenticated staff writes (RLS = authenticated).
 * A single instance per tab.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/config";

let client: SupabaseClient | null = null;

export function browserSupabase(): SupabaseClient {
  if (client) return client;
  client = createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
    realtime: { params: { eventsPerSecond: 10 } },
  });
  return client;
}
