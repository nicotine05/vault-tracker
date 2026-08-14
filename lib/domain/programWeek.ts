import { program } from "@/lib/data";
import type { MealPlanKey } from "@/lib/domain/types";

export function getPhaseNameForWeek(weekNumber: number): string {
  return (
    program.phases.find(
      (phase) =>
        weekNumber >= phase.startWeek && weekNumber <= phase.endWeek
    )?.name ?? "Unknown"
  );
}

export function getMealPlanKeyForWeek(weekNumber: number): MealPlanKey {
  const mod = weekNumber % 3;
  if (mod === 1) return "A";
  if (mod === 2) return "B";
  return "C";
}
