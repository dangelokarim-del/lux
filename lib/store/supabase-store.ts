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
import { createDefaultSettings, priorityMeta, statusMeta, type Database, type Guest, type Organization, type Priority, type Property, type Settings, type Staff, type TaskStatus, type WhatsAppAccount, type Workspace } from "@/lib/domain";
import type { InboundMessage } from "@/lib/services/whatsapp/inbound";
import { browserSupabase } from "@/lib/supabase/browser";
import {
  buildSettings,
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

// canonical table → (snapshot key, mapper) for the realtime row fan-out
const TABLE_MAP = {
  properties: { key: "properties", map: rowToProperty },
  guests: { key: "guests", map: rowToGuest },
  team_members: { key: "staff", map: rowToStaff },
  conversations: { key: "conversations", map: rowToConversation },
  messages: { key: "messages", map: rowToMessage },
  tasks: { key: "tasks", map: rowToTask },
  task_history: { key: "notes", map: rowToNote },
  notifications: { key: "notifications", map: rowToNotification },
} as const;

// tables that, when they change, mean "reload the settings object"
const CONFIG_TABLES = new Set(["settings", "departments", "assignment_rules"]);

export class SupabaseLiveStore implements OpsGateway {
  private db: Database = EMPTY;
  private listeners = new Set<() => void>();
  private sb = browserSupabase();
  private _ready = false;
  /** the organization this session operates in (multi-tenant scope) */
  private orgId: string | null = null;
  private workspace: Workspace = { organizations: [], whatsappAccounts: [], currentOrgId: "" };

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
    // The middleware guarantees an authenticated session before any protected
    // route renders. Resolve which organization this user belongs to; RLS then
    // scopes every read/write to that org so tenants never see each other.
    await this.resolveOrg();
    await this.load();
    this._ready = true;
    this.emit();
    this.openRealtime();
    this.sb.auth.onAuthStateChange(() => void this.init());
  }

  private async resolveOrg() {
    const { data: { user } } = await this.sb.auth.getUser();
    if (!user) return;
    const { data } = await this.sb.from("memberships").select("organization_id").eq("user_id", user.id).limit(1).maybeSingle();
    this.orgId = (data as { organization_id: string } | null)?.organization_id ?? null;
  }

  private async load() {
    // RLS already isolates by org; scoping the query too keeps payloads tight.
    const scope = <T,>(q: T): T => (this.orgId ? (q as { eq: (c: string, v: string) => T }).eq("organization_id", this.orgId) : q);
    const tables = ["properties", "guests", "team_members", "conversations", "messages", "tasks", "task_history", "notifications", "settings", "departments", "assignment_rules"] as const;
    const [results, orgsRes, waRes] = await Promise.all([
      Promise.all(tables.map((t) => scope(this.sb.from(t).select("*")))),
      this.sb.from("organizations").select("*"), // RLS → only the orgs this user is a member of
      this.sb.from("whatsapp_accounts_safe").select("*"),
    ]);
    const byTable = Object.fromEntries(tables.map((t, i) => [t, results[i].data ?? []]));
    this.buildWorkspace((orgsRes.data as never[]) ?? [], (waRes.data as never[]) ?? []);
    this.set(rowsToDatabase(byTable as never));
  }

  private buildWorkspace(orgRows: Array<{ id: string; name: string; slug: string; plan?: string }>, waRows: Array<{ id: string; organization_id: string; phone_number_id: string; display_number: string | null; label: string | null; active: boolean }>) {
    const organizations: Organization[] = orgRows.map((o) => ({ id: o.id, name: o.name, slug: o.slug, plan: o.plan ?? "—" }));
    const whatsappAccounts: WhatsAppAccount[] = waRows.map((w) => ({ id: w.id, organizationId: w.organization_id, phoneNumberId: w.phone_number_id, displayNumber: w.display_number ?? "", label: w.label ?? "", active: w.active, lastMessageAt: null }));
    this.workspace = { organizations, whatsappAccounts, currentOrgId: this.orgId ?? organizations[0]?.id ?? "" };
  }
  getWorkspaceSnapshot = (): Workspace => this.workspace;

  private openRealtime() {
    // one channel; RLS + a client-side org guard keep other tenants' rows out.
    this.sb
      .channel(`luxa-ops-${this.orgId ?? "all"}`)
      .on("postgres_changes", { event: "*", schema: "public" }, (payload) => this.applyChange(payload))
      .subscribe();
  }

  private applyChange(payload: { table: string; eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) {
    // configuration edits: cheapest to just reload the settings object
    if (CONFIG_TABLES.has(payload.table)) {
      void this.reloadSettings();
      return;
    }
    const entry = TABLE_MAP[payload.table as keyof typeof TABLE_MAP];
    if (!entry) return;
    // never let another tenant's row leak in through realtime
    const row = payload.eventType === "DELETE" ? payload.old : payload.new;
    if (this.orgId && row?.organization_id && row.organization_id !== this.orgId) return;

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

  private async reloadSettings() {
    const scope = <T,>(q: T): T => (this.orgId ? (q as { eq: (c: string, v: string) => T }).eq("organization_id", this.orgId) : q);
    const [s, d, r] = await Promise.all([
      scope(this.sb.from("settings").select("*")),
      scope(this.sb.from("departments").select("*")),
      scope(this.sb.from("assignment_rules").select("*")),
    ]);
    this.set({ ...this.db, settings: buildSettings((s.data?.[0] as never) ?? null, (d.data as never) ?? [], (r.data as never) ?? []) });
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
      await this.sb.from("task_history").insert(this.stamp({ task_id: taskId, actor_name: "You", type: "status_change", is_system: true, body: `Status → ${statusMeta[status].label}` }));
      await this.sb.from("notifications").insert(this.stamp({ kind: "status_change", title: "Status updated", body: `${task.title} → ${statusMeta[status].label}`, task_id: taskId }));
    });
  }

  setTaskPriority(taskId: string, priority: Priority) {
    const task = this.db.tasks.find((t) => t.id === taskId);
    if (!task || task.priority === priority) return;
    const now = new Date().toISOString();
    this.patch({ tasks: this.db.tasks.map((t) => (t.id === taskId ? { ...t, priority, updatedAt: now } : t)) });
    void this.run(async () => {
      await this.sb.from("tasks").update({ priority, updated_at: now }).eq("id", taskId);
      await this.sb.from("task_history").insert(this.stamp({ task_id: taskId, actor_name: "You", type: "status_change", is_system: true, body: `Priority → ${priorityMeta[priority].label}` }));
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
      await this.sb.from("task_history").insert(this.stamp({ task_id: taskId, actor_name: "You", type: "assignment", is_system: true, body: staff ? `Assigned to ${staff.name}` : "Unassigned" }));
      if (staff) await this.sb.from("notifications").insert(this.stamp({ kind: "assignment", title: "Task assigned", body: `${task.title} → ${staff.name}`, task_id: taskId }));
    });
  }

  addNote(taskId: string, body: string, author: { id?: string; name: string }) {
    const text = body.trim();
    if (!text) return;
    const now = new Date().toISOString();
    const optimistic = { id: `tmp_${Math.random().toString(36).slice(2)}`, taskId, authorId: author.id ?? null, authorName: author.name, body: text, createdAt: now, system: false };
    this.patch({ notes: [...this.db.notes, optimistic] });
    void this.run(async () => {
      await this.sb.from("task_history").insert(this.stamp({ task_id: taskId, actor_id: author.id ?? null, actor_name: author.name, type: "note", is_system: false, body: text }));
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
      this.sb.from("properties").upsert(this.stamp({
        id: property.id, name: property.name, type: property.type, area: property.area, bedrooms: property.bedrooms,
        status: property.status, current_guest_id: property.currentGuestId, rooms: property.rooms,
        assigned_team_ids: property.assignedTeamIds ?? [], notes: property.notes ?? null,
      }))
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
      this.sb.from("team_members").upsert(this.stamp({
        id: staff.id, name: staff.name, role: staff.role, department: staff.department, presence: staff.presence, initials: staff.initials,
        phone: staff.phone ?? null, email: staff.email ?? null, max_active_tasks: staff.maxActiveTasks ?? null,
        working_hours: staff.workingHours ?? null, languages: staff.languages ?? [], assigned_property_ids: staff.assignedPropertyIds ?? [],
      }))
    );
  }

  deleteStaff(id: string) {
    this.patch({ staff: this.db.staff.filter((s) => s.id !== id), tasks: this.db.tasks.map((t) => (t.assigneeId === id ? { ...t, assigneeId: null } : t)) });
    void this.run(() => this.sb.from("team_members").delete().eq("id", id));
  }

  updateSettings(patch: Partial<Settings>) {
    const next = { ...this.db.settings, ...patch };
    this.patch({ settings: next }); // optimistic
    if (!this.orgId) return;
    const org = this.orgId;
    void this.run(async () => {
      // portfolio identity + dashboard prefs → the single settings row
      await this.sb.from("settings").upsert({
        organization_id: org, portfolio_name: next.portfolioName, location: next.location, language: next.language,
        timezone: next.timezone, brand_mark: next.brandMark, auto_assign: next.autoAssign, visible_kpis: next.visibleKpis,
      });
      // departments: replace the org's set with the current list
      if (patch.departments) {
        await this.sb.from("departments").delete().eq("organization_id", org);
        await this.sb.from("departments").insert(next.departments.map((d, i) => ({ organization_id: org, slug: d.id, label: d.label, custom: d.custom ?? false, position: i })));
      }
      // assignment rules: replace the org's set, preserving order
      if (patch.rules) {
        await this.sb.from("assignment_rules").delete().eq("organization_id", org);
        await this.sb.from("assignment_rules").insert(next.rules.map((r, i) => ({ organization_id: org, label: r.label, keywords: r.keywords, category: r.category, department: r.department, priority: r.priority ?? null, enabled: r.enabled, position: i })));
      }
    });
  }

  /* ----------------------- workspace / multi-tenant ---------------------- */
  switchOrg(id: string) {
    if (id === this.orgId) return;
    this.orgId = id;
    this.workspace = { ...this.workspace, currentOrgId: id };
    void this.load(); // reload every table scoped to the newly-active org
  }

  createOrg(input: { name: string; plan?: string }) {
    void this.run(async () => {
      const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const { data: org } = await this.sb.from("organizations").insert({ name: input.name, slug }).select("id").single<{ id: string }>();
      const { data: { user } } = await this.sb.auth.getUser();
      if (org && user) {
        await this.sb.from("memberships").insert({ organization_id: org.id, user_id: user.id, email: user.email, role: "owner" });
        this.switchOrg(org.id);
      }
    });
  }

  updateOrg(org: Organization) {
    this.workspace = { ...this.workspace, organizations: this.workspace.organizations.map((o) => (o.id === org.id ? org : o)) };
    this.emit();
    void this.run(() => this.sb.from("organizations").update({ name: org.name, slug: org.slug }).eq("id", org.id));
  }

  addWhatsAppAccount(input: { phoneNumberId: string; displayNumber: string; label: string; organizationId: string; active?: boolean }) {
    void this.run(async () => {
      await this.sb.from("whatsapp_accounts").insert({ organization_id: input.organizationId, phone_number_id: input.phoneNumberId, display_number: input.displayNumber, label: input.label, active: input.active ?? true });
      await this.load();
    });
  }
  updateWhatsAppAccount(account: WhatsAppAccount) {
    this.workspace = { ...this.workspace, whatsappAccounts: this.workspace.whatsappAccounts.map((a) => (a.id === account.id ? account : a)) };
    this.emit();
    void this.run(() => this.sb.from("whatsapp_accounts").update({ display_number: account.displayNumber, label: account.label, active: account.active }).eq("id", account.id));
  }
  deleteWhatsAppAccount(id: string) {
    this.workspace = { ...this.workspace, whatsappAccounts: this.workspace.whatsappAccounts.filter((a) => a.id !== id) };
    this.emit();
    void this.run(() => this.sb.from("whatsapp_accounts").delete().eq("id", id));
  }

  /** stamp a write with the current organization (multi-tenant scope) */
  private stamp<T extends object>(row: T): T & { organization_id?: string } {
    return this.orgId ? { ...row, organization_id: this.orgId } : row;
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
