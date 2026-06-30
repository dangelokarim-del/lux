import "server-only";
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseAdmin, serverEnv } from "@/lib/config";
import { parseWhatsAppWebhook, type WhatsAppWebhook } from "@/lib/services/whatsapp/inbound";
import { ingestInbound } from "@/lib/server/ingest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Webhook verification handshake (Meta calls this once on setup). */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === serverEnv.whatsappVerifyToken && serverEnv.whatsappVerifyToken) {
    return new Response(p.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

/** Inbound messages. Always 200s fast so Meta doesn't retry; processing is async. */
export async function POST(req: NextRequest) {
  const raw = await req.text();

  // verify the payload signature when an app secret is configured
  if (serverEnv.whatsappAppSecret) {
    const sig = req.headers.get("x-hub-signature-256") ?? "";
    const expected = "sha256=" + crypto.createHmac("sha256", serverEnv.whatsappAppSecret).update(raw).digest("hex");
    if (!safeEqual(sig, expected)) return new Response("Invalid signature", { status: 401 });
  }

  if (!hasSupabaseAdmin()) return NextResponse.json({ ok: true, skipped: "backend not configured" });

  let payload: WhatsAppWebhook;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true });
  }

  const inbound = parseWhatsAppWebhook(payload);
  // process sequentially; never let one bad message fail the batch
  for (const m of inbound) {
    try {
      await ingestInbound(m);
    } catch (e) {
      console.error("[whatsapp] ingest failed", e);
    }
  }
  return NextResponse.json({ ok: true, processed: inbound.length });
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}
