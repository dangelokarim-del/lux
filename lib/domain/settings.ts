/**
 * Configurable defaults. `createDefaultSettings()` is what a brand-new client
 * starts from; the demo seed overrides a few labels. Everything here is editable
 * from the in-app Settings/Admin area at runtime.
 */
import { DEPARTMENTS, departmentMeta, type Department } from "./enums";
import type { AssignmentRule, DepartmentDef, Settings } from "./models";

/** every KPI the dashboard can show — the client picks which are visible */
export const KPI_CATALOG: { id: string; label: string }[] = [
  { id: "open", label: "Open requests" },
  { id: "urgent", label: "Urgent" },
  { id: "in_progress", label: "In progress" },
  { id: "completed_today", label: "Completed today" },
  { id: "team_online", label: "Team online" },
  { id: "properties_active", label: "Properties active" },
  { id: "avg_response", label: "Avg response" },
];

export const ALL_KPI_IDS = KPI_CATALOG.map((k) => k.id);

/** built-in departments as editable defs */
export function defaultDepartments(): DepartmentDef[] {
  return (DEPARTMENTS as readonly Department[]).map((id) => ({ id, label: departmentMeta[id].label }));
}

/** the starter assignment rules — mirror the product spec's examples */
export function defaultRules(): AssignmentRule[] {
  return [
    { id: "rule_ac", label: "Air conditioning", keywords: ["ac", "a/c", "air conditioning", "cooling", "heating", "not working"], category: "maintenance", department: "maintenance", priority: "urgent", enabled: true },
    { id: "rule_plumbing", label: "Plumbing & electrical", keywords: ["leak", "flood", "water", "electric", "power", "light", "wifi", "internet"], category: "maintenance", department: "maintenance", enabled: true },
    { id: "rule_housekeeping", label: "Housekeeping", keywords: ["towels", "cleaning", "sheets", "linen", "laundry", "tidy", "amenities"], category: "housekeeping", department: "housekeeping", enabled: true },
    { id: "rule_transport", label: "Transport", keywords: ["transfer", "airport", "taxi", "driver", "car", "pick up"], category: "transport", department: "transport", enabled: true },
    { id: "rule_concierge", label: "Concierge & bookings", keywords: ["restaurant", "beach club", "booking", "reservation", "spa", "massage", "table", "chef", "dinner"], category: "concierge", department: "concierge", enabled: true },
    { id: "rule_security", label: "Security", keywords: ["security", "alarm", "gate", "intruder", "noise", "emergency"], category: "security", department: "security", enabled: true },
  ];
}

export function createDefaultSettings(): Settings {
  return {
    portfolioName: "Your Portfolio",
    location: "",
    language: "en",
    timezone: "Europe/Madrid",
    brandMark: "LUXA",
    autoAssign: true,
    visibleKpis: [...ALL_KPI_IDS],
    departments: defaultDepartments(),
    rules: defaultRules(),
  };
}
