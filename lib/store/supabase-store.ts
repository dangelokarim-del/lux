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
import { createDefaultSettings, priorityMeta, statusMeta, type Database, type Guest, type Priority, type Property, type Settings, type Staff, type TaskStatus } from "@/lib/domain";
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
  properties: [], guests: [], staff: [], conversations: [], messages: [], tasks: [], notes: [], notifications: [], settings: createDefaultSettings(),
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
  private _ready = false;

  constructor() {
    if (typeof window !== "undefined") void this.init();
  }

  subscribe = (cb: () => void) => {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  };
  getSnapshot = () => this.db;
  ready = () => this._ready;
  private emit() {
    this.listeners.forEach((l) => l());
  }
  private set(db: Database) {
    this.db = db;
    this.emit();
  }

  private async init() {
    // The middleware guarantees an authenticated staff session before any
    // protected route renders, so we can load straight away. RLS scopes every
    // read/write to active staff members.
    await this.load();
    this._ready = true;
    this.emit();
    this.openRealtime();
    // reload when the session changes (sign-in / token refresh / sign-out)
    this.sb.auth.onAuthStateChange(() => void this.load());
  }

  private async load() {
    const tables = ["properties", "guests", "staff", "conversations", "messages", "tasks", "activity_log", "notifications"] as const;
    const results = await Promise.all(tables.map((t) => this.sb.from(t).select("*")));
    const byTable = Object.fromEntries(tables.map((t, i) => [t, results[i].data ?? []]));
    // preserve any settings the client edited this session (no settings table yet)
    this.set({ ...rowsToDatabase(byTable as never), settings: this.db.settings });
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
  // every action patches the local snapshot first (instant UI), then persists;
  // realtime echoes the authoritative row, and a failed write reloads to reconcile.
  setTaskStatus(taskId: string, status: TaskStatus) {
    const task = this.db.tasks.find((t) => t.id === taskId);
    if (!task || task.status === status) return;
    const now = new Date().toISOString();
    this.patch({ tasks: this.db.tasks.map((t) => (t.id === taskId ? { ...t, status, completedAt: status === "completed" ? now : null, updatedAt: now } : t)) });
    void this.run(async () => {
      await this.sb.from("tasks").update({ status, completed_at: status === "completed" ? now : null, updated_at: now }).eq("id", taskId);
      await this.sb.from("activity_log").insert({ task_id: taskId, actor_name: "You", type: "status_change", is_system: true, body: `Status → ${statusMeta[status].label}` });
      await this.sb.from("notifications").insert({ kind: "status_change", title: "Status updated", body: `${task.title} → ${statusMeta[status].label}`, task_id: taskId });
    });
  }

  setTaskPriority(taskId: string, priority: Priority) {
    const task = this.db.tasks.find((t) => t.id === taskId);
    if (!task || task.priority === priority) return;
    const now = new Date().toISOString();
    this.patch({ tasks: this.db.tasks.map((t) => (t.id === taskId ? { ...t, priority, updatedAt: now } : t)) });
    void this.run(async () => {
      await this.sb.from("tasks").update({ priority, updated_at: now }).eq("id", taskId);
      await this.sb.from("activity_log").insert({ task_id: taskId, actor_name: "You", type: "status_change", is_system: true, body: `Priority → ${priorityMeta[priority].label}` });
    });
  }

  assignTask(taskId: string, staffId: string | null) {
    const task = this.db.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const staff = this.staffById(staffId);
    const now = new Date().toISOString();
    this.patch({ tasks: this.db.tasks.map((t) => (t.id === taskId ? { ...t, assigneeId: staffId, updatedAt: now } : t)) });
    void this.run(async () => {
      await this.sb.from("tasks").update({ assignee_id: staffId, updated_at: now }).eq("id", taskId);
      await this.sb.from("activity_log").insert({ task_id: taskId, actor_name: "You", type: "assignment", is_system: true, body: staff ? `Assigned to ${staff.name}` : "Unassigned" });
      if (staff) await this.sb.from("notifications").insert({ kind: "assignment", title: "Task assigned", body: `${task.title} → ${staff.name}`, task_id: taskId });
    });
  }

  addNote(taskId: string, body: string, author: { id?: string; name: string }) {
    const text = body.trim();
    if (!text) return;
    const now = new Date().toISOString();
    const optimistic = { id: `tmp_${Math.random().toString(36).slice(2)}`, taskId, authorId: author.id ?? null, authorName: author.name, body: text, createdAt: now, system: false };
    this.patch({ notes: [...this.db.notes, optimistic] });
    void this.run(async () => {
      await this.sb.from("activity_log").insert({ task_id: taskId, actor_id: author.id ?? null, actor_name: author.name, type: "note", is_system: false, body: text });
      await this.sb.from("tasks").update({ updated_at: now }).eq("id", taskId);
    });
  }

  markNotificationRead(id: string) {
    this.patch({ notifications: this.db.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) });
    void this.run(() => this.sb.from("notifications").update({ read: true }).eq("id", id));
  }
  markAllNotificationsRead() {
    this.patch({ notifications: this.db.notifications.map((n) => ({ ...n, read: true })) });
    void this.run(() => this.sb.from("notifications").update({ read: true }).eq("read", false));
  }

  /* ----------------------- configuration (admin) ------------------------- */
  upsertProperty(property: Property) {
    const exists = this.db.properties.some((p) => p.id === property.id);
    this.patch({ properties: exists ? this.db.properties.map((p) => (p.id === property.id ? property : p)) : [...this.db.properties, property] });
    void this.run(() =>
      this.sb.from("properties").upsert({
        id: property.id, name: property.name, area: property.area, bedrooms: property.bedrooms,
        status: property.status, current_guest_id: property.currentGuestId, rooms: property.rooms,
      })
    );
  }

  deleteProperty(id: string) {
    this.patch({ properties: this.db.properties.filter((p) => p.id !== id), tasks: this.db.tasks.map((t) => (t.propertyId === id ? { ...t, propertyId: null } : t)) });
    void this.run(() => this.sb.from("properties").delete().eq("id", id));
  }

  upsertStaff(staff: Staff) {
    const exists = this.db.staff.some((s) => s.id === staff.id);
    this.patch({ staff: exists ? this.db.staff.map((s) => (s.id === staff.id ? staff : s)) : [...this.db.staff, staff] });
    void this.run(() =>
      this.sb.from("staff").upsert({
        id: staff.id, name: staff.name, role: staff.role, department: staff.department, presence: staff.presence, initials: staff.initials,
      })
    );
  }

  deleteStaff(id: string) {
    this.patch({ staff: this.db.staff.filter((s) => s.id !== id), tasks: this.db.tasks.map((t) => (t.assigneeId === id ? { ...t, assigneeId: null } : t)) });
    void this.run(() => this.sb.from("staff").delete().eq("id", id));
  }

  updateSettings(patch: Partial<Settings>) {
    // held in the app config layer for now (no settings table); realtime-safe locally
    this.patch({ settings: { ...this.db.settings, ...patch } });
  }

  private patch(p: Partial<Database>) {
    this.set({ ...this.db, ...p });
  }

  private async run(fn: () => Promise<unknown> | unknown) {
    try {
      await fn();
    } catch (e) {
      console.error("[luxa] write failed — reconciling", e);
      await this.load();
    }
  }
}
