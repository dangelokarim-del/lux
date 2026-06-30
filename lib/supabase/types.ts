/**
 * Database row shapes (snake_case, as Postgres returns them). These are the wire
 * format; `mappers.ts` converts them to/from the camelCase domain models so the
 * rest of the app never sees a raw row.
 */
import type {
  Channel,
  Department,
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
  name: string;
  area: string;
  bedrooms: number;
  status: PropertyStatus;
  rooms: string[];
  current_guest_id: string | null;
  created_at: string;
}

export interface GuestRow {
  id: string;
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
  user_id: string | null;
  name: string;
  role: string;
  department: Department;
  presence: Presence;
  initials: string;
  created_at: string;
}

export interface ConversationRow {
  id: string;
  channel: Channel;
  property_id: string | null;
  guest_id: string | null;
  created_at: string;
  last_message_at: string;
}

export interface MessageRow {
  id: string;
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
  code: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  department: Department;
  priority: Priority;
  intent: Intent | null;
  status: TaskStatus;
  property_id: string | null;
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
  kind: NotificationKind;
  title: string;
  body: string;
  task_id: string | null;
  read: boolean;
  created_at: string;
}

/** table name → row type, used for the realtime fan-out */
export type Tables = {
  properties: PropertyRow;
  guests: GuestRow;
  staff: StaffRow;
  conversations: ConversationRow;
  messages: MessageRow;
  tasks: TaskRow;
  activity_log: ActivityRow;
  notifications: NotificationRow;
};
