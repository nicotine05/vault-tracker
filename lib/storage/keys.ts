export const STORAGE_KEYS = {
  CURRENT_WEEK: "currentWeek",
  CURRENT_WEEK_START: "currentWeekStartDate",
  PLANNING_WEEK: "planningWeek",
  WEEKLY_PLANNER: "weeklyPlannerByWeek",
  SCHEDULE_SNAPSHOTS: "scheduleSnapshotsByWeek",
  COMPLETED_WORKOUTS: "completedWorkouts",
  GENERATED_SCHEDULES: "generatedSchedules",
  WEIGHT_HISTORY: "weightHistory",
  VAULT_RUN_PRS: "vaultRunPRs",
  VAULT_PR_HISTORY: "vaultPRHistory",
  SPRINT_PRS: "sprintPRs",
  SPRINT_PR_HISTORY: "sprintPRHistory",
  STRENGTH_PRS: "strengthPRs",
  STRENGTH_PR_HISTORY: "strengthPRHistory",
  VAULT_LOGS: "vaultLogs",
  VAULT_STEP_REFERENCES: "vaultStepReferences",
  EXECUTION_HISTORY: "workoutExecutionHistory",
  MIGRATION_V1: "vaultTracker_migration_v1",
} as const;

export const STORAGE_EVENTS = {
  PROGRAM_CHANGED: "vaultTracker:programChanged",
  WEIGHT_CHANGED: "weightChanged",
  VAULT_RUN_PRS_CHANGED: "vaultRunPRsChanged",
  SPRINT_PRS_CHANGED: "sprintPRsChanged",
  STRENGTH_PRS_CHANGED: "strengthPRsChanged",
} as const;
