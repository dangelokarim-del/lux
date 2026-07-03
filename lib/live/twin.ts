/**
 * Property Digital Twin — a living model of a villa: its rooms, connected
 * devices, service history and a set of AI scores (health, risk, maintenance,
 * luxury). Everything is derived deterministically from the store plus a stable
 * hash of the property, so the twin is consistent across renders and reflects the
 * real task history when it exists. This is the foundation an IoT feed slots into.
 */
import { statusMeta, type Database, type Guest, type Task } from "@/lib/domain";

function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 100000) / 100000;
}

export type DeviceStatus = "online" | "attention" | "offline";
export interface TwinDevice { id: string; name: string; category: string; status: DeviceStatus; detail: string }

export interface TwinScores { health: number; risk: number; maintenance: number; luxury: number }

export interface DigitalTwin {
  rooms: string[];
  devices: TwinDevice[];
  scores: TwinScores;
  maintenanceHistory: Task[];
  cleaningHistory: Task[];
  guestHistory: Guest[];
  favoriteServices: string[];
  wifi: { ssid: string; status: DeviceStatus; devices: number };
  pool: { temp: number; status: DeviceStatus };
  alarm: { armed: boolean; status: DeviceStatus };
}

const open = (t: Task) => statusMeta[t.status].open;

export function buildTwin(db: Database, propertyId: string): DigitalTwin | null {
  const prop = db.properties.find((p) => p.id === propertyId);
  if (!prop) return null;
  const tasks = db.tasks.filter((t) => t.propertyId === propertyId);
  const maintenance = tasks.filter((t) => t.department === "maintenance");
  const cleaning = tasks.filter((t) => t.department === "housekeeping");
  const openMaint = maintenance.filter(open);
  const hasIssue = (re: RegExp) => openMaint.some((t) => re.test(t.title));

  // devices synthesized from the property, health reflecting open maintenance
  const devices: TwinDevice[] = [];
  const acRooms = prop.rooms.filter((r) => /bedroom|living|cinema/i.test(r)).slice(0, 4);
  for (const r of acRooms) {
    const attn = hasIssue(/ac|air|cooling|heating/i) && /master bedroom|living/i.test(r);
    devices.push({ id: `ac_${r}`, name: `Climate · ${r}`, category: "Climate", status: attn ? "attention" : "online", detail: attn ? "Cooling below setpoint" : `${21 + Math.round(hash01(propertyId + r) * 2)}°C · nominal` });
  }
  const poolAttn = hasIssue(/pool|pump|filter/i);
  devices.push({ id: "pool", name: "Pool system", category: "Pool", status: poolAttn ? "attention" : "online", detail: poolAttn ? "Pump pressure low" : "Filtration nominal" });
  const wifiAttn = hasIssue(/wifi|internet|network/i);
  devices.push({ id: "wifi", name: "Network · mesh", category: "Network", status: wifiAttn ? "attention" : "online", detail: wifiAttn ? "Dropouts detected" : "930 Mbps · stable" });
  devices.push({ id: "alarm", name: "Security & alarm", category: "Security", status: "online", detail: prop.status === "occupied" ? "Disarmed · guest in residence" : "Armed" });
  devices.push({ id: "lighting", name: "Lighting & shades", category: "Lighting", status: hasIssue(/light|terrace/i) ? "attention" : "online", detail: hasIssue(/light|terrace/i) ? "Terrace circuit fault" : "Scenes synced" });
  devices.push({ id: "energy", name: "Energy", category: "Energy", status: "online", detail: `${(3 + hash01(propertyId + "e") * 4).toFixed(1)} kW draw` });

  // scores
  const urgentOpen = tasks.filter((t) => open(t) && t.priority === "urgent").length;
  const openCount = tasks.filter(open).length;
  const health = clampScore(96 - urgentOpen * 14 - openCount * 4 - (poolAttn ? 6 : 0));
  const risk = clampScore(12 + maintenance.length * 7 + urgentOpen * 20);
  const maintenanceScore = clampScore(98 - maintenance.length * 9 - openMaint.length * 6);
  const luxBase = 78 + (prop.bedrooms >= 6 ? 10 : prop.bedrooms >= 4 ? 5 : 0) + Math.round(hash01(propertyId + "lux") * 8);
  const guestVip = db.guests.some((g) => g.id === prop.currentGuestId && (g.vip || g.vipLevel));
  const luxury = clampScore(luxBase + (guestVip ? 6 : 0));

  // histories
  const guestHistory = db.guests.filter((g) => g.propertyId === propertyId || g.previousPropertyIds?.includes(propertyId));
  const curGuest = db.guests.find((g) => g.id === prop.currentGuestId) ?? null;
  const favoriteServices = curGuest?.preferences?.length ? curGuest.preferences : deriveFavorites(tasks);

  return {
    rooms: prop.rooms,
    devices,
    scores: { health, risk, maintenance: maintenanceScore, luxury },
    maintenanceHistory: sortByDate(maintenance),
    cleaningHistory: sortByDate(cleaning),
    guestHistory,
    favoriteServices,
    wifi: { ssid: `${prop.name.replace(/\s+/g, "")}-5G`, status: wifiAttn ? "attention" : "online", devices: 8 + Math.round(hash01(propertyId + "w") * 20) },
    pool: { temp: 26 + Math.round(hash01(propertyId + "p") * 3), status: poolAttn ? "attention" : "online" },
    alarm: { armed: prop.status !== "occupied", status: "online" },
  };
}

const clampScore = (v: number) => Math.max(2, Math.min(100, Math.round(v)));
const sortByDate = (ts: Task[]) => [...ts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

function deriveFavorites(tasks: Task[]): string[] {
  const cats = new Set<string>();
  for (const t of tasks) {
    if (/chef|dinner|restaurant/i.test(t.title)) cats.add("Private dining");
    if (/transfer|airport|driver/i.test(t.title)) cats.add("Chauffeur");
    if (/spa|massage/i.test(t.title)) cats.add("In-villa spa");
    if (/pool|towel/i.test(t.title)) cats.add("Poolside service");
  }
  return cats.size ? [...cats] : ["Concierge on call", "Daily housekeeping"];
}

export const SCORE_META = {
  health: { label: "AI Health", hint: "Overall operational condition", hex: "#4ad48a", higherBetter: true },
  risk: { label: "Risk", hint: "Likelihood of a guest-impacting issue", hex: "#ff5c5c", higherBetter: false },
  maintenance: { label: "Maintenance", hint: "Upkeep standing vs the portfolio", hex: "#2e7dff", higherBetter: true },
  luxury: { label: "Luxury", hint: "Experience & amenity index", hex: "#a78bfa", higherBetter: true },
} as const;
