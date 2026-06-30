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
  departmentMeta,
  newId,
  nextTaskCode,
  primeTaskSeq,
  type Database,
  type Extraction,
  type Note,
  type Notification,
  type NotificationKind,
  type Staff,
  type Task,
  type TaskStatus,
  statusMeta,
} from "@/lib/domain";
import { extractor } from "@/lib/services/ai/extractor";
import type { InboundMessage } from "@/lib/services/whatsapp/inbound";
import type { IngestOutcome, OpsGateway } from "./gateway";

type Listener = () => void;

const nowIso = () => new Date().toISOString();
const firstName = (n: string) => n.split(" ")[0];

export class LuxaStore implements OpsGateway {
  private db: Database;
  private listeners = new Set<Listener>();

  constructor(seed: Database) {
    this.db = seed;
    const highest = seed.tasks
      .map((t) => Number(t.code.replace(/\D/g, "")))
      .filter((n) => !Number.isNaN(n))
      .reduce((a, b) => Math.max(a, b), 0);
    primeTaskSeq(highest);
  }

  /* --------------------------- realtime surface --------------------------- */
  subscribe = (cb: Listener): (() => void) => {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  };
  getSnapshot = (): Database => this.db;
  ready = (): boolean => true;

  private commit(patch: Partial<Database>) {
    this.db = { ...this.db, ...patch };
    this.listeners.forEach((l) => l());
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

    // → Task
    const task: Task = {
      id: newId("task"),
      code: nextTaskCode(),
      title: extraction.title,
      description: extraction.summary,
      category: extraction.category,
      department: extraction.department,
      priority: extraction.priority,
      intent: extraction.intent,
      status: "new",
      propertyId: extraction.propertyId ?? guest.propertyId,
      room: extraction.room,
      assigneeId: null,
      guestId: guest.id,
      conversationId: conversation.id,
      sourceMessageId: message.id,
      aiConfidence: extraction.confidence,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      completedAt: null,
    };

    const systemNote: Note = {
      id: newId("note"),
      taskId: task.id,
      authorId: null,
      authorName: "LUXA AI",
      body: `Created from WhatsApp · ${departmentMeta[task.department].label} · ${categoryMeta[task.category].label}`,
      createdAt: nowIso(),
      system: true,
    };

    const reply = {
      id: newId("msg"),
      conversationId: conversation.id,
      direction: "outbound" as const,
      channel: "whatsapp" as const,
      body: `Thank you ${firstName(guest.name)} — I've logged this with our ${departmentMeta[task.department].label} team and we're on it.`,
      author: "LUXA",
      createdAt: nowIso(),
    };

    this.commit({
      messages: this.db.messages
        .map((m) => (m.id === message.id ? { ...m, extraction, taskId: task.id } : m))
        .concat(reply),
      tasks: [task, ...this.db.tasks],
      notes: [...this.db.notes, systemNote],
      conversations: this.db.conversations.map((c) =>
        c.id === conversation.id ? { ...c, lastMessageAt: reply.createdAt } : c
      ),
    });

    this.notify("new_task", "New request", `${task.title} · ${property?.name ?? "Unknown villa"}`, task.id);

    return { taskId: task.id, code: task.code, extraction, conversationId: conversation.id };
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
}
