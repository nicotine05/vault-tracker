export const STORAGE_KEYS = {
  CURRENT_WEEK: "currentWeek",
  PLANNING_WEEK: "planningWeek",
  WEEKLY_PLANNER: "weeklyPlannerByWeek",
  SCHEDULE_SNAPSHOTS: "scheduleSnapshotsByWeek",
  COMPLETED_WORKOUTS: "completedWorkouts",
  GENERATED_SCHEDULES: "generatedSchedules",
  WEIGHT_HISTORY: "weightHistory",
  VAULT_RUN_PRS: "vaultRunPRs",
  VAULT_PR_HISTORY: "vaultPRHistory",
  SPRINT_PRS: "sprintPRs",
  STRENGTH_PRS: "strengthPRs",
  VAULT_LOGS: "vaultLogs",
  VAULT_STEP_REFERENCES: "vaultStepReferences",
  EXECUTION_HISTORY: "workoutExecutionHistory",
  MIGRATION_V1: "vaultTracker_migration_v1",
} as const;

export const STORAGE_EVENTS = {
  PROGRAM_CHANGED: "vaultTracker:programChanged",
  WEIGHT_CHANGED: "weightChanged",
  VAULT_RUN_PRS_CHANGED: "vaultRunPRsChanged",
} as const;
