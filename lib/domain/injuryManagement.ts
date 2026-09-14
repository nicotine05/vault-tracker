import type { StrengthCategory } from "@/lib/catalogs/strengthCatalog";
import type { TrainingType } from "@/lib/trainingProgram";

export type ProgramStatus = "active" | "paused" | "modified";

export type InjuryRestrictions = {
  avoidLowerBody: boolean;
  avoidUpperBody: boolean;
  avoidSprinting: boolean;
  avoidVaulting: boolean;
};

export type InjuryProfile = {
  status: ProgramStatus;
  restrictions: InjuryRestrictions;
  updatedAt?: string;
};

export const EMPTY_INJURY_RESTRICTIONS: InjuryRestrictions = {
  avoidLowerBody: false,
  avoidUpperBody: false,
  avoidSprinting: false,
  avoidVaulting: false,
};

export const DEFAULT_INJURY_PROFILE: InjuryProfile = {
  status: "active",
  restrictions: { ...EMPTY_INJURY_RESTRICTIONS },
};

export const INJURY_RESTRICTION_OPTIONS: {
  key: keyof InjuryRestrictions;
  label: string;
}[] = [
  { key: "avoidLowerBody", label: "Avoid Lower Body" },
  { key: "avoidUpperBody", label: "Avoid Upper Body" },
  { key: "avoidSprinting", label: "Avoid Sprinting" },
  { key: "avoidVaulting", label: "Avoid Vaulting" },
];

export function getProgramStatusLabel(status: ProgramStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "paused":
      return "Paused";
    case "modified":
      return "Modified";
  }
}

export function getProgramStatusDescription(status: ProgramStatus): string {
  switch (status) {
    case "active":
      return "Program is operating normally.";
    case "paused":
      return "Program progression is paused.";
    case "modified":
      return "Future workout generation is filtered based on selected restrictions.";
  }
}

export function isProgramPaused(profile: InjuryProfile): boolean {
  return profile.status === "paused";
}

export function isProgramModified(profile: InjuryProfile): boolean {
  return profile.status === "modified";
}

export function shouldFreezeProgramProgression(profile: InjuryProfile): boolean {
  return profile.status === "paused";
}

export function getEffectiveRestrictions(
  profile: InjuryProfile
): InjuryRestrictions | null {
  if (profile.status !== "modified") {
    return null;
  }

  return profile.restrictions;
}

export function isTrainingTypeAllowed(
  type: TrainingType,
  restrictions: InjuryRestrictions | null
): boolean {
  if (!restrictions) {
    return true;
  }

  if (type === "vault" && restrictions.avoidVaulting) {
    return false;
  }

  if (type === "speed" && restrictions.avoidSprinting) {
    return false;
  }

  return true;
}

export function isStrengthCategoryAllowed(
  category: StrengthCategory,
  restrictions: InjuryRestrictions | null
): boolean {
  if (!restrictions) {
    return true;
  }

  if (
    restrictions.avoidLowerBody &&
    (category === "LS" || category === "PC" || category === "TBP")
  ) {
    return false;
  }

  if (restrictions.avoidUpperBody && category === "US") {
    return false;
  }

  return true;
}

export function filterStrengthCategoryPriority(
  priority: StrengthCategory[],
  restrictions: InjuryRestrictions | null
): StrengthCategory[] {
  const allowed = priority.filter((category) =>
    isStrengthCategoryAllowed(category, restrictions)
  );

  if (allowed.length > 0) {
    return allowed;
  }

  return ["AS"];
}

function hasAnyRestriction(restrictions: InjuryRestrictions): boolean {
  return (
    restrictions.avoidLowerBody ||
    restrictions.avoidUpperBody ||
    restrictions.avoidSprinting ||
    restrictions.avoidVaulting
  );
}

function normalizeRestrictions(value: unknown): InjuryRestrictions {
  if (!value || typeof value !== "object") {
    return { ...EMPTY_INJURY_RESTRICTIONS };
  }

  const record = value as Record<string, unknown>;

  return {
    avoidLowerBody: record.avoidLowerBody === true,
    avoidUpperBody: record.avoidUpperBody === true,
    avoidSprinting: record.avoidSprinting === true,
    avoidVaulting: record.avoidVaulting === true,
  };
}

function migrateLegacyManagingProfile(
  record: Record<string, unknown>
): InjuryProfile {
  const restrictions: InjuryRestrictions = { ...EMPTY_INJURY_RESTRICTIONS };
  const bodyArea =
    typeof record.bodyArea === "string" ? record.bodyArea : undefined;

  if (bodyArea) {
    const lowerBodyAreas = new Set([
      "foot-ankle",
      "calf",
      "hamstring",
      "quad",
      "hip-flexor",
      "glute",
      "groin",
      "knee",
      "low-back",
    ]);
    const upperBodyAreas = new Set(["shoulder", "elbow", "wrist-hand", "upper-back"]);

    if (lowerBodyAreas.has(bodyArea)) {
      restrictions.avoidLowerBody = true;
      restrictions.avoidSprinting = true;
      restrictions.avoidVaulting = true;
    }

    if (upperBodyAreas.has(bodyArea)) {
      restrictions.avoidUpperBody = true;
      restrictions.avoidVaulting = true;
    }
  }

  return {
    status: hasAnyRestriction(restrictions) ? "modified" : "active",
    restrictions,
    updatedAt:
      typeof record.startedAt === "string" ? record.startedAt : undefined,
  };
}

export function normalizeInjuryProfile(value: unknown): InjuryProfile {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_INJURY_PROFILE };
  }

  const record = value as Record<string, unknown>;

  if (record.status === "managing") {
    return migrateLegacyManagingProfile(record);
  }

  const status =
    record.status === "paused" || record.status === "modified"
      ? record.status
      : "active";
  const restrictions = normalizeRestrictions(record.restrictions);

  return {
    status,
    restrictions: status === "modified" ? restrictions : { ...EMPTY_INJURY_RESTRICTIONS },
    updatedAt:
      typeof record.updatedAt === "string" ? record.updatedAt : undefined,
  };
}
