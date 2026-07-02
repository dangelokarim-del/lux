/**
 * Demo workspace seed — three believable customer organizations so the
 * multi-tenant platform is tangible without any backend: Marbella Portfolio,
 * Ibiza Villas and Dubai Concierge. Each has its own properties, team, tasks,
 * settings and WhatsApp number. Switching between them changes everything the
 * dashboard shows — exactly as real clients would be isolated in production.
 */
import {
  createDefaultSettings,
  type Conversation,
  type Database,
  type Guest,
  type Message,
  type Note,
  type Notification,
  type Organization,
  type Property,
  type Settings,
  type Staff,
  type Task,
  type WhatsAppAccount,
} from "@/lib/domain";

const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

const ROOMS = ["Master Bedroom", "Guest Bedroom", "Master Bathroom", "Bathroom", "Kitchen", "Living Room", "Pool", "Terrace", "Cinema Room", "Gym", "Garden"];

const emptyDb = (settings: Settings): Database => ({
  properties: [], guests: [], staff: [], conversations: [], messages: [], tasks: [], notes: [], notifications: [], settings,
});

/* ========================================================================== *
 *  1 · MARBELLA PORTFOLIO — the flagship demo (rich data)
 * ========================================================================== */
function marbella(): Database {
  const properties: Property[] = [
    { id: "prop_ocean", name: "Villa Ocean", type: "Villa", area: "Golden Mile", bedrooms: 6, status: "occupied", currentGuestId: "guest_james", rooms: ROOMS },
    { id: "prop_sol", name: "Villa Sol", type: "Villa", area: "Sierra Blanca", bedrooms: 5, status: "occupied", currentGuestId: "guest_sophie", rooms: ROOMS },
    { id: "prop_sierra", name: "Villa Sierra", type: "Villa", area: "El Madroñal", bedrooms: 7, status: "occupied", currentGuestId: "guest_mohammed", rooms: ROOMS },
    { id: "prop_aura", name: "Villa Aura", type: "Villa", area: "La Zagaleta", bedrooms: 7, status: "arriving", currentGuestId: null, rooms: ROOMS },
    { id: "prop_mar", name: "Villa Mar", type: "Villa", area: "Puerto Banús", bedrooms: 4, status: "cleaning", currentGuestId: null, rooms: ROOMS },
    { id: "prop_luz", name: "Villa Luz", type: "Villa", area: "Nueva Andalucía", bedrooms: 5, status: "vacant", currentGuestId: null, rooms: ROOMS },
  ];
  const guests: Guest[] = [
    { id: "guest_james", name: "James Whitmore", phone: "+447700900123", locale: "en", propertyId: "prop_ocean", vip: true, checkIn: hoursAgo(50), checkOut: hoursAgo(-94) },
    { id: "guest_sophie", name: "Sophie Laurent", phone: "+33612345678", locale: "fr", propertyId: "prop_sol", vip: false, checkIn: hoursAgo(26), checkOut: hoursAgo(-70) },
    { id: "guest_mohammed", name: "Mohammed Al-Rashid", phone: "+971501234567", locale: "en", propertyId: "prop_sierra", vip: true, checkIn: hoursAgo(74), checkOut: hoursAgo(-46) },
  ];
  const staff: Staff[] = [
    { id: "staff_carlos", name: "Carlos Núñez", role: "Maintenance Lead", department: "maintenance", presence: "available", initials: "CN", phone: "+34600111222", email: "carlos@marbella.luxa.app", maxActiveTasks: 5, workingHours: "08:00–18:00", languages: ["es", "en"] },
    { id: "staff_diego", name: "Diego Romero", role: "Maintenance Technician", department: "maintenance", presence: "busy", initials: "DR", maxActiveTasks: 4, languages: ["es"] },
    { id: "staff_marta", name: "Marta Gil", role: "Head Housekeeper", department: "housekeeping", presence: "available", initials: "MG", maxActiveTasks: 6, languages: ["es", "en"] },
    { id: "staff_elena", name: "Elena Costa", role: "Housekeeper", department: "housekeeping", presence: "busy", initials: "EC", maxActiveTasks: 5, languages: ["es"] },
    { id: "staff_lucia", name: "Lucía Fernández", role: "Lead Concierge", department: "concierge", presence: "available", initials: "LF", maxActiveTasks: 8, languages: ["es", "en", "fr"] },
    { id: "staff_sofia", name: "Sofía Vidal", role: "Concierge", department: "concierge", presence: "off", initials: "SV", maxActiveTasks: 6, languages: ["es", "en"] },
    { id: "staff_pablo", name: "Pablo Ruiz", role: "Head Driver", department: "transport", presence: "available", initials: "PR", maxActiveTasks: 4, languages: ["es", "en"] },
    { id: "staff_andres", name: "Andrés Soto", role: "Security", department: "security", presence: "available", initials: "AS", maxActiveTasks: 5, languages: ["es"] },
  ];
  const tasks: Task[] = [
    { id: "m_t1", code: "REQ-1041", title: "Airport transfer — 4 guests", description: "Arrival transfer requested for this evening.", category: "transport", department: "transport", priority: "high", intent: "request", status: "in_progress", propertyId: "prop_sol", room: null, assigneeId: "staff_pablo", guestId: "guest_sophie", conversationId: "conv_sol", sourceMessageId: "msg_sol_1", aiConfidence: 0.94, createdAt: minsAgo(38), updatedAt: minsAgo(12), completedAt: null },
    { id: "m_t2", code: "REQ-1040", title: "Private chef — dinner for 6", description: "Tonight, Mediterranean menu.", category: "fnb", department: "concierge", priority: "normal", intent: "request", status: "new", propertyId: "prop_sierra", room: null, assigneeId: null, guestId: "guest_mohammed", conversationId: null, sourceMessageId: null, aiConfidence: 0.9, createdAt: minsAgo(54), updatedAt: minsAgo(54), completedAt: null },
    { id: "m_t3", code: "REQ-1039", title: "Pre-arrival inspection", description: "Full walkthrough before check-in.", category: "housekeeping", department: "housekeeping", priority: "normal", intent: "request", status: "in_progress", propertyId: "prop_aura", room: null, assigneeId: "staff_marta", guestId: null, conversationId: null, sourceMessageId: null, aiConfidence: null, createdAt: hoursAgo(2), updatedAt: minsAgo(20), completedAt: null },
    { id: "m_t4", code: "REQ-1038", title: "Restock pool bar & towels", description: null, category: "housekeeping", department: "housekeeping", priority: "low", intent: "request", status: "on_hold", propertyId: "prop_ocean", room: "Pool", assigneeId: "staff_elena", guestId: null, conversationId: null, sourceMessageId: null, aiConfidence: null, createdAt: hoursAgo(3), updatedAt: hoursAgo(1), completedAt: null },
    { id: "m_t5", code: "REQ-1035", title: "AC — Master Bedroom", description: "Not cooling in the master bedroom.", category: "maintenance", department: "maintenance", priority: "urgent", intent: "issue", status: "completed", propertyId: "prop_ocean", room: "Master Bedroom", assigneeId: "staff_carlos", guestId: "guest_james", conversationId: "conv_ocean", sourceMessageId: "msg_ocean_1", aiConfidence: 0.96, createdAt: hoursAgo(5), updatedAt: hoursAgo(4), completedAt: hoursAgo(4) },
  ];
  const conversations: Conversation[] = [
    { id: "conv_sol", channel: "whatsapp", propertyId: "prop_sol", guestId: "guest_sophie", createdAt: minsAgo(40), lastMessageAt: minsAgo(38) },
    { id: "conv_ocean", channel: "whatsapp", propertyId: "prop_ocean", guestId: "guest_james", createdAt: hoursAgo(5), lastMessageAt: hoursAgo(4) },
  ];
  const messages: Message[] = [
    { id: "msg_sol_1", conversationId: "conv_sol", direction: "inbound", channel: "whatsapp", body: "Bonjour, can you arrange an airport transfer for 4 this evening?", author: "Sophie Laurent", createdAt: minsAgo(40), taskId: "m_t1" },
    { id: "msg_sol_2", conversationId: "conv_sol", direction: "outbound", channel: "whatsapp", body: "Of course Sophie — booking a transfer for 4 now.", author: "LUXA", createdAt: minsAgo(38) },
    { id: "msg_ocean_1", conversationId: "conv_ocean", direction: "inbound", channel: "whatsapp", body: "Hi, the AC is not working in the master bedroom.", author: "James Whitmore", createdAt: hoursAgo(5), taskId: "m_t5" },
    { id: "msg_ocean_2", conversationId: "conv_ocean", direction: "outbound", channel: "whatsapp", body: "I've logged this with our Maintenance team and we're on it.", author: "LUXA", createdAt: hoursAgo(5) },
  ];
  const notes: Note[] = [
    { id: "m_n1", taskId: "m_t1", authorId: null, authorName: "System", body: "Auto-assigned to Pablo Ruiz", createdAt: minsAgo(36), system: true },
  ];
  const notifications: Notification[] = [
    { id: "m_nt1", kind: "new_task", title: "New request", body: "Private chef — dinner for 6 · Villa Sierra", taskId: "m_t2", createdAt: minsAgo(54), read: false },
  ];
  return {
    properties, guests, staff, conversations, messages, tasks, notes, notifications,
    settings: { ...createDefaultSettings(), portfolioName: "Marbella Portfolio", location: "Marbella" },
  };
}

