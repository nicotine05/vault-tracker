import { getItem, setItem } from "@/lib/storage/localStore";
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

/** Legacy generatedSchedules → scheduleSnapshotsByWeek */
function migrateLegacyGeneratedSchedules(): void {
  if (getItem<boolean>(STORAGE_KEYS.MIGRATION_V1, false)) {
    return;
  }

  const snapshots = getItem<Record<number, WeekScheduleSnapshot>>(
    STORAGE_KEYS.SCHEDULE_SNAPSHOTS,
    {}
  );

  const legacyGenerated = getItem<Record<number, boolean>>(
    STORAGE_KEYS.GENERATED_SCHEDULES,
    {}
  );

  const legacyPlanner = getItem<Record<number, Record<string, PlannerDay>>>(
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

  setItem(STORAGE_KEYS.SCHEDULE_SNAPSHOTS, snapshots, { skipSync: true });
  setItem(STORAGE_KEYS.MIGRATION_V1, true, { skipSync: true });
}

const MIGRATIONS: Migration[] = [
  { id: "legacy-generated-schedules", run: migrateLegacyGeneratedSchedules },
];

export function runStorageMigrations(): void {
  if (typeof window === "undefined") {
    return;
  }

  for (const migration of MIGRATIONS) {
    migration.run();
  }
}
