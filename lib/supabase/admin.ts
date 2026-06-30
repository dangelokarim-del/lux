import "server-only";

/**
 * Server-side Supabase client using the service-role key. Bypasses RLS — only
 * ever used by trusted server code (the WhatsApp webhook + the ingest pipeline).
 * Never import this into a client component.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/config";

let admin: SupabaseClient | null = null;

export function adminSupabase(): SupabaseClient {
  if (!serverEnv.supabaseUrl || !serverEnv.supabaseServiceKey) {
    throw new Error("Supabase admin not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  }
  if (admin) return admin;
  admin = createClient(serverEnv.supabaseUrl, serverEnv.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return admin;
}
