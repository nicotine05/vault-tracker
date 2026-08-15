import { getItem, setItem } from "@/lib/storage/localStore";
import { isCoachReadOnly } from "@/lib/sync/readOnly";
import { runStorageMigrations } from "@/lib/storage/migrations";
import { getDefaultSyncSnapshot } from "@/lib/sync/snapshotDefaults";
import { normalizeSyncSnapshot } from "@/lib/sync/snapshotSchema";
import { STORAGE_EVENTS, STORAGE_KEYS } from "@/lib/storage/keys";
import {
  COACH_VIEWING_ATHLETE_KEY,
  SYNC_CONTEXT_KEY,
  SYNC_STORAGE_KEYS,
  type SyncStorageKey,
} from "@/lib/sync/syncKeys";

type SyncResponse = {
  data: Record<string, unknown>;
  updatedAt: string | null;
  athleteId: string;
};

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let syncEnabled = false;
let lastPushedAt = 0;

export type SyncConflictInfo = {
  remoteUpdatedAt: string;
};

let syncConflict: SyncConflictInfo | null = null;
const conflictListeners = new Set<() => void>();

function setSyncConflict(conflict: SyncConflictInfo | null): void {
  syncConflict = conflict;
  for (const listener of conflictListeners) {
    listener();
  }
}

export function getSyncConflict(): SyncConflictInfo | null {
  return syncConflict;
}

export function subscribeSyncConflict(listener: () => void): () => void {
  conflictListeners.add(listener);
  return () => {
    conflictListeners.delete(listener);
  };
}

export async function resolveSyncConflict(
  resolution: "keep-local" | "use-remote"
): Promise<void> {
  if (!syncConflict) {
    return;
  }

  setSyncConflict(null);

  if (resolution === "keep-local") {
    await pushRemoteSync(true);
    return;
  }

  await pullRemoteSync();
}

export function setSyncEnabled(enabled: boolean): void {
  syncEnabled = enabled;
}

export function getCoachViewingAthleteId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(COACH_VIEWING_ATHLETE_KEY);
}

export function setCoachViewingAthleteId(athleteId: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (athleteId) {
    localStorage.setItem(COACH_VIEWING_ATHLETE_KEY, athleteId);
  } else {
    localStorage.removeItem(COACH_VIEWING_ATHLETE_KEY);
  }
}

function notifyStorageRefresh(): void {
  window.dispatchEvent(new Event(STORAGE_EVENTS.PROGRAM_CHANGED));
  window.dispatchEvent(new Event(STORAGE_EVENTS.WEIGHT_CHANGED));
  window.dispatchEvent(new Event(STORAGE_EVENTS.VAULT_RUN_PRS_CHANGED));
}

/** Reset all synced local data to defaults before loading an account's snapshot. */
export function clearLocalSyncData(options?: { silent?: boolean }): void {
  if (typeof window === "undefined") {
    return;
  }

  const defaults = getDefaultSyncSnapshot();

  localStorage.setItem(
    STORAGE_KEYS.CURRENT_WEEK,
    String(defaults[STORAGE_KEYS.CURRENT_WEEK])
  );
  localStorage.setItem(
    STORAGE_KEYS.PLANNING_WEEK,
    String(defaults[STORAGE_KEYS.PLANNING_WEEK])
  );

  for (const [key, value] of Object.entries(defaults)) {
    if (
      key === STORAGE_KEYS.CURRENT_WEEK ||
      key === STORAGE_KEYS.PLANNING_WEEK
    ) {
      continue;
    }

    setItem(key, value, { skipSync: true });
  }

  lastPushedAt = 0;

  if (!options?.silent) {
    notifyStorageRefresh();
  }
}

export function getSyncContextAthleteId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(SYNC_CONTEXT_KEY);
}

export function setSyncContextAthleteId(athleteId: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (athleteId) {
    localStorage.setItem(SYNC_CONTEXT_KEY, athleteId);
  } else {
    localStorage.removeItem(SYNC_CONTEXT_KEY);
  }
}

function buildLocalSnapshot(): Record<string, unknown> {
  runStorageMigrations();

  const snapshot: Record<string, unknown> = {};

  for (const key of SYNC_STORAGE_KEYS) {
    if (key === "currentWeek" || key === "planningWeek") {
      snapshot[key] = localStorage.getItem(key) ?? "1";
      continue;
    }

    snapshot[key] = getItem(key, null);
  }

  return normalizeSyncSnapshot(snapshot);
}

function applyRemoteSnapshot(data: Record<string, unknown>): void {
  clearLocalSyncData({ silent: true });
  const normalized = normalizeSyncSnapshot(data);

  for (const key of SYNC_STORAGE_KEYS) {
    const value = normalized[key];
    if (value === undefined || value === null) {
      continue;
    }

    if (key === "currentWeek" || key === "planningWeek") {
      localStorage.setItem(key, String(value));
      continue;
    }

    setItem(key, value, { skipSync: true });
  }

  runStorageMigrations();
  setSyncConflict(null);
  notifyStorageRefresh();
}

function getSyncUrl(): string {
  const athleteId = getCoachViewingAthleteId();
  if (!athleteId) {
    return "/api/sync";
  }

  return `/api/sync?athleteId=${encodeURIComponent(athleteId)}`;
}

export async function pullRemoteSync(): Promise<SyncResponse | null> {
  const response = await fetch(getSyncUrl(), {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 401) {
    setSyncEnabled(false);
    return null;
  }

  if (response.status === 400) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to pull sync data");
  }

  const payload = (await response.json()) as SyncResponse;
  applyRemoteSnapshot(payload.data);
  lastPushedAt = payload.updatedAt
    ? new Date(payload.updatedAt).getTime()
    : Date.now();

  return payload;
}

export async function pushRemoteSync(force = false): Promise<void> {
  if (!syncEnabled || isCoachReadOnly()) {
    return;
  }

  const snapshot = buildLocalSnapshot();

  const response = await fetch(getSyncUrl(), {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: snapshot,
      clientUpdatedAt: lastPushedAt || null,
      force,
    }),
  });

  if (response.status === 401) {
    setSyncEnabled(false);
    return;
  }

  if (response.status === 409) {
    const payload = (await response.json()) as { updatedAt?: string };
    setSyncConflict({
      remoteUpdatedAt: payload.updatedAt ?? new Date().toISOString(),
    });
    return;
  }

  if (!response.ok) {
    throw new Error("Failed to push sync data");
  }

  const payload = (await response.json()) as { updatedAt: string };
  lastPushedAt = new Date(payload.updatedAt).getTime();
  setSyncConflict(null);
}

export function scheduleSyncPush(): void {
  if (!syncEnabled || typeof window === "undefined") {
    return;
  }

  if (syncTimer) {
    clearTimeout(syncTimer);
  }

  syncTimer = setTimeout(() => {
    void pushRemoteSync().catch(() => {
      // Sync failures should not break local usage.
    });
  }, 1500);
}

export function isSyncableKey(key: string): key is SyncStorageKey {
  return (SYNC_STORAGE_KEYS as readonly string[]).includes(key);
}
