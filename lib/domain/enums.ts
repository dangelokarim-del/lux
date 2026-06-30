/**
 * Domain enums + their presentation metadata. Single source of truth for every
 * status, priority, category and channel in the product. Components read labels
 * and tones from here — never hardcode a status string or color in the UI.
 *
 * Values are machine-friendly (snake_case) so they map cleanly onto a future
 * Postgres/Supabase schema; `label` is what humans see.
 */
import type { Tone } from "@/lib/tone";

/* ----------------------------- Departments ----------------------------- */
export const DEPARTMENTS = ["maintenance", "housekeeping", "concierge", "security", "front_desk"] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const departmentMeta: Record<Department, { label: string }> = {
  maintenance: { label: "Maintenance" },
  housekeeping: { label: "Housekeeping" },
  concierge: { label: "Concierge" },
  security: { label: "Security" },
  front_desk: { label: "Front Desk" },
};

/* ------------------------------ Categories ------------------------------ */
export const CATEGORIES = ["maintenance", "housekeeping", "concierge", "fnb", "transport", "security", "other"] as const;
export type TaskCategory = (typeof CATEGORIES)[number];

export const categoryMeta: Record<TaskCategory, { label: string; department: Department }> = {
  maintenance: { label: "Maintenance", department: "maintenance" },
  housekeeping: { label: "Housekeeping", department: "housekeeping" },
  concierge: { label: "Concierge", department: "concierge" },
  fnb: { label: "Food & Beverage", department: "concierge" },
  transport: { label: "Transport", department: "concierge" },
  security: { label: "Security", department: "security" },
  other: { label: "General", department: "front_desk" },
};

/** the department that should own a given category */
export const departmentForCategory = (c: TaskCategory): Department => categoryMeta[c].department;

/* ------------------------------- Priority ------------------------------- */
export const PRIORITIES = ["urgent", "high", "normal", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const priorityMeta: Record<Priority, { label: string; tone: Tone; weight: number }> = {
  urgent: { label: "Urgent", tone: "urgent", weight: 3 },
  high: { label: "High", tone: "warn", weight: 2 },
  normal: { label: "Normal", tone: "neutral", weight: 1 },
  low: { label: "Low", tone: "muted", weight: 0 },
};

/* ----------------------------- Task status ------------------------------ */
export const TASK_STATUSES = ["new", "in_progress", "on_hold", "completed", "cancelled"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const statusMeta: Record<TaskStatus, { label: string; tone: Tone; open: boolean }> = {
  new: { label: "New", tone: "accent", open: true },
  in_progress: { label: "In Progress", tone: "warn", open: true },
  on_hold: { label: "On Hold", tone: "muted", open: true },
  completed: { label: "Completed", tone: "ok", open: false },
  cancelled: { label: "Cancelled", tone: "muted", open: false },
};

/** columns shown on the operations board, in order */
export const BOARD_STATUSES: TaskStatus[] = ["new", "in_progress", "on_hold", "completed"];

/** statuses a manager can move a task into from its current one */
export function nextStatuses(current: TaskStatus): TaskStatus[] {
  if (current === "completed" || current === "cancelled") return ["new"];
  return TASK_STATUSES.filter((s) => s !== current);
}

/* -------------------------------- Intent -------------------------------- */
export const INTENTS = ["issue", "request", "question", "complaint", "feedback"] as const;
export type Intent = (typeof INTENTS)[number];

export const intentMeta: Record<Intent, { label: string }> = {
  issue: { label: "Issue reported" },
  request: { label: "Service request" },
  question: { label: "Question" },
  complaint: { label: "Complaint" },
  feedback: { label: "Feedback" },
};

/* ------------------------------- Channels ------------------------------- */
export const CHANNELS = ["whatsapp", "email", "call", "in_app"] as const;
export type Channel = (typeof CHANNELS)[number];

export const channelMeta: Record<Channel, { label: string }> = {
  whatsapp: { label: "WhatsApp" },
  email: { label: "Email" },
  call: { label: "Call" },
  in_app: { label: "In-App" },
};

/* --------------------------- Property status ---------------------------- */
export const PROPERTY_STATUSES = ["occupied", "arriving", "cleaning", "vacant"] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const propertyStatusMeta: Record<PropertyStatus, { label: string; tone: Tone }> = {
  occupied: { label: "Occupied", tone: "ok" },
  arriving: { label: "Arriving", tone: "accent" },
  cleaning: { label: "Cleaning", tone: "warn" },
  vacant: { label: "Vacant", tone: "muted" },
};

/* ------------------------------- Presence ------------------------------- */
export const PRESENCES = ["available", "busy", "off"] as const;
export type Presence = (typeof PRESENCES)[number];

export const presenceMeta: Record<Presence, { label: string; tone: Tone }> = {
  available: { label: "Available", tone: "ok" },
  busy: { label: "Busy", tone: "warn" },
  off: { label: "Off shift", tone: "muted" },
};
