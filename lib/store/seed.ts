/**
 * Seed dataset — a believable Marbella villa portfolio. Stable, readable ids so
 * cross-references are obvious; this is the only place demo data lives.
 */
import type {
  Conversation,
  Database,
  Guest,
  Message,
  Note,
  Notification,
  Property,
  Staff,
  Task,
} from "@/lib/domain";

const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

const ROOMS = [
  "Master Bedroom",
  "Guest Bedroom",
  "Master Bathroom",
  "Bathroom",
  "Kitchen",
  "Living Room",
  "Pool",
  "Terrace",
  "Cinema Room",
  "Gym",
  "Garden",
];

const properties: Property[] = [
  { id: "prop_ocean", name: "Villa Ocean", area: "Golden Mile", bedrooms: 6, status: "occupied", currentGuestId: "guest_james", rooms: ROOMS },
  { id: "prop_sol", name: "Villa Sol", area: "Sierra Blanca", bedrooms: 5, status: "occupied", currentGuestId: "guest_sophie", rooms: ROOMS },
  { id: "prop_sierra", name: "Villa Sierra", area: "El Madroñal", bedrooms: 7, status: "occupied", currentGuestId: "guest_mohammed", rooms: ROOMS },
  { id: "prop_aura", name: "Villa Aura", area: "La Zagaleta", bedrooms: 7, status: "arriving", currentGuestId: null, rooms: ROOMS },
  { id: "prop_mar", name: "Villa Mar", area: "Puerto Banús", bedrooms: 4, status: "cleaning", currentGuestId: null, rooms: ROOMS },
  { id: "prop_luz", name: "Villa Luz", area: "Nueva Andalucía", bedrooms: 5, status: "vacant", currentGuestId: null, rooms: ROOMS },
];

const guests: Guest[] = [
  { id: "guest_james", name: "James Whitmore", phone: "+447700900123", locale: "en", propertyId: "prop_ocean", vip: true, checkIn: hoursAgo(50), checkOut: hoursAgo(-94) },
  { id: "guest_sophie", name: "Sophie Laurent", phone: "+33612345678", locale: "fr", propertyId: "prop_sol", vip: false, checkIn: hoursAgo(26), checkOut: hoursAgo(-70) },
  { id: "guest_mohammed", name: "Mohammed Al-Rashid", phone: "+971501234567", locale: "en", propertyId: "prop_sierra", vip: true, checkIn: hoursAgo(74), checkOut: hoursAgo(-46) },
];

const staff: Staff[] = [
  { id: "staff_carlos", name: "Carlos Núñez", role: "Maintenance Lead", department: "maintenance", presence: "available", initials: "CN" },
  { id: "staff_diego", name: "Diego Romero", role: "Maintenance Technician", department: "maintenance", presence: "busy", initials: "DR" },
  { id: "staff_marta", name: "Marta Gil", role: "Head Housekeeper", department: "housekeeping", presence: "available", initials: "MG" },
  { id: "staff_elena", name: "Elena Costa", role: "Housekeeper", department: "housekeeping", presence: "busy", initials: "EC" },
  { id: "staff_lucia", name: "Lucía Fernández", role: "Lead Concierge", department: "concierge", presence: "available", initials: "LF" },
  { id: "staff_sofia", name: "Sofía Vidal", role: "Concierge", department: "concierge", presence: "off", initials: "SV" },
  { id: "staff_andres", name: "Andrés Soto", role: "Security", department: "security", presence: "available", initials: "AS" },
];

