import {
  ENGINE_VERSION,
  generateScheduleForWeek,
  type GeneratedWeekSchedule,
  type PlannerDay,
} from "@/lib/trainingProgram";
import type { WorkoutExecutionRecord } from "@/lib/domain/types";
import { getItem, getString, setItem } from "@/lib/storage/localStore";
import { STORAGE_EVENTS, STORAGE_KEYS } from "@/lib/storage/keys";

export type WeekScheduleSnapshot = {
  weekNumber: number;
  generatedAt: string;
  engineVersion: typeof ENGINE_VERSION;
  planner: Record<string, PlannerDay>;
  schedule: GeneratedWeekSchedule;
};

export type ProgramState = {
  currentWeek: number;
  selectedWeek: number;
  plannerByWeek: Record<number, Record<string, PlannerDay>>;
  scheduleSnapshotsByWeek: Record<number, WeekScheduleSnapshot>;
  completedWorkouts: Record<string, boolean>;
  executionHistory: Record<string, WorkoutExecutionRecord>;
};

const DEFAULT_STATE: ProgramState = {
  currentWeek: 1,
  selectedWeek: 1,
  plannerByWeek: {},
  scheduleSnapshotsByWeek: {},
  completedWorkouts: {},
  executionHistory: {},
};

function clampWeek(week: number): number {
  return Math.min(12, Math.max(1, week));
}

function createSnapshot(
  weekNumber: number,
  planner: Record<string, PlannerDay>
): WeekScheduleSnapshot {
  return {
    weekNumber,
    generatedAt: new Date().toISOString(),
    engineVersion: ENGINE_VERSION,
    planner,
    schedule: generateScheduleForWeek(planner, weekNumber),
  };
}

function migrateLegacyProgramData(): void {
  if (getItem<boolean>(STORAGE_KEYS.MIGRATION_V1, false)) return;

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
    if (!isGenerated) continue;

    const weekNumber = Number(weekKey);
    if (snapshots[weekNumber]) continue;

    snapshots[weekNumber] = createSnapshot(
      weekNumber,
      legacyPlanner[weekNumber] ?? {}
    );
  }

  setItem(STORAGE_KEYS.SCHEDULE_SNAPSHOTS, snapshots);
  setItem(STORAGE_KEYS.MIGRATION_V1, true);
}

export function loadProgramState(): ProgramState {
  migrateLegacyProgramData();

  const currentWeek = clampWeek(
    Number(getString(STORAGE_KEYS.CURRENT_WEEK, "1"))
  );

  const selectedWeek = clampWeek(
    Number(
      getString(
        STORAGE_KEYS.SELECTED_WEEK,
        String(currentWeek)
      )
    )
  );

  return {
    currentWeek,
    selectedWeek,
    plannerByWeek: getItem(STORAGE_KEYS.WEEKLY_PLANNER, {}),
    scheduleSnapshotsByWeek: getItem(STORAGE_KEYS.SCHEDULE_SNAPSHOTS, {}),
    completedWorkouts: getItem(STORAGE_KEYS.COMPLETED_WORKOUTS, {}),
    executionHistory: getItem(STORAGE_KEYS.EXECUTION_HISTORY, {}),
  };
}

export function saveProgramState(state: ProgramState): void {
  setItem(STORAGE_KEYS.CURRENT_WEEK, String(state.currentWeek));
  setItem(STORAGE_KEYS.SELECTED_WEEK, String(state.selectedWeek));
  setItem(STORAGE_KEYS.WEEKLY_PLANNER, state.plannerByWeek);
  setItem(STORAGE_KEYS.SCHEDULE_SNAPSHOTS, state.scheduleSnapshotsByWeek);
  setItem(STORAGE_KEYS.COMPLETED_WORKOUTS, state.completedWorkouts);
  setItem(STORAGE_KEYS.EXECUTION_HISTORY, state.executionHistory);

  window.dispatchEvent(new Event(STORAGE_EVENTS.PROGRAM_CHANGED));
}

export function generateScheduleSnapshot(
  weekNumber: number,
  planner: Record<string, PlannerDay>
): WeekScheduleSnapshot {
  return createSnapshot(weekNumber, planner);
}

export function getScheduleForWeek(
  state: ProgramState,
  weekNumber: number
): WeekScheduleSnapshot | null {
  return state.scheduleSnapshotsByWeek[weekNumber] ?? null;
}

export function isWeekScheduleGenerated(
  state: ProgramState,
  weekNumber: number
): boolean {
  return Boolean(state.scheduleSnapshotsByWeek[weekNumber]);
}

export function getDefaultProgramState(): ProgramState {
  return { ...DEFAULT_STATE };
}

export function subscribeProgramState(
  listener: () => void
): () => void {
  const handler = () => listener();

  window.addEventListener(STORAGE_EVENTS.PROGRAM_CHANGED, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(STORAGE_EVENTS.PROGRAM_CHANGED, handler);
    window.removeEventListener("storage", handler);
  };
}
