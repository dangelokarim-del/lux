import "server-only";

/**
 * Multi-tenant WhatsApp routing. Every incoming message names the number that
 * received it (`phone_number_id`); that maps to exactly one organization via the
 * `whatsapp_accounts` table, so a single LUXA instance can serve hundreds of
 * companies from one webhook without them ever crossing.
 */
import { adminSupabase } from "@/lib/supabase/admin";

export async function orgForPhoneNumberId(phoneNumberId: string | undefined): Promise<string | null> {
  if (!phoneNumberId) return null;
  const db = adminSupabase();
  const { data } = await db
    .from("whatsapp_accounts")
    .select("organization_id")
    .eq("phone_number_id", phoneNumberId)
    .eq("active", true)
    .maybeSingle<{ organization_id: string }>();
  return data?.organization_id ?? null;
}