/* ========================================================================== *
 *  2 · IBIZA VILLAS
 * ========================================================================== */
function ibiza(): Database {
  const db = emptyDb({ ...createDefaultSettings(), portfolioName: "Ibiza Villas", location: "Ibiza", brandMark: "IBIZA" });
  db.properties = [
    { id: "ib_blanca", name: "Villa Blanca", type: "Villa", area: "Ibiza Town", bedrooms: 4, status: "occupied", currentGuestId: "ib_g1", rooms: ROOMS },
    { id: "ib_vista", name: "Casa Vista", type: "Villa", area: "San José", bedrooms: 5, status: "arriving", currentGuestId: null, rooms: ROOMS },
    { id: "ib_vedra", name: "Villa Es Vedrà", type: "Villa", area: "Es Cubells", bedrooms: 6, status: "occupied", currentGuestId: "ib_g2", rooms: ROOMS },
    { id: "ib_loft", name: "Talamanca Sea Loft", type: "Apartment", area: "Talamanca", bedrooms: 2, status: "cleaning", currentGuestId: null, rooms: ROOMS },
  ];
  db.guests = [
    { id: "ib_g1", name: "Oliver Grant", phone: "+447911123456", locale: "en", propertyId: "ib_blanca", vip: true, checkIn: hoursAgo(30), checkOut: hoursAgo(-60) },
    { id: "ib_g2", name: "Isabella Conti", phone: "+393401122334", locale: "it", propertyId: "ib_vedra", vip: false, checkIn: hoursAgo(20), checkOut: hoursAgo(-52) },
  ];
  db.staff = [
    { id: "ib_marco", name: "Marco Ferrer", role: "Maintenance Lead", department: "maintenance", presence: "available", initials: "MF", maxActiveTasks: 5, languages: ["es", "en"] },
    { id: "ib_nuria", name: "Nuria Pons", role: "Head Housekeeper", department: "housekeeping", presence: "busy", initials: "NP", maxActiveTasks: 6, languages: ["es"] },
    { id: "ib_aitana", name: "Aitana Roig", role: "Lead Concierge", department: "concierge", presence: "available", initials: "AR", maxActiveTasks: 7, languages: ["es", "en", "it"] },
    { id: "ib_bruno", name: "Bruno Sanz", role: "Driver", department: "transport", presence: "available", initials: "BS", maxActiveTasks: 4, languages: ["es", "en"] },
  ];
  db.tasks = [
    { id: "ib_t1", code: "REQ-2007", title: "Yacht day charter", description: "Full-day charter for 8, Saturday.", category: "concierge", department: "concierge", priority: "high", intent: "request", status: "in_progress", propertyId: "ib_blanca", room: null, assigneeId: "ib_aitana", guestId: "ib_g1", conversationId: null, sourceMessageId: null, aiConfidence: 0.93, createdAt: minsAgo(25), updatedAt: minsAgo(8), completedAt: null },
    { id: "ib_t2", code: "REQ-2006", title: "Pool heating not working", description: "Pool cold since this morning.", category: "maintenance", department: "maintenance", priority: "urgent", intent: "issue", status: "new", propertyId: "ib_vedra", room: "Pool", assigneeId: "ib_marco", guestId: "ib_g2", conversationId: null, sourceMessageId: null, aiConfidence: 0.95, createdAt: minsAgo(15), updatedAt: minsAgo(15), completedAt: null },
    { id: "ib_t3", code: "REQ-2004", title: "Fresh towels & turndown", description: null, category: "housekeeping", department: "housekeeping", priority: "normal", intent: "request", status: "completed", propertyId: "ib_blanca", room: null, assigneeId: "ib_nuria", guestId: "ib_g1", conversationId: null, sourceMessageId: null, aiConfidence: null, createdAt: hoursAgo(3), updatedAt: hoursAgo(2), completedAt: hoursAgo(2) },
  ];
  db.notifications = [
    { id: "ib_nt1", kind: "new_task", title: "New request", body: "Pool heating not working · Villa Es Vedrà", taskId: "ib_t2", createdAt: minsAgo(15), read: false },
  ];
  return db;
}

