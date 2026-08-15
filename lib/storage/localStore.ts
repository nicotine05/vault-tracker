import { isCoachReadOnly } from "@/lib/sync/readOnly";
import { SYNC_STORAGE_KEYS } from "@/lib/sync/syncKeys";

export function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getString(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;

  const raw = localStorage.getItem(key);
  return raw ?? fallback;
}

function shouldSyncKey(key: string): boolean {
  return (SYNC_STORAGE_KEYS as readonly string[]).includes(key);
}

function notifySync(key: string): void {
  if (!shouldSyncKey(key)) {
    return;
  }

  void import("@/lib/sync/syncClient").then((module) => {
    module.scheduleSyncPush();
  });
}

export function setItem<T>(
  key: string,
  value: T,
  options?: { skipSync?: boolean }
): void {
  if (typeof window === "undefined") return;

  if (isCoachReadOnly() && shouldSyncKey(key) && !options?.skipSync) {
    return;
  }

  if (typeof value === "string") {
    localStorage.setItem(key, value);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }

  if (!options?.skipSync) {
    notifySync(key);
  }
}

export function removeItem(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}
