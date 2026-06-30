/**
 * Environment configuration. Everything is read from env vars — nothing secret
 * is ever hardcoded. `isLive()` flips the whole app between the in-memory demo
 * (no infra required) and the real Supabase-backed platform.
 */

/** values safe to expose to the browser (must be NEXT_PUBLIC_*) */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

/** true when Supabase is configured → use the real backend + realtime */
export function isLive(): boolean {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}

/** server-only secrets — never imported into a client component */
export const serverEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",

  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",

  whatsappVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? "",
  whatsappAccessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? "",
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
  whatsappAppSecret: process.env.WHATSAPP_APP_SECRET ?? "",
};

export const hasSupabaseAdmin = () => Boolean(serverEnv.supabaseUrl && serverEnv.supabaseServiceKey);
export const hasOpenAi = () => Boolean(serverEnv.openaiApiKey);
export const hasWhatsAppSend = () => Boolean(serverEnv.whatsappAccessToken && serverEnv.whatsappPhoneNumberId);
