import "server-only";

/**
 * Server-side Supabase client bound to the request cookies (anon key, RLS
 * applies). Use in Server Components / Route Handlers to read the current staff
 * session. The service-role client (admin.ts) is separate and bypasses RLS.
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/config";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function serverSupabase(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet: CookieToSet[]) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // called from a Server Component — safe to ignore; middleware refreshes cookies
        }
      },
    },
  });
}
