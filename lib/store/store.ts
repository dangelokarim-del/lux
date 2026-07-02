/**
 * LuxaStore — the realtime data layer.
 *
 * It holds the whole `Database` in memory and exposes:
 *   • a pub/sub surface (`subscribe` / `getSnapshot`) consumed by React via
 *     useSyncExternalStore — this mirrors a Supabase realtime channel;
 *   • typed actions (the pipeline + task mutations) that every UI calls.
 *
 * Swapping to Supabase later means re-implementing these actions as awaited
 * `supabase.from(...).insert()/update()` calls and the snapshot as a realtime
 * subscription — the components and hooks stay identical.
 */
import {
  categoryMeta,
  createDefaultSettings,
  deptLabel,
  priorityMeta,
  newId,
  nextTaskCode,
  primeTaskSeq,
  type Database,
  type Note,
  type Notification,
  type NotificationKind,
  type Organization,
  type Property,
  type Settings,
  type Staff,
  type Task,
  type TaskStatus,
  type WhatsAppAccount,
  type Workspace,
  statusMeta,
} from "@/lib/domain";
import { extractor } from "@/lib/services/ai/extractor";
import { applyRules, chooseAssignee } from "@/lib/services/assignment/engine";
import type { InboundMessage } from "@/lib/services/whatsapp/inbound";
import type { WorkspaceSeed } from "./seed";
import type { IngestOutcome, OpsGateway } from "./gateway";

type Listener = () => void;

const nowIso = () => new Date().toISOString();
const firstName = (n: string) => n.split(" ")[0];
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const emptyDb = (settings: Settings): Database => ({
  properties: [], guests: [], staff: [], conversations: [], messages: [], tasks: [], notes: [], notifications: [], settings,
});

/**
 * The in-memory demo backend, now multi-tenant: it holds several organizations,
 * each with its own Database, plus the WhatsApp numbers routing to them. The
 * active org's Database is what `getSnapshot` returns, so every page and hook
 * works unchanged and simply re-renders the moment you switch organization.
 */
export class LuxaStore implements OpsGateway {
  private dbByOrg = new Map<string, Database>();
  private orgs: Organization[];
  private waAccounts: WhatsAppAccount[];
  private currentOrgId: string;
  private workspace: Workspace;
  private listeners = new Set<Listener>();

  constructor(seed: WorkspaceSeed) {
    this.orgs = seed.organizations;
    this.waAccounts = seed.whatsappAccounts;
    this.currentOrgId = seed.currentOrgId;
    for (const [id, db] of Object.entries(seed.dbByOrg)) this.dbByOrg.set(id, db);
    const highest = [...this.dbByOrg.values()]
      .flatMap((db) => db.tasks)
      .map((t) => Number(t.code.replace(/\D/g, "")))
      .filter((n) => !Number.isNaN(n))
      .reduce((a, b) => Math.max(a, b), 0);
    primeTaskSeq(highest);
    this.workspace = this.buildWorkspace();
  }

  /* --------------------------- realtime surface --------------------------- */
  subscribe = (cb: Listener): (() => void) => {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  };
  /** the ACTIVE organization's database */
  getSnapshot = (): Database => this.dbByOrg.get(this.currentOrgId)!;
  ready = (): boolean => true;

