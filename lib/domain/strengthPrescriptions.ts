import type { PrescriptionSet, StrengthWorkout } from "@/lib/catalogs/strengthCatalog";
import { getPhaseConfig } from "@/lib/trainingProgram";

export function isDeloadWeek(weekNumber: number): boolean {
  return weekNumber % 4 === 0;
}

function reducePrescription(prescription: string): string {
  const match = prescription.match(/^(\d+)x(\d+(?:-\d+)?)$/);
  if (!match) {
    return prescription;
  }

  const sets = Number(match[1]);
  const reps = match[2];

  if (sets >= 5) {
    return `3x${reps}`;
  }

  if (sets >= 3) {
    return `2x${reps}`;
  }

  return prescription;
}

export function applyDeloadToPrescriptions(
  prescriptions: PrescriptionSet
): PrescriptionSet {
  return {
    primary: reducePrescription(prescriptions.primary),
    secondary: reducePrescription(prescriptions.secondary),
    supersetA: prescriptions.supersetA.map(reducePrescription),
    supersetB: prescriptions.supersetB.map(reducePrescription),
    finisher: reducePrescription(prescriptions.finisher),
  };
}

export function getPrescriptionsForWeek(
  workout: StrengthWorkout,
  weekNumber: number
): PrescriptionSet {
  const phase = getPhaseConfig(weekNumber);
  const phaseKey = phase.name.toLowerCase() as "rebuild" | "build" | "specific";
  const base = workout.phaseModifications[phaseKey];

  if (isDeloadWeek(weekNumber)) {
    return applyDeloadToPrescriptions(base);
  }

  return base;
}
