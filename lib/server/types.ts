export type UserRole = "coach" | "athlete";

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  createdAt: string;
};

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type SessionPayload = {
  userId: string;
  role: UserRole;
  exp: number;
};

export type AthleteSummary = {
  id: string;
  name: string;
  email: string;
};

export type SyncBlob = Record<string, unknown>;
