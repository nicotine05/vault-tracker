import {
  getEffectiveRestrictions,
  isProgramModified,
  isTrainingTypeAllowed,
  type InjuryProfile,
} from "@/lib/domain/injuryManagement";
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

export function getAdjustedPlannerTargets(
  planningWeek: number,
  profile?: InjuryProfile
) {
  const targets = getPhaseConfig(planningWeek).targets;
  const restrictions = profile ? getEffectiveRestrictions(profile) : null;

  if (!restrictions) {
    return targets;
  }

  return {
    vault: restrictions.avoidVaulting ? 0 : targets.vault,
    strength: targets.strength,
    speed: restrictions.avoidSprinting ? 0 : targets.speed,
  };
}

export function isPlannerComplete(
  counts: PlannerCounts,
  planningWeek: number,
  profile?: InjuryProfile
): boolean {
  if (profile && isProgramModified(profile)) {
    return true;
  }

  const targets = getAdjustedPlannerTargets(planningWeek, profile);

  return (
    counts.vault >= targets.vault &&
    counts.strength >= targets.strength &&
    counts.speed >= targets.speed
  );
}

export function getPlannerHealthMetrics(
  counts: PlannerCounts,
  planningWeek: number,
  profile?: InjuryProfile
): PlannerHealthMetric[] {
  const targets = getAdjustedPlannerTargets(planningWeek, profile);

  return [
    { label: "Vault", current: counts.vault, required: targets.vault },
    { label: "Strength", current: counts.strength, required: targets.strength },
    { label: "Speed", current: counts.speed, required: targets.speed },
  ].filter((metric) => metric.required > 0);
}

export function getPlannerHealthWarnings(
  weekPlanner: Record<string, PlannerDay>,
  planningWeek: number,
  counts: PlannerCounts,
  profile?: InjuryProfile
): { healthWarnings: string[]; otherWarnings: string[] } {
  const targets = getAdjustedPlannerTargets(planningWeek, profile);
  const warnings = getPlannerWarnings(weekPlanner, planningWeek, profile);

  if (profile && isProgramModified(profile)) {
    return {
      healthWarnings: [],
      otherWarnings: warnings,
    };
  }

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

export function getActiveTrainingTypes(
  dayPlanner: PlannerDay | undefined
): TrainingType[] {
  return (["vault", "strength", "speed"] as const).filter(
    (type) => dayPlanner?.[type]
  );
}

export function getActiveTrainingType(
  dayPlanner: PlannerDay | undefined
): TrainingType | undefined {
  return getActiveTrainingTypes(dayPlanner)[0];
}

export function isPlannerTrainingTypeAllowed(
  type: TrainingType,
  profile?: InjuryProfile
): boolean {
  if (!profile || !isProgramModified(profile)) {
    return true;
  }

  return isTrainingTypeAllowed(type, getEffectiveRestrictions(profile));
}
