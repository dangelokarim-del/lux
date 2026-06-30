/**
 * The contract every data backend implements. The UI + hooks depend only on this
 * — `LuxaStore` (in-memory demo) and `SupabaseLiveStore` (realtime Postgres) are
 * interchangeable behind it.
 */
import type { Database, Extraction, Guest, Property, Staff, TaskStatus } from "@/lib/domain";
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
  assignTask(taskId: string, staffId: string | null): void;
  addNote(taskId: string, body: string, author: { id?: string; name: string }): void;

  markNotificationRead(id: string): void;
  markAllNotificationsRead(): void;
}
