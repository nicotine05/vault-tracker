import type { PlannerDay } from "@/lib/trainingProgram";
import {
  getPhaseConfig,
  getPlannerWarnings,
  plannerDays,
  type TrainingType,
} from "@/lib/trainingProgram";

export type PlannerCounts = {
  vault: number;
  strength: number;
  speed: number;
};

export type PlannerHealthMetric = {
  label: string;
  current: number;
  required: number;
};

export function countPlannerSessions(
  weekPlanner: Record<string, PlannerDay>
): PlannerCounts {
  return {
    vault: plannerDays.filter((day) => weekPlanner[day]?.vault).length,
    strength: plannerDays.filter((day) => weekPlanner[day]?.strength).length,
    speed: plannerDays.filter((day) => weekPlanner[day]?.speed).length,
  };
}

export function isPlannerComplete(
  counts: PlannerCounts,
  planningWeek: number
): boolean {
  const targets = getPhaseConfig(planningWeek).targets;

  return (
    counts.vault >= targets.vault &&
    counts.strength >= targets.strength &&
    counts.speed >= targets.speed
  );
}

export function getPlannerHealthMetrics(
  counts: PlannerCounts,
  planningWeek: number
): PlannerHealthMetric[] {
  const targets = getPhaseConfig(planningWeek).targets;

  return [
    { label: "Vault", current: counts.vault, required: targets.vault },
    { label: "Strength", current: counts.strength, required: targets.strength },
    { label: "Speed", current: counts.speed, required: targets.speed },
  ];
}

export function getPlannerHealthWarnings(
  weekPlanner: Record<string, PlannerDay>,
  planningWeek: number,
  counts: PlannerCounts
): { healthWarnings: string[]; otherWarnings: string[] } {
  const targets = getPhaseConfig(planningWeek).targets;
  const warnings = getPlannerWarnings(weekPlanner, planningWeek);

  if (counts.vault < targets.vault) {
    warnings.unshift("Missing Required Vault Session");
  }
  if (counts.strength < targets.strength) {
    warnings.unshift("Missing Required Strength Session");
  }
  if (counts.speed < targets.speed) {
    warnings.unshift("Missing Required Speed Session");
  }

  return {
    healthWarnings: warnings.filter((warning) =>
      warning.startsWith("Missing Required ")
    ),
    otherWarnings: warnings.filter(
      (warning) => !warning.startsWith("Missing Required ")
    ),
  };
}

export function getActiveTrainingType(
  dayPlanner: PlannerDay | undefined
): TrainingType | undefined {
  return (["vault", "strength", "speed"] as const).find(
    (type) => dayPlanner?.[type]
  );
}
