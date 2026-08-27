export type LogEntry = {
  date: string;
  bodyWeight: string;
  sleepHours: string;
  readiness: string;
  rpe: string;
  vaultPR: string;
  sprintDone: boolean;
  liftDone: boolean;
  vaultDone: boolean;
  notes: string;
};

export type WeightEntry = {
  weight: number;
  date: string;
};

export type HeightPREntry = {
  date: string;
  threeL: string;
  fourL: string;
  fiveL: string;
  sixL: string;
  sevenL: string;
};

export type SprintPREntry = {
  date: string;
  tenMeter: string;
  twentyMeter: string;
  thirtyMeter: string;
};

export type StrengthPREntry = {
  date: string;
  bench: string;
  squat: string;
  pullup: string;
};

export type MealPlanKey = "A" | "B" | "C";

export type SprintPRs = {
  tenMeterPR: string;
  tenMeterDate: string;
  twentyMeterPR: string;
  twentyMeterDate: string;
  thirtyMeterPR: string;
  thirtyMeterDate: string;
};

export type StrengthPRs = {
  benchPR: string;
  benchDate: string;
  squatPR: string;
  squatDate: string;
  pullupPR: string;
  pullupDate: string;
};

export type RunPRs = {
  threeL: string;
  threeLDate: string;
  fourL: string;
  fourLDate: string;
  fiveL: string;
  fiveLDate: string;
  sixL: string;
  sixLDate: string;
  sevenL: string;
  sevenLDate: string;
};

export type VaultStepReferences = {
  threeL: string;
  fourL: string;
  fiveL: string;
  sixL: string;
  sevenL: string;
};

export type PoleKind = "owned" | "wishlist";

export type Pole = {
  id: string;
  /** Defaults to owned when omitted. */
  kind?: PoleKind;
  brandId: string;
  modelId: string;
  /** Wishlist: optional multi-brand selection. */
  brandIds?: string[];
  /** Wishlist: optional multi-model selection. */
  modelIds?: string[];
  length: string;
  /** Wishlist: upper length bound (e.g. 14'0 for 13'6–14'0). */
  lengthMax?: string;
  weightRating: number;
  /** Wishlist: upper weight bound (e.g. 175 for 170–175). */
  weightMax?: number;
  flex?: string;
  notes?: string;
  /** Retired owned poles stay in inventory but are hidden from bags, logs, and progression. */
  retired?: boolean;
  /** Active owned poles flagged for replacement. */
  needsReplace?: boolean;
  /** @deprecated Removed in V3. Migrated away on load. */
  status?: "owned" | "wishlist" | "replace";
  createdAt: string;
};

export type PoleBag = {
  id: string;
  name: string;
  poleIds: string[];
};

export type Jump = {
  id: string;
  run: string;
  grip: string;
  takeoff: string;
  grade: "green" | "yellow" | "red";
  comment: string;
  poleId?: string;
  poleLabel?: string;
};

export type VaultSession = {
  id: string;
  date: string;
  keys: string[];
  jumps: Jump[];
};

export type WorkoutExecutionRecord = {
  completionKey: string;
  weekNumber: number;
  day: string;
  sessionId: string;
  sessionName: string;
  sessionType: "vault" | "strength" | "speed";
  completedAt: string;
  scheduledDate: string;
};
