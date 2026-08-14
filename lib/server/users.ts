import { randomUUID } from "crypto";
import { hashPassword } from "@/lib/server/auth";
import {
  createUserRecord,
  normalizeEmail,
  readStoreSnapshot,
  withStore,
} from "@/lib/server/store";
import type {
  AthleteSummary,
  PublicUser,
  SyncBlob,
  UserRecord,
  UserRole,
} from "@/lib/server/types";

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function findUserByEmail(
  email: string
): Promise<UserRecord | null> {
  const normalized = normalizeEmail(email);
  const store = await readStoreSnapshot();
  return store.users.find((user) => user.email === normalized) ?? null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const store = await readStoreSnapshot();
  return store.users.find((user) => user.id === id) ?? null;
}

export async function createUser(params: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}): Promise<UserRecord> {
  return withStore((store) => {
    const user = createUserRecord({
      id: randomUUID(),
      email: params.email,
      passwordHash: hashPassword(params.password),
      name: params.name,
      role: params.role,
      createdAt: new Date().toISOString(),
    });

    store.users.push(user);
    return user;
  });
}

export async function linkCoachAthlete(
  coachId: string,
  athleteId: string
): Promise<void> {
  await withStore((store) => {
    const exists = store.coachAthletes.some(
      (link) => link.coachId === coachId && link.athleteId === athleteId
    );

    if (!exists) {
      store.coachAthletes.push({
        coachId,
        athleteId,
        createdAt: new Date().toISOString(),
      });
    }
  });
}

export async function coachOwnsAthlete(
  coachId: string,
  athleteId: string
): Promise<boolean> {
  const store = await readStoreSnapshot();
  return store.coachAthletes.some(
    (link) => link.coachId === coachId && link.athleteId === athleteId
  );
}

export async function listCoachAthletes(
  coachId: string
): Promise<AthleteSummary[]> {
  const store = await readStoreSnapshot();

  return store.coachAthletes
    .filter((link) => link.coachId === coachId)
    .map((link) => store.users.find((user) => user.id === link.athleteId))
    .filter((user): user is UserRecord => Boolean(user))
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadAthleteSync(athleteId: string): Promise<{
  data: SyncBlob;
  updatedAt: string | null;
}> {
  const store = await readStoreSnapshot();
  const record = store.athleteSync[athleteId];

  if (!record) {
    return { data: {}, updatedAt: null };
  }

  return {
    data: record.data,
    updatedAt: record.updatedAt,
  };
}

export async function saveAthleteSync(
  athleteId: string,
  data: SyncBlob
): Promise<string> {
  const updatedAt = new Date().toISOString();

  await withStore((store) => {
    store.athleteSync[athleteId] = {
      data,
      updatedAt,
    };
  });

  return updatedAt;
}

export async function resolveSyncAthleteId(params: {
  sessionUserId: string;
  sessionRole: UserRole;
  requestedAthleteId?: string | null;
}): Promise<{ athleteId: string } | { error: string; status: number }> {
  if (params.sessionRole === "athlete") {
    if (
      params.requestedAthleteId &&
      params.requestedAthleteId !== params.sessionUserId
    ) {
      return { error: "Athletes can only sync their own data", status: 403 };
    }

    return { athleteId: params.sessionUserId };
  }

  if (!params.requestedAthleteId) {
    return { error: "Coach must select an athlete to sync", status: 400 };
  }

  if (
    !(await coachOwnsAthlete(params.sessionUserId, params.requestedAthleteId))
  ) {
    return { error: "Athlete not linked to this coach", status: 403 };
  }

  return { athleteId: params.requestedAthleteId };
}
