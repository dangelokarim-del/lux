import type { Task, Member, Villa, GuestRequest } from "./types";

export const stats = [
  { label: "Open Tasks", value: 14, delta: "+3 today", tone: "default" as const },
  { label: "Urgent Requests", value: 2, delta: "needs action", tone: "urgent" as const },
  { label: "Completed Today", value: 28, delta: "+12%", tone: "ok" as const },
  { label: "Today's Check-ins", value: 6, delta: "2 arriving now", tone: "accent" as const },
];

export const tasks: Task[] = [
  {
    id: "T-1042",
    villa: "Villa Ocean",
    title: "AC not cooling — master suite",
    department: "Maintenance",
    priority: "Urgent",
    assignee: "Carlos",
    when: "Now",
    status: "In Progress",
  },
  {
    id: "T-1041",
    villa: "Villa Sol",
    title: "Airport transfer — 4 guests",
    department: "Concierge",
    priority: "High",
    assignee: "Lucía",
    when: "20:00",
    status: "Confirmed",
  },
  {
    id: "T-1040",
    villa: "Villa Aura",
    title: "Private chef — dinner for 6",
    department: "Concierge",
    priority: "Normal",
    assignee: null,
    when: "Tonight",
    status: "Pending",
  },
  {
    id: "T-1039",
    villa: "Villa Mar",
    title: "Cleaning inspection before check-in",
    department: "Housekeeping",
    priority: "Normal",
    assignee: "Marta",
    when: "11:30",
    status: "New",
  },
  {
    id: "T-1038",
    villa: "Villa Ocean",
    title: "Restock pool bar & towels",
    department: "Housekeeping",
    priority: "Normal",
    assignee: "Marta",
    when: "14:00",
    status: "In Progress",
  },
  {
    id: "T-1037",
    villa: "Villa Linda",
    title: "Late checkout request — approve",
    department: "Concierge",
    priority: "High",
    assignee: "Lucía",
    when: "12:00",
    status: "Pending",
  },
  {
    id: "T-1036",
    villa: "Villa Sol",
    title: "Gate intercom fault",
    department: "Maintenance",
    priority: "High",
    assignee: "Carlos",
    when: "Today",
    status: "New",
  },
  {
    id: "T-1035",
    villa: "Villa Aura",
    title: "Welcome hamper & champagne",
    department: "Concierge",
    priority: "Normal",
    assignee: "Lucía",
    when: "16:30",
    status: "Confirmed",
  },
];

export const team: Member[] = [
  { id: "M-1", name: "Carlos Núñez", role: "Maintenance Lead", department: "Maintenance", presence: "Busy", load: 3 },
  { id: "M-2", name: "Lucía Romero", role: "Head Concierge", department: "Concierge", presence: "Available", load: 4 },
  { id: "M-3", name: "Marta Díaz", role: "Housekeeping", department: "Housekeeping", presence: "Available", load: 2 },
  { id: "M-4", name: "Andrés Gil", role: "Security", department: "Security", presence: "Available", load: 0 },
  { id: "M-5", name: "Sofía Vidal", role: "Guest Relations", department: "Concierge", presence: "Off", load: 0 },
];

export const villas: Villa[] = [
  { id: "V-1", name: "Villa Ocean", area: "Puerto Banús", guests: 6, state: "Occupied", openTasks: 3 },
  { id: "V-2", name: "Villa Sol", area: "Nueva Andalucía", guests: 4, state: "Occupied", openTasks: 2 },
  { id: "V-3", name: "Villa Aura", area: "Sierra Blanca", guests: 8, state: "Arriving", openTasks: 4 },
  { id: "V-4", name: "Villa Mar", area: "Marbella Centro", guests: 0, state: "Cleaning", openTasks: 1 },
  { id: "V-5", name: "Villa Linda", area: "San Pedro", guests: 5, state: "Occupied", openTasks: 1 },
  { id: "V-6", name: "Villa Brisa", area: "Golden Mile", guests: 0, state: "Vacant", openTasks: 0 },
];

export const requests: GuestRequest[] = [
  {
    id: "R-1",
    villa: "Villa Ocean",
    guest: "Mr. Anderson",
    message: "The AC in the master bedroom isn't cooling. Can someone come today?",
    channel: "WhatsApp",
    receivedAgo: "4m ago",
    resolved: false,
  },
  {
    id: "R-2",
    villa: "Villa Aura",
    guest: "Familia Rossi",
    message: "We'd love a private chef for dinner tonight, around 8pm for 6 people.",
    channel: "WhatsApp",
    receivedAgo: "18m ago",
    resolved: false,
  },
  {
    id: "R-3",
    villa: "Villa Sol",
    guest: "Ms. Laurent",
    message: "Could you arrange an airport transfer for 4 at 8pm?",
    channel: "In-App",
    receivedAgo: "32m ago",
    resolved: true,
  },
  {
    id: "R-4",
    villa: "Villa Linda",
    guest: "Mr. Okafor",
    message: "Is a late checkout possible tomorrow? Flight is in the evening.",
    channel: "Email",
    receivedAgo: "1h ago",
    resolved: false,
  },
];

export const flowSteps = [
  { k: "01", title: "Guest Message", desc: "A request arrives over WhatsApp, email or call." },
  { k: "02", title: "AI Understands", desc: "LUXA reads intent, villa, urgency and timing." },
  { k: "03", title: "Task Created", desc: "A structured task is generated automatically." },
  { k: "04", title: "Team Assigned", desc: "Routed to the right person by role and load." },
  { k: "05", title: "Dashboard Updated", desc: "Everyone sees live status in real time." },
  { k: "06", title: "Completed", desc: "Resolved, logged and confirmed to the guest." },
];
