import fs from "fs";
import path from "path";
import type { SyncBlob, UserRecord, UserRole } from "@/lib/server/types";

export type CoachAthleteLink = {
  coachId: string;
  athleteId: string;
  createdAt: string;
};

export type AthleteSyncRecord = {
  data: SyncBlob;
  updatedAt: string;
};

export type VaultStore = {
  users: UserRecord[];
  coachAthletes: CoachAthleteLink[];
  athleteSync: Record<string, AthleteSyncRecord>;
};

const DEFAULT_STORE: VaultStore = {
  users: [],
  coachAthletes: [],
  athleteSync: {},
};

function getStorePath(): string {
  const configured = process.env.DATABASE_PATH;
  if (configured) {
    return path.resolve(configured);
  }

  return path.join(process.cwd(), "data", "vault-tracker-store.json");
}

function readStore(): VaultStore {
  const storePath = getStorePath();
  fs.mkdirSync(path.dirname(storePath), { recursive: true });

  if (!fs.existsSync(storePath)) {
    writeStore(DEFAULT_STORE);
    return structuredClone(DEFAULT_STORE);
  }

  try {
    const raw = fs.readFileSync(storePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<VaultStore>;

    return {
      users: parsed.users ?? [],
      coachAthletes: parsed.coachAthletes ?? [],
      athleteSync: parsed.athleteSync ?? {},
    };
  } catch {
    writeStore(DEFAULT_STORE);
    return structuredClone(DEFAULT_STORE);
  }
}

function writeStore(store: VaultStore): void {
  const storePath = getStorePath();
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf8");
}

export function withStore<T>(mutator: (store: VaultStore) => T): T {
  const store = readStore();
  const result = mutator(store);
  writeStore(store);
  return result;
}

export function readStoreSnapshot(): VaultStore {
  return readStore();
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function createUserRecord(params: {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  createdAt: string;
}): UserRecord {
  return {
    id: params.id,
    email: normalizeEmail(params.email),
    passwordHash: params.passwordHash,
    name: params.name.trim(),
    role: params.role,
    createdAt: params.createdAt,
  };
}
