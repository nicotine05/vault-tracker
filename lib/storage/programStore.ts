import {
  ENGINE_VERSION,
  generateScheduleForWeek,
  type GeneratedWeekSchedule,
  type PlannerDay,
} from "@/lib/trainingProgram";
import type { WorkoutExecutionRecord } from "@/lib/domain/types";
import { getCalendarDateForProgramDay, getDefaultCurrentWeekStartDate } from "@/lib/domain/calendarUtils";
import { getItem, getString, setItem } from "@/lib/storage/localStore";
import { STORAGE_EVENTS, STORAGE_KEYS } from "@/lib/storage/keys";
import { runStorageMigrations } from "@/lib/storage/migrations";

export type WeekScheduleSnapshot = {
  weekNumber: number;
  generatedAt: string;
  engineVersion: typeof ENGINE_VERSION;
  planner: Record<string, PlannerDay>;
  schedule: GeneratedWeekSchedule;
};

export const MAX_PLAN_AHEAD_WEEKS = 3;

export type ProgramState = {
  currentWeek: number;
  currentWeekStartDate: string;
  planningWeek: number;
  plannerByWeek: Record<number, Record<string, PlannerDay>>;
  scheduleSnapshotsByWeek: Record<number, WeekScheduleSnapshot>;
  completedWorkouts: Record<string, boolean>;
  executionHistory: Record<string, WorkoutExecutionRecord>;
};

const DEFAULT_STATE: ProgramState = {
  currentWeek: 1,
  currentWeekStartDate: getDefaultCurrentWeekStartDate(),
  planningWeek: 1,
  plannerByWeek: {},
  scheduleSnapshotsByWeek: {},
  completedWorkouts: {},
  executionHistory: {},
};

function clampWeek(week: number): number {
  return Math.min(12, Math.max(1, week));
}

export function clampPlanningWeek(
  planningWeek: number,
  currentWeek: number
): number {
  return clampWeek(
    Math.min(planningWeek, currentWeek + MAX_PLAN_AHEAD_WEEKS)
  );
}

export function maxViewableWeek(currentWeek: number): number {
  return Math.min(12, currentWeek + MAX_PLAN_AHEAD_WEEKS);
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

function backfillScheduledDates(
  history: Record<string, WorkoutExecutionRecord>,
  currentWeek: number,
  currentWeekStartDate: string
): Record<string, WorkoutExecutionRecord> {
  let changed = false;
  const next = { ...history };

  for (const [key, record] of Object.entries(next)) {
    if (record.scheduledDate) continue;

    next[key] = {
      ...record,
      scheduledDate: getCalendarDateForProgramDay(
        record.weekNumber,
        record.day,
        currentWeek,
        currentWeekStartDate
      ),
    };
    changed = true;
  }

  return changed ? next : history;
}

export function loadProgramState(): ProgramState {
  runStorageMigrations();

  const currentWeek = clampWeek(
    Number(getString(STORAGE_KEYS.CURRENT_WEEK, "1"))
  );
  const storedWeekStart = getString(STORAGE_KEYS.CURRENT_WEEK_START, "");
  const currentWeekStartDate =
    storedWeekStart || getDefaultCurrentWeekStartDate();

  const rawHistory = getItem<Record<string, WorkoutExecutionRecord>>(
    STORAGE_KEYS.EXECUTION_HISTORY,
    {}
  );
  const executionHistory = backfillScheduledDates(
    rawHistory,
    currentWeek,
    currentWeekStartDate
  );

  if (executionHistory !== rawHistory) {
    setItem(STORAGE_KEYS.EXECUTION_HISTORY, executionHistory);
  }

  if (!storedWeekStart) {
    setItem(STORAGE_KEYS.CURRENT_WEEK_START, currentWeekStartDate);
  }

  const legacyPlanning = getString(STORAGE_KEYS.PLANNING_WEEK, "");
  const legacySelected = getString("selectedWeek", "");
  const rawPlanning = legacyPlanning || legacySelected || String(currentWeek);
  const planningWeek = clampPlanningWeek(Number(rawPlanning), currentWeek);

  return {
    currentWeek,
    currentWeekStartDate,
    planningWeek,
    plannerByWeek: getItem(STORAGE_KEYS.WEEKLY_PLANNER, {}),
    scheduleSnapshotsByWeek: getItem(STORAGE_KEYS.SCHEDULE_SNAPSHOTS, {}),
    completedWorkouts: getItem(STORAGE_KEYS.COMPLETED_WORKOUTS, {}),
    executionHistory,
  };
}

export function saveProgramState(state: ProgramState): void {
  setItem(STORAGE_KEYS.CURRENT_WEEK, String(state.currentWeek));
  setItem(STORAGE_KEYS.CURRENT_WEEK_START, state.currentWeekStartDate);
  setItem(STORAGE_KEYS.PLANNING_WEEK, String(state.planningWeek));
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
