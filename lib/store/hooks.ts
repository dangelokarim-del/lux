"use client";

/**
 * React bindings for the store. Components use these hooks and never touch the
 * store internals. `useDatabase` is the realtime subscription (useSyncExternalStore);
 * everything else derives from it with stable memoisation.
 */
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { store } from "./instance";
import {
  priorityMeta,
  statusMeta,
  type Database,
  type Note,
  type Task,
} from "@/lib/domain";

export function useDatabase(): Database {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

/** false until the initial dataset has loaded — drives loading skeletons */
export function useReady(): boolean {
  return useSyncExternalStore(store.subscribe, store.ready, store.ready);
}

/** the store's action surface — stable identity, safe to use in deps */
export function useLuxa() {
  return store;
}

export function useTasks(): Task[] {
  const db = useDatabase();
  return db.tasks;
}

export function useTask(taskId: string | null): Task | null {
  const db = useDatabase();
  return useMemo(() => db.tasks.find((t) => t.id === taskId) ?? null, [db.tasks, taskId]);
}

export function useNotesForTask(taskId: string | null): Note[] {
  const db = useDatabase();
  return useMemo(
    () =>
      db.notes
        .filter((n) => n.taskId === taskId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [db.notes, taskId]
  );
}

export function useStaff() {
  return useDatabase().staff;
}

export function useProperties() {
  return useDatabase().properties;
}

export function useGuests() {
  return useDatabase().guests;
}

export function useConversation(conversationId: string | null) {
  const db = useDatabase();
  return useMemo(() => {
    const conversation = db.conversations.find((c) => c.id === conversationId) ?? null;
    const messages = db.messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return { conversation, messages };
  }, [db.conversations, db.messages, conversationId]);
}

export function useNotifications() {
  const db = useDatabase();
  const markRead = useCallback((id: string) => store.markNotificationRead(id), []);
  const markAllRead = useCallback(() => store.markAllNotificationsRead(), []);
  return {
    items: db.notifications,
    unread: db.notifications.filter((n) => !n.read).length,
    markRead,
    markAllRead,
  };
}

/** live operations KPIs, derived from tasks */
export function useOperationsStats() {
  const db = useDatabase();
  return useMemo(() => {
    const open = db.tasks.filter((t) => statusMeta[t.status].open);
    const urgent = open.filter((t) => priorityMeta[t.priority].weight >= 3);
    const inProgress = db.tasks.filter((t) => t.status === "in_progress");
    const completedToday = db.tasks.filter(
      (t) => t.status === "completed" && t.completedAt && isToday(t.completedAt)
    );
    return {
      open: open.length,
      urgent: urgent.length,
      inProgress: inProgress.length,
      completedToday: completedToday.length,
    };
  }, [db.tasks]);
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}
