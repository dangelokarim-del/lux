"use client";

/**
 * SupabaseLiveStore — the production data backend.
 *
 * On the client it: signs in (anonymous session, swap for real staff auth),
 * loads the full dataset, then opens a realtime channel so every insert/update
 * from any client (including the WhatsApp webhook) streams straight into the
 * local snapshot. Staff actions are persisted to Postgres; the realtime echo
 * keeps every connected dashboard in sync. The UI never knows the difference.
 */
import { statusMeta, type Database, type Guest, type Property, type Staff, type TaskStatus } from "@/lib/domain";
import type { InboundMessage } from "@/lib/services/whatsapp/inbound";
import { browserSupabase } from "@/lib/supabase/browser";
import {
  rowToConversation,
  rowToGuest,
  rowToMessage,
  rowToNote,
  rowToNotification,
  rowToProperty,
  rowToStaff,
  rowToTask,
  rowsToDatabase,
} from "@/lib/supabase/mappers";
import type { IngestOutcome, OpsGateway } from "./gateway";

const EMPTY: Database = {
  properties: [], guests: [], staff: [], conversations: [], messages: [], tasks: [], notes: [], notifications: [],
};

// table → (snapshot key, mapper)
const TABLE_MAP = {
  properties: { key: "properties", map: rowToProperty },
  guests: { key: "guests", map: rowToGuest },
  staff: { key: "staff", map: rowToStaff },
  conversations: { key: "conversations", map: rowToConversation },
  messages: { key: "messages", map: rowToMessage },
  tasks: { key: "tasks", map: rowToTask },
  activity_log: { key: "notes", map: rowToNote },
  notifications: { key: "notifications", map: rowToNotification },
} as const;

export class SupabaseLiveStore implements OpsGateway {
  private db: Database = EMPTY;
  private listeners = new Set<() => void>();
  private sb = browserSupabase();

  constructor() {
    if (typeof window !== "undefined") void this.init();
  }

  subscribe = (cb: () => void) => {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  };
  getSnapshot = () => this.db;
  private emit() {
    this.listeners.forEach((l) => l());
  }
  private set(db: Database) {
    this.db = db;
    this.emit();
  }

  private async init() {
    // ensure a session so RLS (authenticated) lets us read/write
    const { data } = await this.sb.auth.getSession();
    if (!data.session) await this.sb.auth.signInAnonymously().catch((e) => console.error("[luxa] anon auth", e));
    await this.load();
    this.openRealtime();
  }

  private async load() {
    const tables = ["properties", "guests", "staff", "conversations", "messages", "tasks", "activity_log", "notifications"] as const;
    const results = await Promise.all(tables.map((t) => this.sb.from(t).select("*")));
    const byTable = Object.fromEntries(tables.map((t, i) => [t, results[i].data ?? []]));
    this.set(rowsToDatabase(byTable as never));
  }

  private openRealtime() {
    this.sb
      .channel("luxa-ops")
      .on("postgres_changes", { event: "*", schema: "public" }, (payload) => this.applyChange(payload))
      .subscribe();
  }

  private applyChange(payload: { table: string; eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) {
    const entry = TABLE_MAP[payload.table as keyof typeof TABLE_MAP];
    if (!entry) return;
    const key = entry.key as keyof Database;
    const list = this.db[key] as Array<{ id: string }>;
    let next: Array<{ id: string }>;
    if (payload.eventType === "DELETE") {
      next = list.filter((r) => r.id !== (payload.old?.id as string));
    } else {
      const mapped = entry.map(payload.new as never) as { id: string };
      const i = list.findIndex((r) => r.id === mapped.id);
      next = i >= 0 ? list.map((r) => (r.id === mapped.id ? mapped : r)) : [mapped, ...list];
    }
    this.set({ ...this.db, [key]: next });
  }

  /* ------------------------------ selectors ------------------------------ */
  propertyById = (id: string | null): Property | null => this.db.properties.find((p) => p.id === id) ?? null;
  guestById = (id: string | null): Guest | null => this.db.guests.find((g) => g.id === id) ?? null;
  staffById = (id: string | null): Staff | null => this.db.staff.find((s) => s.id === id) ?? null;

  /* ------------------------------- pipeline ------------------------------ */
  async ingestWhatsApp(inbound: InboundMessage): Promise<IngestOutcome> {
    const res = await fetch("/api/messages/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: inbound.from, name: inbound.profileName, body: inbound.body }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Ingest failed");
    return (await res.json()) as IngestOutcome;
  }

  /* ----------------------------- staff actions --------------------------- */
  setTaskStatus(taskId: string, status: TaskStatus) {
    const task = this.db.tasks.find((t) => t.id === taskId);
    if (!task || task.status === status) return;
    void this.run(async () => {
      await this.sb.from("tasks").update({
        status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }).eq("id", taskId);
      await this.sb.from("activity_log").insert({ task_id: taskId, actor_name: "You", type: "status_change", is_system: true, body: `Status → ${statusMeta[status].label}` });
      await this.sb.from("notifications").insert({ kind: "status_change", title: "Status updated", body: `${task.title} → ${statusMeta[status].label}`, task_id: taskId });
    });
  }

  assignTask(taskId: string, staffId: string | null) {
    const task = this.db.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const staff = this.staffById(staffId);
    void this.run(async () => {
      await this.sb.from("tasks").update({ assignee_id: staffId, updated_at: new Date().toISOString() }).eq("id", taskId);
      await this.sb.from("activity_log").insert({ task_id: taskId, actor_name: "You", type: "assignment", is_system: true, body: staff ? `Assigned to ${staff.name}` : "Unassigned" });
      if (staff) await this.sb.from("notifications").insert({ kind: "assignment", title: "Task assigned", body: `${task.title} → ${staff.name}`, task_id: taskId });
    });
  }

  addNote(taskId: string, body: string, author: { id?: string; name: string }) {
    const text = body.trim();
    if (!text) return;
    void this.run(async () => {
      await this.sb.from("activity_log").insert({ task_id: taskId, actor_id: author.id ?? null, actor_name: author.name, type: "note", is_system: false, body: text });
      await this.sb.from("tasks").update({ updated_at: new Date().toISOString() }).eq("id", taskId);
    });
  }

  markNotificationRead(id: string) {
    void this.run(() => this.sb.from("notifications").update({ read: true }).eq("id", id));
  }
  markAllNotificationsRead() {
    void this.run(() => this.sb.from("notifications").update({ read: true }).eq("read", false));
  }

  private async run(fn: () => Promise<unknown> | unknown) {
    try {
      await fn();
    } catch (e) {
      console.error("[luxa] write failed", e);
    }
  }
}
