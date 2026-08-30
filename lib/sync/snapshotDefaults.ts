import { getDefaultCurrentWeekStartDate } from "@/lib/domain/calendarUtils";
import {
  EMPTY_RUN_PRS,
  EMPTY_SPRINT_PRS,
  EMPTY_STRENGTH_PRS,
  EMPTY_STEP_REFS,
} from "@/lib/storage/logStore";
import { STORAGE_KEYS } from "@/lib/storage/keys";

/** Canonical empty snapshot for a new athlete account. */
export function getDefaultSyncSnapshot(): Record<string, unknown> {
  return {
    [STORAGE_KEYS.CURRENT_WEEK]: "1",
    [STORAGE_KEYS.CURRENT_WEEK_START]: getDefaultCurrentWeekStartDate(),
    [STORAGE_KEYS.PLANNING_WEEK]: "1",
    [STORAGE_KEYS.WEEKLY_PLANNER]: {},
    [STORAGE_KEYS.SCHEDULE_SNAPSHOTS]: {},
    [STORAGE_KEYS.COMPLETED_WORKOUTS]: {},
    [STORAGE_KEYS.EXECUTION_HISTORY]: {},
    [STORAGE_KEYS.WEIGHT_HISTORY]: [],
    [STORAGE_KEYS.VAULT_RUN_PRS]: { ...EMPTY_RUN_PRS },
    [STORAGE_KEYS.VAULT_PR_HISTORY]: [],
    [STORAGE_KEYS.SPRINT_PRS]: { ...EMPTY_SPRINT_PRS },
    [STORAGE_KEYS.SPRINT_PR_HISTORY]: [],
    [STORAGE_KEYS.STRENGTH_PRS]: { ...EMPTY_STRENGTH_PRS },
    [STORAGE_KEYS.STRENGTH_PR_HISTORY]: [],
    [STORAGE_KEYS.VAULT_LOGS]: [],
    [STORAGE_KEYS.VAULT_SESSION_DRAFT]: null,
    [STORAGE_KEYS.VAULT_STEP_REFERENCES]: { ...EMPTY_STEP_REFS },
    [STORAGE_KEYS.POLE_INVENTORY]: [],
    [STORAGE_KEYS.POLE_BAGS]: [],
    [STORAGE_KEYS.RECENT_POLE_IDS]: [],
    [STORAGE_KEYS.MIGRATION_V1]: true,
  };
}
