/**
 * Core entity models. These are the reusable shapes the whole product is built
 * on and map 1:1 onto a future Supabase schema (each interface ≈ one table).
 * Timestamps are ISO strings so they serialize cleanly over the wire.
 */
import type {
  Channel,
  Department,
  Intent,
  Presence,
  Priority,
  PropertyStatus,
  TaskCategory,
  TaskStatus,
} from "./enums";

/* ------------------------------ Property -------------------------------- */
export interface Property {
  id: string;
  name: string;
  area: string; // e.g. "Sierra Blanca"
  bedrooms: number;
  status: PropertyStatus;
  currentGuestId: string | null;
  /** rooms the AI can map a request to */
  rooms: string[];
}

/* -------------------------------- Guest --------------------------------- */
export interface Guest {
  id: string;
  name: string;
  phone: string; // E.164, the WhatsApp identity
  locale: string; // e.g. "en", "es"
  propertyId: string | null;
  vip: boolean;
  checkIn?: string;
  checkOut?: string;
}

/* -------------------------------- Staff --------------------------------- */
export interface Staff {
  id: string;
  name: string;
  role: string;
  department: Department;
  presence: Presence;
  initials: string;
}

/* ----------------------------- Conversation ----------------------------- */
export interface Conversation {
  id: string;
  channel: Channel;
  propertyId: string | null;
  guestId: string | null;
  createdAt: string;
  lastMessageAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  direction: "inbound" | "outbound";
  channel: Channel;
  body: string;
  /** display name of the sender (guest name, "LUXA", or staff name) */
  author: string;
  createdAt: string;
  /** provider id (e.g. WhatsApp wamid) when it came from a real channel */
  externalId?: string;
  /** the AI extraction produced from this message, if any */
  extraction?: Extraction;
  /** the task spawned from this message, if any */
  taskId?: string;
}

/* ------------------------------ Extraction ------------------------------ */
/** The structured output the AI returns for an inbound message. */
export interface Extraction {
  intent: Intent;
  category: TaskCategory;
  department: Department;
  priority: Priority;
  propertyId: string | null;
  propertyName: string | null;
  room: string | null;
  /** a concise, action-oriented task title */
  title: string;
  /** one-line summary of what the guest needs */
  summary: string;
  /** model confidence 0–1 */
  confidence: number;
}

/* -------------------------------- Note ---------------------------------- */
export interface Note {
  id: string;
  taskId: string;
  authorId: string | null;
  authorName: string;
  body: string;
  createdAt: string;
  /** system notes are activity-log entries (status changes, assignments) */
  system: boolean;
}

/* -------------------------------- Task ---------------------------------- */
export interface Task {
  id: string;
  code: string; // human ref, e.g. "REQ-1042"
  title: string;
  description: string | null;
  category: TaskCategory;
  department: Department;
  priority: Priority;
  intent: Intent | null;
  status: TaskStatus;
  propertyId: string | null;
  room: string | null;
  assigneeId: string | null;
  guestId: string | null;
  conversationId: string | null;
  sourceMessageId: string | null;
  /** how confident the AI was when it created this task */
  aiConfidence: number | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

/* ----------------------------- Notification ----------------------------- */
export type NotificationKind = "new_task" | "status_change" | "assignment" | "message";

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  taskId: string | null;
  createdAt: string;
  read: boolean;
}

/** The full in-memory database shape (one array per future table). */
export interface Database {
  properties: Property[];
  guests: Guest[];
  staff: Staff[];
  conversations: Conversation[];
  messages: Message[];
  tasks: Task[];
  notes: Note[];
  notifications: Notification[];
}

// re-export the enum unions so consumers can import models + types from one place
export type { Channel, Department, Intent, Presence, Priority, PropertyStatus, TaskCategory, TaskStatus };