  private get db(): Database {
    return this.dbByOrg.get(this.currentOrgId)!;
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  private commit(patch: Partial<Database>) {
    this.dbByOrg.set(this.currentOrgId, { ...this.db, ...patch });
    this.emit();
  }

  /* --------------------------- workspace surface -------------------------- */
  private buildWorkspace(): Workspace {
    this.workspace = { organizations: this.orgs, whatsappAccounts: this.waAccounts, currentOrgId: this.currentOrgId };
    return this.workspace;
  }
  getWorkspaceSnapshot = (): Workspace => this.workspace;

  switchOrg(id: string) {
    if (!this.dbByOrg.has(id) || id === this.currentOrgId) return;
    this.currentOrgId = id;
    this.buildWorkspace();
    this.emit(); // getSnapshot now returns the new org's db → whole app updates
  }

  createOrg({ name, plan = "Starter" }: { name: string; plan?: string }) {
    const id = newId("org");
    const org: Organization = { id, name: name.trim() || "New Organization", slug: slugify(name) || id, plan };
    this.orgs = [...this.orgs, org];
    this.dbByOrg.set(id, emptyDb({ ...createDefaultSettings(), portfolioName: org.name }));
    this.currentOrgId = id;
    this.buildWorkspace();
    this.emit();
  }

  updateOrg(org: Organization) {
    this.orgs = this.orgs.map((o) => (o.id === org.id ? org : o));
    // keep the org's portfolio name in sync with its display name
    const db = this.dbByOrg.get(org.id);
    if (db) this.dbByOrg.set(org.id, { ...db, settings: { ...db.settings, portfolioName: org.name } });
    this.buildWorkspace();
    this.emit();
  }

  addWhatsAppAccount(input: { phoneNumberId: string; displayNumber: string; label: string; organizationId: string; active?: boolean }) {
    const account: WhatsAppAccount = {
      id: newId("wa"), organizationId: input.organizationId, phoneNumberId: input.phoneNumberId.trim(),
      displayNumber: input.displayNumber.trim(), label: input.label.trim(), active: input.active ?? true, lastMessageAt: null,
    };
    this.waAccounts = [...this.waAccounts, account];
    this.buildWorkspace();
    this.emit();
  }
  updateWhatsAppAccount(account: WhatsAppAccount) {
    this.waAccounts = this.waAccounts.map((a) => (a.id === account.id ? account : a));
    this.buildWorkspace();
    this.emit();
  }
  deleteWhatsAppAccount(id: string) {
    this.waAccounts = this.waAccounts.filter((a) => a.id !== id);
    this.buildWorkspace();
    this.emit();
  }

  /* ------------------------------ selectors ------------------------------ */
  propertyById = (id: string | null) => this.db.properties.find((p) => p.id === id) ?? null;
  guestById = (id: string | null) => this.db.guests.find((g) => g.id === id) ?? null;
  staffById = (id: string | null) => this.db.staff.find((s) => s.id === id) ?? null;
  guestByPhone = (phone: string) => this.db.guests.find((g) => g.phone === phone) ?? null;

  /* ------------------------------- pipeline ------------------------------ */
  /**
   * The core flow: an inbound WhatsApp message → AI extraction → auto-created
   * task → notification → auto-reply. Emits once when the message lands, then
   * again when the task is created (so the UI can show "analysing…").
   */
  async ingestWhatsApp(inbound: InboundMessage): Promise<IngestOutcome> {
    const guest = this.resolveGuest(inbound);
    const property = this.propertyById(guest.propertyId);
    const conversation = this.resolveConversation(guest);

    const message = {
      id: newId("msg"),
      conversationId: conversation.id,
      direction: "inbound" as const,
      channel: "whatsapp" as const,
      body: inbound.body,
      author: guest.name,
      createdAt: nowIso(),
      externalId: inbound.waMessageId || undefined,
    };
    this.commit({
      messages: [...this.db.messages, message],
      conversations: this.db.conversations.map((c) =>
        c.id === conversation.id ? { ...c, lastMessageAt: message.createdAt } : c
      ),
    });

    // → AI
    const extraction = await extractor.extract({
      body: inbound.body,
      property,
      properties: this.db.properties,
    });

    // → configurable routing: client rules can override the AI's department/category
    const routed = applyRules(
      inbound.body,
      { category: extraction.category, department: extraction.department, priority: extraction.priority },
      this.db.settings.rules
    );
    const routedExtraction = { ...extraction, category: routed.category, department: routed.department, priority: routed.priority };

    // → assignment engine picks the right person (respecting availability + workload)
    const propertyId = extraction.propertyId ?? guest.propertyId;
    const assigneeId = chooseAssignee(this.db, routed.department, { autoAssign: this.db.settings.autoAssign, propertyId });
    const assignee = this.staffById(assigneeId);

    // → Task
    const task: Task = {
      id: newId("task"),
      code: nextTaskCode(),
      title: extraction.title,
      description: extraction.summary,
      category: routed.category,
      department: routed.department,
      priority: routed.priority,
      intent: extraction.intent,
      status: "new",
      propertyId,
      room: extraction.room,
      assigneeId,
      guestId: guest.id,
      conversationId: conversation.id,
      sourceMessageId: message.id,
      aiConfidence: extraction.confidence,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      completedAt: null,
    };

    const notes: Note[] = [
      {
        id: newId("note"),
        taskId: task.id,
        authorId: null,
        authorName: "LUXA AI",
        body: `Created from WhatsApp · ${deptLabel(task.department)} · ${categoryMeta[task.category].label}${routed.matchedRule ? ` · rule: ${routed.matchedRule.label}` : ""}`,
        createdAt: nowIso(),
        system: true,
      },
    ];
    if (assignee) {
      notes.push({
        id: newId("note"),
        taskId: task.id,
        authorId: null,
        authorName: "System",
        body: `Auto-assigned to ${assignee.name}`,
        createdAt: nowIso(),
        system: true,
      });
    }

    const reply = {
      id: newId("msg"),
      conversationId: conversation.id,
      direction: "outbound" as const,
      channel: "whatsapp" as const,
      body: `Thank you ${firstName(guest.name)} — I've logged this with our ${deptLabel(task.department)} team and we're on it.`,
      author: "LUXA",
      createdAt: nowIso(),
    };

    this.commit({
      messages: this.db.messages
        .map((m) => (m.id === message.id ? { ...m, extraction: routedExtraction, taskId: task.id } : m))
        .concat(reply),
      tasks: [task, ...this.db.tasks],
      notes: [...this.db.notes, ...notes],
      conversations: this.db.conversations.map((c) =>
        c.id === conversation.id ? { ...c, lastMessageAt: reply.createdAt } : c
      ),
    });

    this.notify("new_task", "New request", `${task.title} · ${property?.name ?? "Unknown property"}`, task.id);
    if (assignee) this.notify("assignment", "Task assigned", `${task.title} → ${assignee.name}`, task.id);

    // reflect "last message received" on this org's active WhatsApp number
    const wa = this.waAccounts.find((a) => a.organizationId === this.currentOrgId && a.active);
    if (wa) {
      this.waAccounts = this.waAccounts.map((a) => (a.id === wa.id ? { ...a, lastMessageAt: nowIso() } : a));
      this.buildWorkspace();
    }

    return { taskId: task.id, code: task.code, extraction: routedExtraction, conversationId: conversation.id };
  }

  private resolveGuest(inbound: InboundMessage) {
    const existing = this.guestByPhone(inbound.from);
    if (existing) return existing;
    // unknown sender → create a lightweight guest (as a real CRM would)
    const guest = {
      id: newId("guest"),
      name: inbound.profileName ?? "Guest",
      phone: inbound.from,
      locale: "en",
      propertyId: this.db.properties[0]?.id ?? null,
      vip: false,
    };
    this.commit({ guests: [...this.db.guests, guest] });
    return guest;
  }

  private resolveConversation(guest: { id: string; propertyId: string | null }) {
    const existing = this.db.conversations.find((c) => c.guestId === guest.id && c.channel === "whatsapp");
    if (existing) return existing;
    const conversation = {
      id: newId("conv"),
      channel: "whatsapp" as const,
      propertyId: guest.propertyId,
      guestId: guest.id,
      createdAt: nowIso(),
      lastMessageAt: nowIso(),
    };
    this.commit({ conversations: [...this.db.conversations, conversation] });
    return conversation;
  }

  /* --------------------------- task mutations ---------------------------- */
  setTaskStatus(taskId: string, status: TaskStatus) {
    const task = this.db.tasks.find((t) => t.id === taskId);
    if (!task || task.status === status) return;
    const completedAt = status === "completed" ? nowIso() : null;
    this.patchTask(taskId, { status, completedAt, updatedAt: nowIso() });
    this.addSystemNote(taskId, `Status → ${statusMeta[status].label}`);
    this.notify("status_change", "Status updated", `${task.title} → ${statusMeta[status].label}`, taskId);
  }

  setTaskPriority(taskId: string, priority: Task["priority"]) {
    const task = this.db.tasks.find((t) => t.id === taskId);
    if (!task || task.priority === priority) return;
    this.patchTask(taskId, { priority, updatedAt: nowIso() });
    this.addSystemNote(taskId, `Priority → ${priorityMeta[priority].label}`);
  }

  assignTask(taskId: string, staffId: string | null) {
    const task = this.db.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const staff = this.staffById(staffId);
    this.patchTask(taskId, { assigneeId: staffId, updatedAt: nowIso() });
    this.addSystemNote(taskId, staff ? `Assigned to ${staff.name}` : "Unassigned");
    if (staff) this.notify("assignment", "Task assigned", `${task.title} → ${staff.name}`, taskId);
  }

  addNote(taskId: string, body: string, author: { id?: string; name: string }) {
    const text = body.trim();
    if (!text) return;
    const note: Note = {
      id: newId("note"),
      taskId,
      authorId: author.id ?? null,
      authorName: author.name,
      body: text,
      createdAt: nowIso(),
      system: false,
    };
    this.commit({
      notes: [...this.db.notes, note],
      tasks: this.db.tasks.map((t) => (t.id === taskId ? { ...t, updatedAt: nowIso() } : t)),
    });
  }

  private patchTask(taskId: string, patch: Partial<Task>) {
    this.commit({ tasks: this.db.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)) });
  }

  private addSystemNote(taskId: string, body: string) {
    const note: Note = {
      id: newId("note"),
      taskId,
      authorId: null,
      authorName: "System",
      body,
      createdAt: nowIso(),
      system: true,
    };
    this.commit({ notes: [...this.db.notes, note] });
  }

  /* --------------------------- notifications ----------------------------- */
  private notify(kind: NotificationKind, title: string, body: string, taskId: string | null) {
    const n: Notification = {
      id: newId("ntf"),
      kind,
      title,
      body,
      taskId,
      createdAt: nowIso(),
      read: false,
    };
    this.commit({ notifications: [n, ...this.db.notifications] });
  }

  markNotificationRead(id: string) {
    this.commit({ notifications: this.db.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) });
  }
  markAllNotificationsRead() {
    this.commit({ notifications: this.db.notifications.map((n) => ({ ...n, read: true })) });
  }

  /** staff sorted by department then load — for assignment pickers */
  staffForDepartment(dept: Staff["department"]): Staff[] {
    return this.db.staff.filter((s) => s.department === dept);
  }

  /* ----------------------- configuration (admin) ------------------------- */
  upsertProperty(property: Property) {
    const exists = this.db.properties.some((p) => p.id === property.id);
    this.commit({
      properties: exists
        ? this.db.properties.map((p) => (p.id === property.id ? property : p))
        : [...this.db.properties, property],
    });
  }

  deleteProperty(id: string) {
    this.commit({
      properties: this.db.properties.filter((p) => p.id !== id),
      // unlink tasks pointing at the removed property (keep the tasks)
      tasks: this.db.tasks.map((t) => (t.propertyId === id ? { ...t, propertyId: null } : t)),
    });
  }

  upsertStaff(staff: Staff) {
    const exists = this.db.staff.some((s) => s.id === staff.id);
    this.commit({
      staff: exists ? this.db.staff.map((s) => (s.id === staff.id ? staff : s)) : [...this.db.staff, staff],
    });
  }

  deleteStaff(id: string) {
    this.commit({
      staff: this.db.staff.filter((s) => s.id !== id),
      // unassign their open tasks so nothing is orphaned
      tasks: this.db.tasks.map((t) => (t.assigneeId === id ? { ...t, assigneeId: null } : t)),
    });
  }

  updateSettings(patch: Partial<Settings>) {
    this.commit({ settings: { ...this.db.settings, ...patch } });
  }
}
