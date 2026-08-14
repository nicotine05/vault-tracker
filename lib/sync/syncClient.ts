import { getItem, setItem } from "@/lib/storage/localStore";
import {
  COACH_VIEWING_ATHLETE_KEY,
  SYNC_STORAGE_KEYS,
  type SyncStorageKey,
} from "@/lib/sync/syncKeys";
import { STORAGE_EVENTS } from "@/lib/storage/keys";

type SyncResponse = {
  data: Record<string, unknown>;
  updatedAt: string | null;
  athleteId: string;
};

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let syncEnabled = false;
let lastPushedAt = 0;

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

function buildLocalSnapshot(): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {};

  for (const key of SYNC_STORAGE_KEYS) {
    if (key === "currentWeek" || key === "planningWeek") {
      snapshot[key] = localStorage.getItem(key) ?? "1";
      continue;
    }

    snapshot[key] = getItem(key, null);
  }

  return snapshot;
}

function applyRemoteSnapshot(data: Record<string, unknown>): void {
  for (const key of SYNC_STORAGE_KEYS) {
    const value = data[key];
    if (value === undefined || value === null) {
      continue;
    }

    if (key === "currentWeek" || key === "planningWeek") {
      localStorage.setItem(key, String(value));
      continue;
    }

    setItem(key, value, { skipSync: true });
  }

  window.dispatchEvent(new Event(STORAGE_EVENTS.PROGRAM_CHANGED));
  window.dispatchEvent(new Event(STORAGE_EVENTS.WEIGHT_CHANGED));
  window.dispatchEvent(new Event(STORAGE_EVENTS.VAULT_RUN_PRS_CHANGED));
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
  if (!syncEnabled) {
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
    await pullRemoteSync();
    return;
  }

  if (!response.ok) {
    throw new Error("Failed to push sync data");
  }

  const payload = (await response.json()) as { updatedAt: string };
  lastPushedAt = new Date(payload.updatedAt).getTime();
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
