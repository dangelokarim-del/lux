import { NextResponse } from "next/server";
import { isLive, hasSupabaseAdmin, hasOpenAi, hasWhatsAppSend } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Deploy verification. Reports which integrations are wired (booleans only — no
 * secrets, no data). Hit GET /api/health after deploying to confirm the env.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    mode: isLive() ? "live" : "demo",
    integrations: {
      supabase: isLive(), // public URL + anon key present
      supabaseAdmin: hasSupabaseAdmin(), // service-role key present (server pipeline)
      openai: hasOpenAi(), // real extraction (else deterministic fallback)
      whatsappSend: hasWhatsAppSend(), // outbound replies
    },
    time: new Date().toISOString(),
  });
}
