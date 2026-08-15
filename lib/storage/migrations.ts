import { STORAGE_KEYS } from "@/lib/storage/keys";
import type { PlannerDay } from "@/lib/trainingProgram";
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

const MIGRATIONS: Migration[] = [
  { id: "legacy-generated-schedules", run: migrateLegacyGeneratedSchedules },
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
