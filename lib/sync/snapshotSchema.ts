import type {
  HeightPREntry,
  Jump,
  SprintPREntry,
  StrengthPREntry,
  VaultSession,
  WeightEntry,
  WorkoutExecutionRecord,
} from "@/lib/domain/types";
import type { WeekScheduleSnapshot } from "@/lib/storage/programStore";
import type { PlannerDay } from "@/lib/trainingProgram";
import {
  EMPTY_RUN_PRS,
  EMPTY_SPRINT_PRS,
  EMPTY_STRENGTH_PRS,
  EMPTY_STEP_REFS,
} from "@/lib/storage/logStore";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { getDefaultSyncSnapshot } from "@/lib/sync/snapshotDefaults";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function clampWeekValue(value: unknown): string {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return "1";
  }

  return String(Math.min(12, Math.max(1, Math.round(parsed))));
}

function mergeStringRecord<T extends Record<string, string>>(
  value: unknown,
  fallback: T
): T {
  if (!isRecord(value)) {
    return { ...fallback };
  }

  const next = { ...fallback };
  for (const key of Object.keys(fallback) as (keyof T)[]) {
    const candidate = value[key as string];
    if (isString(candidate)) {
      next[key] = candidate as T[keyof T];
    }
  }

  return next;
}

function normalizeJump(value: unknown): Jump | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    !isString(value.id) ||
    !isString(value.run) ||
    !isString(value.grip) ||
    !isString(value.takeoff) ||
    !isString(value.comment)
  ) {
    return null;
  }

  const grade = value.grade;
  if (grade !== "green" && grade !== "yellow" && grade !== "red") {
    return null;
  }

  return {
    id: value.id,
    run: value.run,
    grip: value.grip,
    takeoff: value.takeoff,
    grade,
    comment: value.comment,
  };
}

function normalizeVaultSession(value: unknown): VaultSession | null {
  if (!isRecord(value) || !isString(value.id) || !isString(value.date)) {
    return null;
  }

  const keys = isArray(value.keys)
    ? value.keys.filter(isString)
    : [];
  const jumps = isArray(value.jumps)
    ? value.jumps
        .map(normalizeJump)
        .filter((jump): jump is Jump => jump !== null)
    : [];

  return {
    id: value.id,
    date: value.date,
    keys,
    jumps,
  };
}

function normalizeWeightEntry(value: unknown): WeightEntry | null {
  if (!isRecord(value) || !isString(value.date)) {
    return null;
  }

  const weight = Number(value.weight);
  if (!Number.isFinite(weight)) {
    return null;
  }

  return { date: value.date, weight };
}

function normalizeHeightPREntry(value: unknown): HeightPREntry | null {
  if (!isRecord(value) || !isString(value.date)) {
    return null;
  }

  return {
    date: value.date,
    threeL: isString(value.threeL) ? value.threeL : "",
    fourL: isString(value.fourL) ? value.fourL : "",
    fiveL: isString(value.fiveL) ? value.fiveL : "",
    sixL: isString(value.sixL) ? value.sixL : "",
    sevenL: isString(value.sevenL) ? value.sevenL : "",
  };
}

function normalizeSprintPREntry(value: unknown): SprintPREntry | null {
  if (!isRecord(value) || !isString(value.date)) {
    return null;
  }

  return {
    date: value.date,
    tenMeter: isString(value.tenMeter) ? value.tenMeter : "",
    twentyMeter: isString(value.twentyMeter) ? value.twentyMeter : "",
    thirtyMeter: isString(value.thirtyMeter) ? value.thirtyMeter : "",
  };
}

function normalizeStrengthPREntry(value: unknown): StrengthPREntry | null {
  if (!isRecord(value) || !isString(value.date)) {
    return null;
  }

  return {
    date: value.date,
    bench: isString(value.bench) ? value.bench : "",
    squat: isString(value.squat) ? value.squat : "",
    pullup: isString(value.pullup) ? value.pullup : "",
  };
}

