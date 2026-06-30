import "server-only";

/**
 * The production ingestion pipeline (Supabase + OpenAI). Identical in spirit to
 * the in-memory `LuxaStore.ingestWhatsApp`, but every step persists to Postgres
 * and broadcasts over realtime. Called by the WhatsApp webhook and the simulate
 * route, so a real inbound message and a demo one travel the exact same path.
 */
import { adminSupabase } from "@/lib/supabase/admin";
import { rowToProperty } from "@/lib/supabase/mappers";
import type { GuestRow, PropertyRow, TaskRow } from "@/lib/supabase/types";
import { getExtractor } from "@/lib/services/ai";
import { sendWhatsAppText } from "@/lib/services/whatsapp/send";
import type { InboundMessage } from "@/lib/services/whatsapp/inbound";
import { categoryMeta, departmentMeta, type Extraction } from "@/lib/domain";

const firstName = (n: string) => n.split(" ")[0];

export interface IngestResult {
  taskId: string;
  code: string;
  extraction: Extraction;
  conversationId: string;
}

export async function ingestInbound(inbound: InboundMessage): Promise<IngestResult> {
  const db = adminSupabase();

  // 1 — resolve guest (create a lightweight record for an unknown number)
  let { data: guest } = await db.from("guests").select("*").eq("phone", inbound.from).maybeSingle<GuestRow>();
  if (!guest) {
    const { data: firstProp } = await db.from("properties").select("id").limit(1).maybeSingle<{ id: string }>();
    const { data: created, error } = await db
      .from("guests")
      .insert({ name: inbound.profileName ?? "Guest", phone: inbound.from, locale: "en", property_id: firstProp?.id ?? null })
      .select("*")
      .single<GuestRow>();
    if (error) throw error;
    guest = created;
  }

  // 2 — property context
  const { data: propRow } = guest.property_id
    ? await db.from("properties").select("*").eq("id", guest.property_id).maybeSingle<PropertyRow>()
    : { data: null };
  const { data: allProps } = await db.from("properties").select("*").returns<PropertyRow[]>();
  const property = propRow ? rowToProperty(propRow) : null;
  const properties = (allProps ?? []).map(rowToProperty);

  // 3 — conversation
  let { data: conversation } = await db
    .from("conversations")
    .select("id")
    .eq("guest_id", guest.id)
    .eq("channel", "whatsapp")
    .maybeSingle<{ id: string }>();
  if (!conversation) {
    const { data: created, error } = await db
      .from("conversations")
      .insert({ channel: "whatsapp", guest_id: guest.id, property_id: guest.property_id })
      .select("id")
      .single<{ id: string }>();
    if (error) throw error;
    conversation = created;
  }

  // 4 — persist the inbound message
  const { data: message, error: msgErr } = await db
    .from("messages")
    .insert({
      conversation_id: conversation.id,
      direction: "inbound",
      channel: "whatsapp",
      body: inbound.body,
      author: guest.name,
      external_id: inbound.waMessageId || null,
    })
    .select("id")
    .single<{ id: string }>();
  if (msgErr) throw msgErr;
  await db.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversation.id);

  // 5 — AI extraction
  const extraction = await getExtractor().extract({ body: inbound.body, property, properties });

  // 6 — create the task
  const code = await nextTaskCode(db);
  const { data: task, error: taskErr } = await db
    .from("tasks")
    .insert({
      code,
      title: extraction.title,
      description: extraction.summary,
      category: extraction.category,
      department: extraction.department,
      priority: extraction.priority,
      intent: extraction.intent,
      status: "new",
      property_id: extraction.propertyId ?? guest.property_id,
      room: extraction.room,
      guest_id: guest.id,
      conversation_id: conversation.id,
      source_message_id: message.id,
      ai_confidence: extraction.confidence,
    })
    .select("*")
    .single<TaskRow>();
  if (taskErr) throw taskErr;

  // 7 — link the message + log activity + notify
  await db.from("messages").update({ extraction: extraction as unknown, task_id: task.id }).eq("id", message.id);
  await db.from("activity_log").insert({
    task_id: task.id,
    actor_name: "LUXA AI",
    type: "created",
    is_system: true,
    body: `Created from WhatsApp · ${departmentMeta[task.department].label} · ${categoryMeta[task.category].label}`,
  });
  await db.from("notifications").insert({
    kind: "new_task",
    title: "New request",
    body: `${task.title} · ${property?.name ?? "Unknown villa"}`,
    task_id: task.id,
  });

  // 8 — auto-reply (persisted + actually sent if WhatsApp is configured)
  const replyBody = `Thank you ${firstName(guest.name)} — I've logged this with our ${departmentMeta[task.department].label} team and we're on it.`;
  await db.from("messages").insert({
    conversation_id: conversation.id,
    direction: "outbound",
    channel: "whatsapp",
    body: replyBody,
    author: "LUXA",
  });
  await sendWhatsAppText(guest.phone, replyBody);

  return { taskId: task.id, code, extraction, conversationId: conversation.id };
}

/** next monotonic REQ-#### code, derived from the current max */
async function nextTaskCode(db: ReturnType<typeof adminSupabase>): Promise<string> {
  const { data } = await db.from("tasks").select("code").order("created_at", { ascending: false }).limit(50);
  const max = (data ?? [])
    .map((r: { code: string }) => parseInt(r.code.replace(/\D/g, ""), 10))
    .filter((n) => !Number.isNaN(n))
    .reduce((a, b) => Math.max(a, b), 1041);
  return `REQ-${max + 1}`;
}