const tasks: Task[] = [
  {
    id: "task_seed_1", code: "REQ-1041", title: "Airport transfer — 4 guests", description: "Arrival transfer requested for this evening.",
    category: "transport", department: "concierge", priority: "high", intent: "request", status: "in_progress",
    propertyId: "prop_sol", room: null, assigneeId: "staff_lucia", guestId: "guest_sophie", conversationId: "conv_sol",
    sourceMessageId: "msg_sol_1", aiConfidence: 0.94, createdAt: minsAgo(38), updatedAt: minsAgo(12), completedAt: null,
  },
  {
    id: "task_seed_2", code: "REQ-1040", title: "Private chef — dinner for 6", description: "Tonight, Mediterranean menu.",
    category: "fnb", department: "concierge", priority: "normal", intent: "request", status: "new",
    propertyId: "prop_sierra", room: null, assigneeId: null, guestId: "guest_mohammed", conversationId: null,
    sourceMessageId: null, aiConfidence: 0.9, createdAt: minsAgo(54), updatedAt: minsAgo(54), completedAt: null,
  },
  {
    id: "task_seed_3", code: "REQ-1039", title: "Pre-arrival inspection", description: "Full walkthrough before check-in.",
    category: "housekeeping", department: "housekeeping", priority: "normal", intent: "request", status: "in_progress",
    propertyId: "prop_aura", room: null, assigneeId: "staff_marta", guestId: null, conversationId: null,
    sourceMessageId: null, aiConfidence: null, createdAt: hoursAgo(2), updatedAt: minsAgo(20), completedAt: null,
  },
  {
    id: "task_seed_4", code: "REQ-1038", title: "Restock pool bar & towels", description: null,
    category: "housekeeping", department: "housekeeping", priority: "low", intent: "request", status: "on_hold",
    propertyId: "prop_ocean", room: "Pool", assigneeId: "staff_elena", guestId: null, conversationId: null,
    sourceMessageId: null, aiConfidence: null, createdAt: hoursAgo(3), updatedAt: hoursAgo(1), completedAt: null,
  },
  {
    id: "task_seed_5", code: "REQ-1035", title: "Spa booking — couples massage", description: "Booked for 17:00.",
    category: "concierge", department: "concierge", priority: "normal", intent: "request", status: "completed",
    propertyId: "prop_ocean", room: null, assigneeId: "staff_lucia", guestId: "guest_james", conversationId: "conv_ocean",
    sourceMessageId: "msg_ocean_1", aiConfidence: 0.92, createdAt: hoursAgo(5), updatedAt: hoursAgo(4), completedAt: hoursAgo(4),
  },
  {
    id: "task_seed_6", code: "REQ-1033", title: "Welcome champagne & flowers", description: null,
    category: "concierge", department: "concierge", priority: "normal", intent: "request", status: "completed",
    propertyId: "prop_sierra", room: null, assigneeId: "staff_sofia", guestId: "guest_mohammed", conversationId: null,
    sourceMessageId: null, aiConfidence: null, createdAt: hoursAgo(6), updatedAt: hoursAgo(5), completedAt: hoursAgo(5),
  },
];

const conversations: Conversation[] = [
  { id: "conv_sol", channel: "whatsapp", propertyId: "prop_sol", guestId: "guest_sophie", createdAt: minsAgo(40), lastMessageAt: minsAgo(38) },
  { id: "conv_ocean", channel: "whatsapp", propertyId: "prop_ocean", guestId: "guest_james", createdAt: hoursAgo(5), lastMessageAt: hoursAgo(4) },
];

const messages: Message[] = [
  { id: "msg_sol_1", conversationId: "conv_sol", direction: "inbound", channel: "whatsapp", body: "Bonjour, can you arrange an airport transfer for 4 this evening?", author: "Sophie Laurent", createdAt: minsAgo(40), taskId: "task_seed_1" },
  { id: "msg_sol_2", conversationId: "conv_sol", direction: "outbound", channel: "whatsapp", body: "Of course Sophie — booking a transfer for 4 now. I'll confirm the driver shortly.", author: "LUXA", createdAt: minsAgo(38) },
  { id: "msg_ocean_1", conversationId: "conv_ocean", direction: "inbound", channel: "whatsapp", body: "Could we book a couples massage at the villa this afternoon?", author: "James Whitmore", createdAt: hoursAgo(5), taskId: "task_seed_5" },
  { id: "msg_ocean_2", conversationId: "conv_ocean", direction: "outbound", channel: "whatsapp", body: "Absolutely — I've reserved a couples massage for 17:00.", author: "LUXA", createdAt: hoursAgo(4) },
];

const notes: Note[] = [
  { id: "note_seed_1", taskId: "task_seed_1", authorId: null, authorName: "System", body: "Assigned to Lucía Fernández", createdAt: minsAgo(36), system: true },
  { id: "note_seed_2", taskId: "task_seed_1", authorId: "staff_lucia", authorName: "Lucía Fernández", body: "Mercedes V-Class booked, driver Pablo. ETA 19:45.", createdAt: minsAgo(12), system: false },
];

const notifications: Notification[] = [
  { id: "ntf_seed_1", kind: "new_task", title: "New request", body: "Private chef — dinner for 6 · Villa Sierra", taskId: "task_seed_2", createdAt: minsAgo(54), read: false },
  { id: "ntf_seed_2", kind: "assignment", title: "Task assigned", body: "Airport transfer — 4 guests → Lucía", taskId: "task_seed_1", createdAt: minsAgo(36), read: true },
];

export function createSeed(): Database {
  return {
    properties: structuredClone(properties),
    guests: structuredClone(guests),
    staff: structuredClone(staff),
    conversations: structuredClone(conversations),
    messages: structuredClone(messages),
    tasks: structuredClone(tasks),
    notes: structuredClone(notes),
    notifications: structuredClone(notifications),
  };
}
