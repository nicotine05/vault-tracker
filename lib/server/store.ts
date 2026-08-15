import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
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

const REDIS_STORE_KEY = "vault-tracker:store";

let redisClient: Redis | null = null;

function getRedisCredentials(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  return { url, token };
}

function getRedisClient(): Redis | null {
  const credentials = getRedisCredentials();
  if (!credentials) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis({
      url: credentials.url,
      token: credentials.token,
    });
  }

  return redisClient;
}

function getStorePath(): string {
  const configured = process.env.DATABASE_PATH;
  if (configured) {
    return path.resolve(configured);
  }

  if (process.env.VERCEL) {
    return "/tmp/vault-tracker-store.json";
  }

  return path.join(process.cwd(), "data", "vault-tracker-store.json");
}

function normalizeStore(parsed: Partial<VaultStore> | null): VaultStore {
  return {
    users: parsed?.users ?? [],
    coachAthletes: parsed?.coachAthletes ?? [],
    athleteSync: parsed?.athleteSync ?? {},
  };
}

async function readStoreFromRedis(): Promise<VaultStore> {
  const redis = getRedisClient();
  if (!redis) {
    throw new Error("Redis is not configured");
  }

  const parsed = await redis.get<VaultStore>(REDIS_STORE_KEY);
  return normalizeStore(parsed);
}

async function writeStoreToRedis(store: VaultStore): Promise<void> {
  const redis = getRedisClient();
  if (!redis) {
    throw new Error("Redis is not configured");
  }

  await redis.set(REDIS_STORE_KEY, store);
}

function readStoreFromFile(): VaultStore {
  const storePath = getStorePath();
  const directory = path.dirname(storePath);

  if (directory !== "/tmp") {
    fs.mkdirSync(directory, { recursive: true });
  }

  if (!fs.existsSync(storePath)) {
    writeStoreToFile(DEFAULT_STORE);
    return structuredClone(DEFAULT_STORE);
  }

  try {
    const raw = fs.readFileSync(storePath, "utf8");
    return normalizeStore(JSON.parse(raw) as Partial<VaultStore>);
  } catch {
    writeStoreToFile(DEFAULT_STORE);
    return structuredClone(DEFAULT_STORE);
  }
}

function writeStoreToFile(store: VaultStore): void {
  const storePath = getStorePath();
  const directory = path.dirname(storePath);

  if (directory !== "/tmp") {
    fs.mkdirSync(directory, { recursive: true });
  }

  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf8");
}

export async function readStoreSnapshot(): Promise<VaultStore> {
  if (getRedisClient()) {
    return readStoreFromRedis();
  }

  return readStoreFromFile();
}

async function writeStore(store: VaultStore): Promise<void> {
  if (getRedisClient()) {
    await writeStoreToRedis(store);
    return;
  }

  writeStoreToFile(store);
}

export async function withStore<T>(
  mutator: (store: VaultStore) => T | Promise<T>
): Promise<T> {
  const store = await readStoreSnapshot();
  const result = await mutator(store);
  await writeStore(store);
  return result;
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

export function usesRedisStore(): boolean {
  return Boolean(getRedisClient());
}

export type StoreBackend = "redis" | "file";

/** Where account + sync data is persisted on this deployment. */
export function getStoreBackend(): StoreBackend {
  return usesRedisStore() ? "redis" : "file";
}
