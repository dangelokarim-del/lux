/**
 * The serialization boundary: Postgres rows ⇄ domain models. Everything that
 * leaves Supabase is mapped here so the UI only ever sees clean domain types.
 */
import {
  createDefaultSettings,
  type AssignmentRule,
  type Conversation,
  type Database,
  type DepartmentDef,
  type Extraction,
  type Guest,
  type Message,
  type Note,
  type Notification,
  type Property,
  type Settings,
  type Staff,
  type Task,
} from "@/lib/domain";
import type {
  ActivityRow,
  AssignmentRuleRow,
  ConversationRow,
  DepartmentRow,
  GuestRow,
  MessageRow,
  NotificationRow,
  PropertyRow,
  SettingsRow,
  StaffRow,
  TaskRow,
} from "./types";

export const rowToProperty = (r: PropertyRow): Property => ({
  id: r.id,
  name: r.name,
  type: r.type ?? "Villa",
  area: r.area,
  bedrooms: r.bedrooms,
  status: r.status,
  currentGuestId: r.current_guest_id,
  rooms: r.rooms ?? [],
  assignedTeamIds: r.assigned_team_ids ?? [],
  notes: r.notes ?? undefined,
});

export const rowToGuest = (r: GuestRow): Guest => ({
  id: r.id,
  name: r.name,
  phone: r.phone,
  locale: r.locale,
  propertyId: r.property_id,
  vip: r.vip,
  checkIn: r.check_in ?? undefined,
  checkOut: r.check_out ?? undefined,
});

export const rowToStaff = (r: StaffRow): Staff => ({
  id: r.id,
  name: r.name,
  role: r.role,
  department: r.department,
  presence: r.presence,
  initials: r.initials,
  phone: r.phone ?? undefined,
  email: r.email ?? undefined,
  maxActiveTasks: r.max_active_tasks ?? undefined,
  workingHours: r.working_hours ?? undefined,
  languages: r.languages ?? undefined,
  assignedPropertyIds: r.assigned_property_ids ?? undefined,
});

/* configuration → the Settings domain object */
export const rowToDepartment = (r: DepartmentRow): DepartmentDef => ({ id: r.slug, label: r.label, custom: r.custom });
export const rowToRule = (r: AssignmentRuleRow): AssignmentRule => ({
  id: r.id, label: r.label, keywords: r.keywords ?? [], category: r.category,
  department: r.department, priority: r.priority ?? undefined, enabled: r.enabled,
});

export function buildSettings(s: SettingsRow | null, depts: DepartmentRow[], rules: AssignmentRuleRow[]): Settings {
  const base = createDefaultSettings();
  return {
    ...base,
    portfolioName: s?.portfolio_name ?? base.portfolioName,
    location: s?.location ?? base.location,
    language: s?.language ?? base.language,
    timezone: s?.timezone ?? base.timezone,
    brandMark: s?.brand_mark ?? base.brandMark,
    autoAssign: s?.auto_assign ?? base.autoAssign,
    visibleKpis: s?.visible_kpis?.length ? s.visible_kpis : base.visibleKpis,
    departments: depts.length ? [...depts].sort((a, b) => a.position - b.position).map(rowToDepartment) : base.departments,
    rules: rules.length ? [...rules].sort((a, b) => a.position - b.position).map(rowToRule) : base.rules,
  };
}

export const rowToConversation = (r: ConversationRow): Conversation => ({
  id: r.id,
  channel: r.channel,
  propertyId: r.property_id,
  guestId: r.guest_id,
  createdAt: r.created_at,
  lastMessageAt: r.last_message_at,
});

export const rowToMessage = (r: MessageRow): Message => ({
  id: r.id,
  conversationId: r.conversation_id,
  direction: r.direction,
  channel: r.channel,
  body: r.body,
  author: r.author,
  createdAt: r.created_at,
  externalId: r.external_id ?? undefined,
  extraction: (r.extraction as Extraction | null) ?? undefined,
  taskId: r.task_id ?? undefined,
});

export const rowToTask = (r: TaskRow): Task => ({
  id: r.id,
  code: r.code,
  title: r.title,
  description: r.description,
  category: r.category,
  department: r.department,
  priority: r.priority,
  intent: r.intent,
  status: r.status,
  propertyId: r.property_id,
  room: r.room,
  assigneeId: r.assignee_id,
  guestId: r.guest_id,
  conversationId: r.conversation_id,
  sourceMessageId: r.source_message_id,
  aiConfidence: r.ai_confidence,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  completedAt: r.completed_at,
});

export const rowToNote = (r: ActivityRow): Note => ({
  id: r.id,
  taskId: r.task_id,
  authorId: r.actor_id,
  authorName: r.actor_name,
  body: r.body,
  createdAt: r.created_at,
  system: r.is_system,
});

export const rowToNotification = (r: NotificationRow): Notification => ({
  id: r.id,
  kind: r.kind,
  title: r.title,
  body: r.body,
  taskId: r.task_id,
  createdAt: r.created_at,
  read: r.read,
});

/** assemble a full client snapshot from a bulk, org-scoped fetch */
export function rowsToDatabase(rows: {
  properties: PropertyRow[];
  guests: GuestRow[];
  team_members: StaffRow[];
  conversations: ConversationRow[];
  messages: MessageRow[];
  tasks: TaskRow[];
  task_history: ActivityRow[];
  notifications: NotificationRow[];
  settings: SettingsRow[];
  departments: DepartmentRow[];
  assignment_rules: AssignmentRuleRow[];
}): Database {
  return {
    properties: rows.properties.map(rowToProperty),
    guests: rows.guests.map(rowToGuest),
    staff: rows.team_members.map(rowToStaff),
    conversations: rows.conversations.map(rowToConversation),
    messages: rows.messages.map(rowToMessage),
    tasks: rows.tasks.map(rowToTask),
    notes: rows.task_history.map(rowToNote),
    notifications: rows.notifications.map(rowToNotification),
    settings: buildSettings(rows.settings[0] ?? null, rows.departments, rows.assignment_rules),
  };
}
