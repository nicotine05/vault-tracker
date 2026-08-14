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

export type Jump = {
  id: string;
  run: string;
  grip: string;
  takeoff: string;
  grade: "green" | "yellow" | "red";
  comment: string;
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
};
