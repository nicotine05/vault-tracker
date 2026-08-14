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

export function findUserByEmail(email: string): UserRecord | null {
  const normalized = normalizeEmail(email);
  const store = readStoreSnapshot();
  return store.users.find((user) => user.email === normalized) ?? null;
}

export function findUserById(id: string): UserRecord | null {
  const store = readStoreSnapshot();
  return store.users.find((user) => user.id === id) ?? null;
}

export function createUser(params: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}): UserRecord {
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

export function linkCoachAthlete(coachId: string, athleteId: string): void {
  withStore((store) => {
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

export function coachOwnsAthlete(coachId: string, athleteId: string): boolean {
  const store = readStoreSnapshot();
  return store.coachAthletes.some(
    (link) => link.coachId === coachId && link.athleteId === athleteId
  );
}

export function listCoachAthletes(coachId: string): AthleteSummary[] {
  const store = readStoreSnapshot();

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

export function loadAthleteSync(athleteId: string): {
  data: SyncBlob;
  updatedAt: string | null;
} {
  const store = readStoreSnapshot();
  const record = store.athleteSync[athleteId];

  if (!record) {
    return { data: {}, updatedAt: null };
  }

  return {
    data: record.data,
    updatedAt: record.updatedAt,
  };
}

export function saveAthleteSync(athleteId: string, data: SyncBlob): string {
  const updatedAt = new Date().toISOString();

  withStore((store) => {
    store.athleteSync[athleteId] = {
      data,
      updatedAt,
    };
  });

  return updatedAt;
}

export function resolveSyncAthleteId(params: {
  sessionUserId: string;
  sessionRole: UserRole;
  requestedAthleteId?: string | null;
}): { athleteId: string } | { error: string; status: number } {
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

  if (!coachOwnsAthlete(params.sessionUserId, params.requestedAthleteId)) {
    return { error: "Athlete not linked to this coach", status: 403 };
  }

  return { athleteId: params.requestedAthleteId };
}
