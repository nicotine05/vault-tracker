import { countPlannerSessions, isPlannerComplete } from "@/lib/domain/plannerHealth";
import { migrateLegacyPoleRecord } from "@/lib/domain/poleInventory";
import type { Pole } from "@/lib/domain/types";
import type { PlannerDay } from "@/lib/trainingProgram";
import {
  bootstrapSprintPREntry,
  bootstrapStrengthPREntry,
} from "@/lib/domain/prLog";
import {
  EMPTY_SPRINT_PRS,
  EMPTY_STRENGTH_PRS,
} from "@/lib/storage/logStore";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import {
  generateScheduleSnapshot,
  type WeekScheduleSnapshot,
} from "@/lib/storage/programStore";

type Migration = {
  id: string;
  run: () => void;
};

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (raw === null) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Legacy generatedSchedules → scheduleSnapshotsByWeek */
function migrateLegacyGeneratedSchedules(): void {
  if (readJson<boolean>(STORAGE_KEYS.MIGRATION_V1, false)) {
    return;
  }

  const snapshots = readJson<Record<number, WeekScheduleSnapshot>>(
    STORAGE_KEYS.SCHEDULE_SNAPSHOTS,
    {}
  );

  const legacyGenerated = readJson<Record<number, boolean>>(
    STORAGE_KEYS.GENERATED_SCHEDULES,
    {}
  );

  const legacyPlanner = readJson<Record<number, Record<string, PlannerDay>>>(
    STORAGE_KEYS.WEEKLY_PLANNER,
    {}
  );

  for (const [weekKey, isGenerated] of Object.entries(legacyGenerated)) {
    if (!isGenerated) {
      continue;
    }

    const weekNumber = Number(weekKey);
    if (snapshots[weekNumber]) {
      continue;
    }

    snapshots[weekNumber] = generateScheduleSnapshot(
      weekNumber,
      legacyPlanner[weekNumber] ?? {}
    );
  }

  writeJson(STORAGE_KEYS.SCHEDULE_SNAPSHOTS, snapshots);
  writeJson(STORAGE_KEYS.MIGRATION_V1, true);
}

function migrateSprintStrengthPRHistory(): void {
  const sprintHistory = readJson<unknown[]>(STORAGE_KEYS.SPRINT_PR_HISTORY, []);
  if (sprintHistory.length === 0) {
    const sprintPRs = readJson(STORAGE_KEYS.SPRINT_PRS, EMPTY_SPRINT_PRS);
    const entry = bootstrapSprintPREntry(sprintPRs);
    if (entry) {
      writeJson(STORAGE_KEYS.SPRINT_PR_HISTORY, [entry]);
    }
  }

  const strengthHistory = readJson<unknown[]>(
    STORAGE_KEYS.STRENGTH_PR_HISTORY,
    []
  );
  if (strengthHistory.length === 0) {
    const strengthPRs = readJson(STORAGE_KEYS.STRENGTH_PRS, EMPTY_STRENGTH_PRS);
    const entry = bootstrapStrengthPREntry(strengthPRs);
    if (entry) {
      writeJson(STORAGE_KEYS.STRENGTH_PR_HISTORY, [entry]);
    }
  }
}

/** Restore schedule snapshots lost when sync stripped numeric engineVersion. */
function restoreMissingScheduleSnapshots(): void {
  if (readJson<boolean>(STORAGE_KEYS.MIGRATION_V2, false)) {
    return;
  }

  const snapshots = readJson<Record<number, WeekScheduleSnapshot>>(
    STORAGE_KEYS.SCHEDULE_SNAPSHOTS,
    {}
  );

  const planner = readJson<Record<number, Record<string, PlannerDay>>>(
    STORAGE_KEYS.WEEKLY_PLANNER,
    {}
  );

  const legacyGenerated = readJson<Record<number, boolean>>(
    STORAGE_KEYS.GENERATED_SCHEDULES,
    {}
  );

  const completedWorkouts = readJson<Record<string, boolean>>(
    STORAGE_KEYS.COMPLETED_WORKOUTS,
    {}
  );

  let changed = false;

  for (const [weekKey, weekPlanner] of Object.entries(planner)) {
    const weekNumber = Number(weekKey);
    if (!Number.isFinite(weekNumber) || snapshots[weekNumber]) {
      continue;
    }

    if (!weekPlanner || Object.keys(weekPlanner).length === 0) {
      continue;
    }

    const hadCompletedWorkouts = Object.keys(completedWorkouts).some((key) =>
      key.startsWith(`${weekNumber}-`)
    );

    const hadGeneratedSchedule =
      legacyGenerated[weekNumber] ||
      hadCompletedWorkouts ||
      isPlannerComplete(countPlannerSessions(weekPlanner), weekNumber);

    if (!hadGeneratedSchedule) {
      continue;
    }

    snapshots[weekNumber] = generateScheduleSnapshot(weekNumber, weekPlanner);
    changed = true;
  }

  if (changed) {
    writeJson(STORAGE_KEYS.SCHEDULE_SNAPSHOTS, snapshots);
  }

  writeJson(STORAGE_KEYS.MIGRATION_V2, true);
}

/** Migrate freeform brand/model poles to standardized catalog IDs. */
function migratePoleCatalogIds(): void {
  if (readJson<boolean>(STORAGE_KEYS.MIGRATION_V3, false)) {
    return;
  }

  const rawPoles = readJson<unknown[]>(STORAGE_KEYS.POLE_INVENTORY, []);
  const migrated: Pole[] = [];

  for (const rawPole of rawPoles) {
    if (typeof rawPole !== "object" || rawPole === null) {
      continue;
    }

    const pole = migrateLegacyPoleRecord(rawPole as Record<string, unknown>);
    if (pole) {
      migrated.push(pole);
    }
  }

  writeJson(STORAGE_KEYS.POLE_INVENTORY, migrated);
  writeJson(STORAGE_KEYS.MIGRATION_V3, true);
}

const MIGRATIONS: Migration[] = [
  { id: "legacy-generated-schedules", run: migrateLegacyGeneratedSchedules },
  { id: "sprint-strength-pr-history", run: migrateSprintStrengthPRHistory },
  { id: "restore-missing-schedule-snapshots", run: restoreMissingScheduleSnapshots },
  { id: "pole-catalog-ids", run: migratePoleCatalogIds },
];

let migrationsRan = false;

export function runStorageMigrations(): void {
  if (typeof window === "undefined" || migrationsRan) {
    return;
  }

  migrationsRan = true;

  for (const migration of MIGRATIONS) {
    migration.run();
  }
}
