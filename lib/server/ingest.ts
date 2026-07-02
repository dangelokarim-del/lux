import "server-only";

/**
 * The production ingestion pipeline (Supabase + OpenAI), fully multi-tenant.
 * Every step is scoped to and stamped with `organizationId`, so a message that
 * arrived on one company's WhatsApp number can only ever touch that company's
 * data. Mirrors the in-memory `LuxaStore.ingestWhatsApp` (routing rules +
 * auto-assignment included) but persists to Postgres and broadcasts realtime.
 */
import { adminSupabase } from "@/lib/supabase/admin";
import { buildSettings, rowToProperty, rowToStaff, rowToTask } from "@/lib/supabase/mappers";
import type { AssignmentRuleRow, DepartmentRow, GuestRow, PropertyRow, SettingsRow, StaffRow, TaskRow } from "@/lib/supabase/types";
import { getExtractor } from "@/lib/services/ai";
import { applyRules, chooseAssignee } from "@/lib/services/assignment/engine";
import { sendWhatsAppText } from "@/lib/services/whatsapp/send";
import type { InboundMessage } from "@/lib/services/whatsapp/inbound";
import { categoryMeta, deptLabel, type Database, type Extraction } from "@/lib/domain";

const firstName = (n: string) => n.split(" ")[0];

export interface IngestResult {
  taskId: string;
  code: string;
  extraction: Extraction;
  conversationId: string;
}