/* ========================================================================== *
 *  3 · DUBAI CONCIERGE
 * ========================================================================== */
function dubai(): Database {
  const db = emptyDb({ ...createDefaultSettings(), portfolioName: "Dubai Concierge", location: "Dubai", timezone: "Asia/Dubai", brandMark: "DUBAI" });
  db.properties = [
    { id: "db_palm", name: "Palm Signature Villa", type: "Villa", area: "Palm Jumeirah", bedrooms: 7, status: "occupied", currentGuestId: "db_g1", rooms: ROOMS },
    { id: "db_marina", name: "Marina Sky Penthouse", type: "Penthouse", area: "Dubai Marina", bedrooms: 4, status: "occupied", currentGuestId: "db_g2", rooms: ROOMS },
    { id: "db_barari", name: "Desert Retreat", type: "Villa", area: "Al Barari", bedrooms: 6, status: "arriving", currentGuestId: null, rooms: ROOMS },
    { id: "db_burj", name: "Burj Residence", type: "Apartment", area: "Downtown", bedrooms: 3, status: "vacant", currentGuestId: null, rooms: ROOMS },
  ];
  db.guests = [
    { id: "db_g1", name: "Alexander Petrov", phone: "+79161234567", locale: "en", propertyId: "db_palm", vip: true, checkIn: hoursAgo(40), checkOut: hoursAgo(-120) },
    { id: "db_g2", name: "Layla Haddad", phone: "+9613112233", locale: "ar", propertyId: "db_marina", vip: true, checkIn: hoursAgo(18), checkOut: hoursAgo(-54) },
  ];
  db.staff = [
    { id: "db_rashid", name: "Rashid Al-Maktoum", role: "Concierge Lead", department: "concierge", presence: "available", initials: "RA", maxActiveTasks: 8, languages: ["ar", "en"] },
    { id: "db_priya", name: "Priya Nair", role: "Head Housekeeper", department: "housekeeping", presence: "available", initials: "PN", maxActiveTasks: 6, languages: ["en", "hi"] },
    { id: "db_omar", name: "Omar Haddad", role: "Maintenance Lead", department: "maintenance", presence: "busy", initials: "OH", maxActiveTasks: 5, languages: ["ar", "en"] },
    { id: "db_yara", name: "Yara Fahim", role: "Reservations", department: "reservations", presence: "available", initials: "YF", maxActiveTasks: 7, languages: ["ar", "en", "fr"] },
  ];
  db.tasks = [
    { id: "db_t1", code: "REQ-3012", title: "Restaurant — Nobu, table for 6", description: "Tonight 21:00, terrace preferred.", category: "concierge", department: "concierge", priority: "high", intent: "request", status: "in_progress", propertyId: "db_palm", room: null, assigneeId: "db_rashid", guestId: "db_g1", conversationId: null, sourceMessageId: null, aiConfidence: 0.94, createdAt: minsAgo(22), updatedAt: minsAgo(6), completedAt: null },
    { id: "db_t2", code: "REQ-3011", title: "Chauffeur — Rolls-Royce, 3 days", description: "Full-day chauffeur service.", category: "transport", department: "reservations", priority: "normal", intent: "request", status: "new", propertyId: "db_marina", room: null, assigneeId: "db_yara", guestId: "db_g2", conversationId: null, sourceMessageId: null, aiConfidence: 0.9, createdAt: minsAgo(33), updatedAt: minsAgo(33), completedAt: null },
    { id: "db_t3", code: "REQ-3009", title: "AC servicing — living room", description: "Cooling weak in the main living area.", category: "maintenance", department: "maintenance", priority: "high", intent: "issue", status: "on_hold", propertyId: "db_palm", room: "Living Room", assigneeId: "db_omar", guestId: "db_g1", conversationId: null, sourceMessageId: null, aiConfidence: 0.92, createdAt: hoursAgo(2), updatedAt: hoursAgo(1), completedAt: null },
    { id: "db_t4", code: "REQ-3006", title: "Welcome amenities & flowers", description: null, category: "housekeeping", department: "housekeeping", priority: "normal", intent: "request", status: "completed", propertyId: "db_marina", room: null, assigneeId: "db_priya", guestId: "db_g2", conversationId: null, sourceMessageId: null, aiConfidence: null, createdAt: hoursAgo(4), updatedAt: hoursAgo(3), completedAt: hoursAgo(3) },
  ];
  db.notifications = [
    { id: "db_nt1", kind: "new_task", title: "New request", body: "Chauffeur — Rolls-Royce, 3 days · Marina Sky Penthouse", taskId: "db_t2", createdAt: minsAgo(33), read: false },
  ];
  return db;
}

