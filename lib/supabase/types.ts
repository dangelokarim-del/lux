/**
 * Database row shapes (snake_case, as Postgres returns them). These are the wire
 * format; `mappers.ts` converts them to/from the camelCase domain models so the
 * rest of the app never sees a raw row. Multi-tenant: every business row carries
 * `organization_id`.
 */
import type {
  Channel,
  Intent,
  NotificationKind,
  Presence,
  Priority,
  PropertyStatus,
  TaskCategory,
  TaskStatus,
} from "@/lib/domain";

export interface PropertyRow {
  id: string;
  organization_id: string;
  name: string;
  type: string | null;
  area: string;
  bedrooms: number;
  status: PropertyStatus;
  rooms: string[];
  current_guest_id: string | null;
  assigned_team_ids: string[] | null;
  notes: string | null;
  created_at: string;
}

export interface GuestRow {
  id: string;
  organization_id: string;
  name: string;
  phone: string;
  locale: string;
  property_id: string | null;
  vip: boolean;
  check_in: string | null;
  check_out: string | null;
  created_at: string;
}

export interface StaffRow {
  id: string;
  organization_id: string;
  user_id: string | null;
  name: string;
  role: string;
  department: string;
  presence: Presence;
  initials: string;
  phone: string | null;
  email: string | null;
  max_active_tasks: number | null;
  working_hours: string | null;
  languages: string[] | null;
  assigned_property_ids: string[] | null;
  created_at: string;
}

export interface ConversationRow {
  id: string;
  organization_id: string;
  channel: Channel;
  property_id: string | null;
  guest_id: string | null;
  created_at: string;
  last_message_at: string;
}

export interface MessageRow {
  id: string;
  organization_id: string;
  conversation_id: string;
  direction: "inbound" | "outbound";
  channel: Channel;
  body: string;
  author: string;
  external_id: string | null;
  extraction: unknown | null;
  task_id: string | null;
  created_at: string;
}

export interface TaskRow {
  id: string;
  organization_id: string;
  code: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  department: string;
  priority: Priority;
  intent: Intent | null;
  status: TaskStatus;
  property_id: string | null;
  unit_id: string | null;
  room: string | null;
  assignee_id: string | null;
  guest_id: string | null;
  conversation_id: string | null;
  source_message_id: string | null;
  ai_confidence: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ActivityRow {
  id: string;
  organization_id: string;
  task_id: string;
  actor_id: string | null;
  actor_name: string;
  type: "created" | "note" | "status_change" | "assignment" | "completed";
  body: string;
  is_system: boolean;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  organization_id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  task_id: string | null;
  read: boolean;
  created_at: string;
}

/* --------------------------- configuration rows -------------------------- */
export interface SettingsRow {
  organization_id: string;
  portfolio_name: string;
  location: string;
  language: string;
  timezone: string;
  brand_mark: string;
  auto_assign: boolean;
  visible_kpis: string[];
  updated_at: string;
}

export interface DepartmentRow {
  id: string;
  organization_id: string;
  slug: string;
  label: string;
  custom: boolean;
  position: number;
}

export interface AssignmentRuleRow {
  id: string;
  organization_id: string;
  label: string;
  keywords: string[];
  category: TaskCategory;
  department: string;
  priority: Priority | null;
  enabled: boolean;
  position: number;
}

export interface UnitRow {
  id: string;
  organization_id: string;
  property_id: string;
  name: string;
  type: string;
  bedrooms: number;
  status: PropertyStatus;
}

export interface WhatsAppAccountRow {
  id: string;
  organization_id: string;
  phone_number_id: string;
  display_number: string | null;
  waba_id: string | null;
  label: string | null;
  active: boolean;
}

export interface MembershipRow {
  id: string;
  organization_id: string;
  user_id: string | null;
  email: string;
  name: string | null;
  role: "owner" | "admin" | "manager" | "staff";
}

/** table name → row type, used for the realtime fan-out (canonical SaaS names) */
export type Tables = {
  properties: PropertyRow;
  guests: GuestRow;
  team_members: StaffRow;
  conversations: ConversationRow;
  messages: MessageRow;
  tasks: TaskRow;
  task_history: ActivityRow;
  notifications: NotificationRow;
  settings: SettingsRow;
  departments: DepartmentRow;
  assignment_rules: AssignmentRuleRow;
  units: UnitRow;
};