export async function ingestInbound(inbound: InboundMessage, organizationId: string): Promise<IngestResult> {
  const db = adminSupabase();
  const org = organizationId;

  // 1 — resolve guest within this org (create a lightweight record if unknown)
  let { data: guest } = await db.from("guests").select("*").eq("organization_id", org).eq("phone", inbound.from).maybeSingle<GuestRow>();
  if (!guest) {
    const { data: firstProp } = await db.from("properties").select("id").eq("organization_id", org).limit(1).maybeSingle<{ id: string }>();
    const { data: created, error } = await db
      .from("guests")
      .insert({ organization_id: org, name: inbound.profileName ?? "Guest", phone: inbound.from, locale: "en", property_id: firstProp?.id ?? null })
      .select("*")
      .single<GuestRow>();
    if (error) throw error;
    guest = created;
  }

  // 2 — property context (org-scoped)
  const { data: propRow } = guest.property_id
    ? await db.from("properties").select("*").eq("id", guest.property_id).maybeSingle<PropertyRow>()
    : { data: null };
  const { data: allProps } = await db.from("properties").select("*").eq("organization_id", org).returns<PropertyRow[]>();
  const property = propRow ? rowToProperty(propRow) : null;
  const properties = (allProps ?? []).map(rowToProperty);

  // 3 — conversation
  let { data: conversation } = await db
    .from("conversations").select("id").eq("organization_id", org).eq("guest_id", guest.id).eq("channel", "whatsapp").maybeSingle<{ id: string }>();
  if (!conversation) {
    const { data: created, error } = await db
      .from("conversations")
      .insert({ organization_id: org, channel: "whatsapp", guest_id: guest.id, property_id: guest.property_id })
      .select("id").single<{ id: string }>();
    if (error) throw error;
    conversation = created;
  }

  // 4 — persist the inbound message
  const { data: message, error: msgErr } = await db
    .from("messages")
    .insert({ organization_id: org, conversation_id: conversation.id, direction: "inbound", channel: "whatsapp", body: inbound.body, author: guest.name, external_id: inbound.waMessageId || null })
    .select("id").single<{ id: string }>();
  if (msgErr) throw msgErr;
  await db.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversation.id);

  // 5 — AI extraction
  const extraction = await getExtractor().extract({ body: inbound.body, property, properties });

  // 6 — configurable routing + auto-assignment (this org's rules, team, settings)
  const [{ data: sRow }, { data: dRows }, { data: rRows }, { data: teamRows }, { data: openRows }] = await Promise.all([
    db.from("settings").select("*").eq("organization_id", org).maybeSingle<SettingsRow>(),
    db.from("departments").select("*").eq("organization_id", org).returns<DepartmentRow[]>(),
    db.from("assignment_rules").select("*").eq("organization_id", org).returns<AssignmentRuleRow[]>(),
    db.from("team_members").select("*").eq("organization_id", org).returns<StaffRow[]>(),
    db.from("tasks").select("*").eq("organization_id", org).in("status", ["new", "in_progress", "on_hold"]).returns<TaskRow[]>(),
  ]);
  const settings = buildSettings(sRow ?? null, dRows ?? [], rRows ?? []);
  const routed = applyRules(inbound.body, { category: extraction.category, department: extraction.department, priority: extraction.priority }, settings.rules);
  const propertyId = extraction.propertyId ?? guest.property_id;
  const engineDb = { staff: (teamRows ?? []).map(rowToStaff), tasks: (openRows ?? []).map(rowToTask) } as unknown as Database;
  const assigneeId = chooseAssignee(engineDb, routed.department, { autoAssign: settings.autoAssign, propertyId });
  const assignee = engineDb.staff.find((s) => s.id === assigneeId) ?? null;

  // 7 — create the task
  const code = await nextTaskCode(db, org);
  const { data: task, error: taskErr } = await db
    .from("tasks")
    .insert({
      organization_id: org, code, title: extraction.title, description: extraction.summary,
      category: routed.category, department: routed.department, priority: routed.priority, intent: extraction.intent,
      status: "new", property_id: propertyId, room: extraction.room, assignee_id: assigneeId,
      guest_id: guest.id, conversation_id: conversation.id, source_message_id: message.id, ai_confidence: extraction.confidence,
    })
    .select("*").single<TaskRow>();
  if (taskErr) throw taskErr;

  const routedExtraction = { ...extraction, category: routed.category, department: routed.department, priority: routed.priority };

  // 8 — link message + activity log + notify
  await db.from("messages").update({ extraction: routedExtraction as unknown, task_id: task.id }).eq("id", message.id);
  await db.from("task_history").insert({
    organization_id: org, task_id: task.id, actor_name: "LUXA AI", type: "created", is_system: true,
    body: `Created from WhatsApp · ${deptLabel(task.department)} · ${categoryMeta[task.category].label}${routed.matchedRule ? ` · rule: ${routed.matchedRule.label}` : ""}`,
  });
  if (assignee) {
    await db.from("task_history").insert({ organization_id: org, task_id: task.id, actor_name: "System", type: "assignment", is_system: true, body: `Auto-assigned to ${assignee.name}` });
  }
  await db.from("notifications").insert({ organization_id: org, kind: "new_task", title: "New request", body: `${task.title} · ${property?.name ?? "Unknown property"}`, task_id: task.id });

  // 9 — auto-reply (persisted + actually sent if WhatsApp is configured)
  const replyBody = `Thank you ${firstName(guest.name)} — I've logged this with our ${deptLabel(task.department)} team and we're on it.`;
  await db.from("messages").insert({ organization_id: org, conversation_id: conversation.id, direction: "outbound", channel: "whatsapp", body: replyBody, author: "LUXA" });
  await sendWhatsAppText(guest.phone, replyBody);

  return { taskId: task.id, code, extraction: routedExtraction, conversationId: conversation.id };
}

/** next monotonic REQ-#### code for an org, derived from its current max */
async function nextTaskCode(db: ReturnType<typeof adminSupabase>, org: string): Promise<string> {
  const { data } = await db.from("tasks").select("code").eq("organization_id", org).order("created_at", { ascending: false }).limit(50);
  const max = (data ?? [])
    .map((r: { code: string }) => parseInt(r.code.replace(/\D/g, ""), 10))
    .filter((n) => !Number.isNaN(n))
    .reduce((a, b) => Math.max(a, b), 1041);
  return `REQ-${max + 1}`;
}
