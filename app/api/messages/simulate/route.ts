import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseAdmin } from "@/lib/config";
import { ingestInbound } from "@/lib/server/ingest";
import type { InboundMessage } from "@/lib/services/whatsapp/inbound";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Demo entry point: inject a guest message through the *real* pipeline (same
 * code path as the WhatsApp webhook). Only available when the backend is live.
 */
export async function POST(req: NextRequest) {
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "Live backend not configured." }, { status: 503 });
  }
  const { phone, name, body } = (await req.json()) as { phone?: string; name?: string; body?: string };
  if (!phone || !body) {
    return NextResponse.json({ error: "phone and body are required." }, { status: 400 });
  }

  const inbound: InboundMessage = {
    from: phone,
    waMessageId: `sim_${Math.random().toString(36).slice(2, 12)}`,
    body,
    timestamp: Math.floor(Date.now() / 1000),
    profileName: name,
  };

  try {
    const result = await ingestInbound(inbound);
    return NextResponse.json(result);
  } catch (e) {
    console.error("[simulate] ingest failed", e);
    return NextResponse.json({ error: "Ingest failed." }, { status: 500 });
  }
}
