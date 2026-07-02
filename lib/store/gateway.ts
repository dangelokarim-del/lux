/**
 * The contract every data backend implements. The UI + hooks depend only on this
 * — `LuxaStore` (in-memory demo) and `SupabaseLiveStore` (realtime Postgres) are
 * interchangeable behind it.
 */
import type { Database, Extraction, Guest, Organization, Priority, Property, Settings, Staff, TaskStatus, WhatsAppAccount, Workspace } from "@/lib/domain";
import type { InboundMessage } from "@/lib/services/whatsapp/inbound";

export interface IngestOutcome {
  taskId: string;
  code: string;
  extraction: Extraction;
  conversationId: string;
}

export interface OpsGateway {
  /** realtime subscription surface (React via useSyncExternalStore) */
  subscribe(cb: () => void): () => void;
  getSnapshot(): Database;
  /** false until the initial dataset has loaded (drives loading skeletons) */
  ready(): boolean;

  /** resolved lookups used across the UI */
  propertyById(id: string | null): Property | null;
  guestById(id: string | null): Guest | null;
  staffById(id: string | null): Staff | null;

  /** the WhatsApp → AI → task pipeline */
  ingestWhatsApp(inbound: InboundMessage): Promise<IngestOutcome>;

  /** staff actions — persisted + broadcast to every client */
  setTaskStatus(taskId: string, status: TaskStatus): void;
  setTaskPriority(taskId: string, priority: Priority): void;
  assignTask(taskId: string, staffId: string | null): void;
  addNote(taskId: string, body: string, author: { id?: string; name: string }): void;

  markNotificationRead(id: string): void;
  markAllNotificationsRead(): void;

  /* ---- configuration: the admin/settings layer (add/edit/delete) ---- */
  /** create or update a property (id decides which) */
  upsertProperty(property: Property): void;
  deleteProperty(id: string): void;
  /** create or update a team member */
  upsertStaff(staff: Staff): void;
  deleteStaff(id: string): void;
  /** patch portfolio settings (departments, rules, KPIs, branding, …) */
  updateSettings(patch: Partial<Settings>): void;

  /* ---- workspace / multi-tenant: organizations + WhatsApp numbers ---- */
  /** cross-org state for the switcher + admin (stable snapshot) */
  getWorkspaceSnapshot(): Workspace;
  /** switch the active organization — the whole app reflects the new tenant */
  switchOrg(id: string): void;
  createOrg(input: { name: string; plan?: string }): void;
  updateOrg(org: Organization): void;
  addWhatsAppAccount(input: { phoneNumberId: string; displayNumber: string; label: string; organizationId: string; active?: boolean }): void;
  updateWhatsAppAccount(account: WhatsAppAccount): void;
  deleteWhatsAppAccount(id: string): void;
}