function normalizePlannerDay(value: unknown): PlannerDay | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    vault: Boolean(value.vault),
    strength: Boolean(value.strength),
    speed: Boolean(value.speed),
  };
}

function normalizeWeekPlanner(
  value: unknown
): Record<number, Record<string, PlannerDay>> {
  if (!isRecord(value)) {
    return {};
  }

  const next: Record<number, Record<string, PlannerDay>> = {};

  for (const [weekKey, weekValue] of Object.entries(value)) {
    const weekNumber = Number(weekKey);
    if (!Number.isFinite(weekNumber) || !isRecord(weekValue)) {
      continue;
    }

    const dayPlanner: Record<string, PlannerDay> = {};
    for (const [day, dayValue] of Object.entries(weekValue)) {
      const plannerDay = normalizePlannerDay(dayValue);
      if (plannerDay) {
        dayPlanner[day] = plannerDay;
      }
    }

    next[weekNumber] = dayPlanner;
  }

  return next;
}

function normalizeScheduleSnapshots(
  value: unknown
): Record<number, WeekScheduleSnapshot> {
  if (!isRecord(value)) {
    return {};
  }

  const next: Record<number, WeekScheduleSnapshot> = {};

  for (const [weekKey, snapshotValue] of Object.entries(value)) {
    const weekNumber = Number(weekKey);
    if (!Number.isFinite(weekNumber) || !isRecord(snapshotValue)) {
      continue;
    }

    if (
      !isString(snapshotValue.generatedAt) ||
      !isString(snapshotValue.engineVersion) ||
      !isRecord(snapshotValue.schedule)
    ) {
      continue;
    }

    next[weekNumber] = snapshotValue as WeekScheduleSnapshot;
  }

  return next;
}

function normalizeBooleanRecord(value: unknown): Record<string, boolean> {
  if (!isRecord(value)) {
    return {};
  }

  const next: Record<string, boolean> = {};
  for (const [key, candidate] of Object.entries(value)) {
    next[key] = Boolean(candidate);
  }

  return next;
}

function normalizeExecutionHistory(
  value: unknown
): Record<string, WorkoutExecutionRecord> {
  if (!isRecord(value)) {
    return {};
  }

  const next: Record<string, WorkoutExecutionRecord> = {};

  for (const [key, recordValue] of Object.entries(value)) {
    if (!isRecord(recordValue)) {
      continue;
    }

    if (
      !isString(recordValue.completionKey) ||
      !isString(recordValue.day) ||
      !isString(recordValue.sessionId) ||
      !isString(recordValue.sessionName) ||
      !isString(recordValue.completedAt)
    ) {
      continue;
    }

    const sessionType = recordValue.sessionType;
    if (
      sessionType !== "vault" &&
      sessionType !== "strength" &&
      sessionType !== "speed"
    ) {
      continue;
    }

    next[key] = {
      completionKey: recordValue.completionKey,
      weekNumber: Number(recordValue.weekNumber) || 1,
      day: recordValue.day,
      sessionId: recordValue.sessionId,
      sessionName: recordValue.sessionName,
      sessionType,
      completedAt: recordValue.completedAt,
      scheduledDate: isString(recordValue.scheduledDate)
        ? recordValue.scheduledDate
        : "",
    };
  }

  return next;
}

