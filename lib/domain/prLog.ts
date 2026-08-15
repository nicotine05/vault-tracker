import type { SprintPRs, StrengthPRs } from "@/lib/domain/types";

export type PRCompareMode = "lower" | "higher";

export type PRFieldDefinition = {
  inputKey: string;
  prKey: keyof SprintPRs | keyof StrengthPRs;
  dateKey: keyof SprintPRs | keyof StrengthPRs;
  label: string;
  placeholder: string;
  compare: PRCompareMode;
};

export const SPRINT_PR_FIELDS: PRFieldDefinition[] = [
  {
    inputKey: "tenMeter",
    prKey: "tenMeterPR",
    dateKey: "tenMeterDate",
    label: "10m PR",
    placeholder: "1.72",
    compare: "lower",
  },
  {
    inputKey: "twentyMeter",
    prKey: "twentyMeterPR",
    dateKey: "twentyMeterDate",
    label: "20m PR",
    placeholder: "3.04",
    compare: "lower",
  },
  {
    inputKey: "thirtyMeter",
    prKey: "thirtyMeterPR",
    dateKey: "thirtyMeterDate",
    label: "30m PR",
    placeholder: "4.21",
    compare: "lower",
  },
];

export const STRENGTH_PR_FIELDS: PRFieldDefinition[] = [
  {
    inputKey: "bench",
    prKey: "benchPR",
    dateKey: "benchDate",
    label: "Bench PR",
    placeholder: "245",
    compare: "higher",
  },
  {
    inputKey: "squat",
    prKey: "squatPR",
    dateKey: "squatDate",
    label: "Squat PR",
    placeholder: "365",
    compare: "higher",
  },
  {
    inputKey: "pullup",
    prKey: "pullupPR",
    dateKey: "pullupDate",
    label: "Pullup PR",
    placeholder: "18",
    compare: "higher",
  },
];

export const SPRINT_PR_DISPLAY = [
  { prKey: "tenMeterPR" as const, dateKey: "tenMeterDate" as const, label: "10 Meter PR", color: "text-emerald-700 [data-theme=dark]:text-emerald-300", unit: "seconds" },
  { prKey: "twentyMeterPR" as const, dateKey: "twentyMeterDate" as const, label: "20 Meter PR", color: "text-accent-text", unit: "seconds" },
  { prKey: "thirtyMeterPR" as const, dateKey: "thirtyMeterDate" as const, label: "30 Meter PR", color: "text-indigo-700 [data-theme=dark]:text-indigo-300", unit: "seconds" },
];

export const STRENGTH_PR_DISPLAY = [
  { prKey: "benchPR" as const, dateKey: "benchDate" as const, label: "Bench Press PR", color: "text-red-600 [data-theme=dark]:text-red-400" },
  { prKey: "squatPR" as const, dateKey: "squatDate" as const, label: "Squat PR", color: "text-accent-text" },
  { prKey: "pullupPR" as const, dateKey: "pullupDate" as const, label: "Pullup PR", color: "text-emerald-700 [data-theme=dark]:text-emerald-300" },
];

function isBetter(
  compare: PRCompareMode,
  currentValue: string,
  nextValue: string
): boolean {
  if (!nextValue) {
    return false;
  }

  if (!currentValue) {
    return true;
  }

  return compare === "lower"
    ? Number(nextValue) < Number(currentValue)
    : Number(nextValue) > Number(currentValue);
}

export function applyPRUpdates(
  current: Record<string, string>,
  inputs: Record<string, string>,
  fields: PRFieldDefinition[]
): Record<string, string> {
  const today = new Date().toLocaleDateString();
  const updated = { ...current };

  for (const field of fields) {
    const input = inputs[field.inputKey];
    const prKey = String(field.prKey);
    const dateKey = String(field.dateKey);

    if (isBetter(field.compare, updated[prKey], input)) {
      updated[prKey] = input;
      updated[dateKey] = today;
    }
  }

  return updated;
}

export function emptyInputs(fields: PRFieldDefinition[]): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field.inputKey, ""]));
}
