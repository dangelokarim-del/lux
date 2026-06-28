export type Department = "Maintenance" | "Concierge" | "Housekeeping" | "Security";

export type TaskStatus = "New" | "Pending" | "Confirmed" | "In Progress" | "Completed";

export type Priority = "Urgent" | "High" | "Normal";

export interface Task {
  id: string;
  villa: string;
  title: string;
  department: Department;
  priority: Priority;
  assignee: string | null;
  when: string;
  status: TaskStatus;
}

export type Presence = "Available" | "Busy" | "Off";

export interface Member {
  id: string;
  name: string;
  role: string;
  department: Department;
  presence: Presence;
  load: number; // open tasks
}

export type VillaState = "Occupied" | "Arriving" | "Cleaning" | "Vacant";

export interface Villa {
  id: string;
  name: string;
  area: string;
  guests: number;
  state: VillaState;
  openTasks: number;
}

export interface GuestRequest {
  id: string;
  villa: string;
  guest: string;
  message: string;
  channel: "WhatsApp" | "Email" | "Call" | "In-App";
  receivedAgo: string;
  resolved: boolean;
}