/** Coerce unknown sync payload fields into safe, typed defaults. */
export function normalizeSyncSnapshot(
  data: Record<string, unknown>
): Record<string, unknown> {
  const defaults = getDefaultSyncSnapshot();

  return {
    [STORAGE_KEYS.CURRENT_WEEK]: clampWeekValue(
      data[STORAGE_KEYS.CURRENT_WEEK] ?? defaults[STORAGE_KEYS.CURRENT_WEEK]
    ),
    [STORAGE_KEYS.PLANNING_WEEK]: clampWeekValue(
      data[STORAGE_KEYS.PLANNING_WEEK] ?? defaults[STORAGE_KEYS.PLANNING_WEEK]
    ),
    [STORAGE_KEYS.WEEKLY_PLANNER]: normalizeWeekPlanner(
      data[STORAGE_KEYS.WEEKLY_PLANNER]
    ),
    [STORAGE_KEYS.SCHEDULE_SNAPSHOTS]: normalizeScheduleSnapshots(
      data[STORAGE_KEYS.SCHEDULE_SNAPSHOTS]
    ),
    [STORAGE_KEYS.COMPLETED_WORKOUTS]: normalizeBooleanRecord(
      data[STORAGE_KEYS.COMPLETED_WORKOUTS]
    ),
    [STORAGE_KEYS.EXECUTION_HISTORY]: normalizeExecutionHistory(
      data[STORAGE_KEYS.EXECUTION_HISTORY]
    ),
    [STORAGE_KEYS.WEIGHT_HISTORY]: isArray(data[STORAGE_KEYS.WEIGHT_HISTORY])
      ? (data[STORAGE_KEYS.WEIGHT_HISTORY] as unknown[])
          .map(normalizeWeightEntry)
          .filter((entry): entry is WeightEntry => entry !== null)
      : [],
    [STORAGE_KEYS.VAULT_RUN_PRS]: mergeStringRecord(
      data[STORAGE_KEYS.VAULT_RUN_PRS],
      EMPTY_RUN_PRS
    ),
    [STORAGE_KEYS.VAULT_PR_HISTORY]: isArray(data[STORAGE_KEYS.VAULT_PR_HISTORY])
      ? (data[STORAGE_KEYS.VAULT_PR_HISTORY] as unknown[])
          .map(normalizeHeightPREntry)
          .filter((entry): entry is HeightPREntry => entry !== null)
      : [],
    [STORAGE_KEYS.SPRINT_PRS]: mergeStringRecord(
      data[STORAGE_KEYS.SPRINT_PRS],
      EMPTY_SPRINT_PRS
    ),
    [STORAGE_KEYS.SPRINT_PR_HISTORY]: isArray(
      data[STORAGE_KEYS.SPRINT_PR_HISTORY]
    )
      ? (data[STORAGE_KEYS.SPRINT_PR_HISTORY] as unknown[])
          .map(normalizeSprintPREntry)
          .filter((entry): entry is SprintPREntry => entry !== null)
      : [],
    [STORAGE_KEYS.STRENGTH_PRS]: mergeStringRecord(
      data[STORAGE_KEYS.STRENGTH_PRS],
      EMPTY_STRENGTH_PRS
    ),
    [STORAGE_KEYS.STRENGTH_PR_HISTORY]: isArray(
      data[STORAGE_KEYS.STRENGTH_PR_HISTORY]
    )
      ? (data[STORAGE_KEYS.STRENGTH_PR_HISTORY] as unknown[])
          .map(normalizeStrengthPREntry)
          .filter((entry): entry is StrengthPREntry => entry !== null)
      : [],
    [STORAGE_KEYS.VAULT_LOGS]: isArray(data[STORAGE_KEYS.VAULT_LOGS])
      ? (data[STORAGE_KEYS.VAULT_LOGS] as unknown[])
          .map(normalizeVaultSession)
          .filter((session): session is VaultSession => session !== null)
      : [],
    [STORAGE_KEYS.VAULT_STEP_REFERENCES]: mergeStringRecord(
      data[STORAGE_KEYS.VAULT_STEP_REFERENCES],
      EMPTY_STEP_REFS
    ),
    [STORAGE_KEYS.MIGRATION_V1]: Boolean(
      data[STORAGE_KEYS.MIGRATION_V1] ?? defaults[STORAGE_KEYS.MIGRATION_V1]
    ),
  };
}