/* ========================================================================== *
 *  Workspace assembly
 * ========================================================================== */
export interface WorkspaceSeed {
  organizations: Organization[];
  whatsappAccounts: WhatsAppAccount[];
  dbByOrg: Record<string, Database>;
  currentOrgId: string;
}

export function createWorkspaceSeed(): WorkspaceSeed {
  const organizations: Organization[] = [
    { id: "org_marbella", name: "Marbella Portfolio", slug: "marbella-portfolio", plan: "Enterprise" },
    { id: "org_ibiza", name: "Ibiza Villas", slug: "ibiza-villas", plan: "Growth" },
    { id: "org_dubai", name: "Dubai Concierge", slug: "dubai-concierge", plan: "Starter" },
  ];
  const whatsappAccounts: WhatsAppAccount[] = [
    { id: "wa_marbella", organizationId: "org_marbella", phoneNumberId: "104938572910384", displayNumber: "+34 600 000 001", label: "Marbella · Main", active: true, lastMessageAt: hoursAgo(5) },
    { id: "wa_ibiza", organizationId: "org_ibiza", phoneNumberId: "228475019283746", displayNumber: "+34 600 000 002", label: "Ibiza · Guest line", active: true, lastMessageAt: minsAgo(15) },
    { id: "wa_dubai", organizationId: "org_dubai", phoneNumberId: "391827465019283", displayNumber: "+971 50 000 0003", label: "Dubai · Concierge", active: true, lastMessageAt: minsAgo(22) },
    { id: "wa_dubai_2", organizationId: "org_dubai", phoneNumberId: "482910384756201", displayNumber: "+971 50 000 0004", label: "Dubai · VIP overflow", active: false, lastMessageAt: null },
  ];
  const dbByOrg: Record<string, Database> = {
    org_marbella: marbella(),
    org_ibiza: ibiza(),
    org_dubai: dubai(),
  };
  return { organizations, whatsappAccounts, dbByOrg, currentOrgId: "org_marbella" };
}

/** legacy single-org seed (kept for any caller that wants one Database) */
export function createSeed(): Database {
  return createWorkspaceSeed().dbByOrg.org_marbella;
}
