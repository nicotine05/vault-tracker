import type { StrengthCategory } from "@/lib/catalogs/strengthCatalog";
import type { SprintWorkout } from "@/lib/catalogs/sprintCatalog";
import type { SessionOption, TrainingType } from "@/lib/trainingProgram";

export type InjuryBodyArea =
  | "foot-ankle"
  | "calf"
  | "hamstring"
  | "quad"
  | "hip-flexor"
  | "glute"
  | "groin"
  | "knee"
  | "low-back"
  | "upper-back"
  | "shoulder"
  | "elbow"
  | "wrist-hand";

export type InjuryStatus = "normal" | "managing";

export type InjuryProfile = {
  status: InjuryStatus;
  bodyArea?: InjuryBodyArea;
  startedAt?: string;
  notes?: string;
};

export type TrainingRestriction =
  | "vault"
  | "sprint"
  | "max-velocity"
  | "acceleration"
  | "lower-strength"
  | "posterior-chain"
  | "heavy-hinging"
  | "total-body-power"
  | "upper-strength";

export const INJURY_BODY_AREAS: { id: InjuryBodyArea; label: string }[] = [
  { id: "foot-ankle", label: "Foot / Ankle" },
  { id: "calf", label: "Calf" },
  { id: "hamstring", label: "Hamstring" },
  { id: "quad", label: "Quad" },
  { id: "hip-flexor", label: "Hip Flexor" },
  { id: "glute", label: "Glute" },
  { id: "groin", label: "Groin" },
  { id: "knee", label: "Knee" },
  { id: "low-back", label: "Low Back" },
  { id: "upper-back", label: "Upper Back" },
  { id: "shoulder", label: "Shoulder" },
  { id: "elbow", label: "Elbow" },
  { id: "wrist-hand", label: "Wrist / Hand" },
];

const RESTRICTIONS_BY_AREA: Record<InjuryBodyArea, TrainingRestriction[]> = {
  "foot-ankle": [
    "vault",
    "sprint",
    "max-velocity",
    "acceleration",
    "lower-strength",
    "total-body-power",
  ],
  calf: [
    "vault",
    "sprint",
    "max-velocity",
    "acceleration",
    "lower-strength",
    "posterior-chain",
  ],
  hamstring: [
    "vault",
    "sprint",
    "max-velocity",
    "acceleration",
    "posterior-chain",
    "heavy-hinging",
    "lower-strength",
  ],
  quad: [
    "vault",
    "sprint",
    "acceleration",
    "lower-strength",
    "total-body-power",
  ],
  "hip-flexor": ["vault", "sprint", "acceleration", "lower-strength"],
  glute: ["vault", "sprint", "posterior-chain", "heavy-hinging"],
  groin: ["vault", "sprint", "lower-strength", "acceleration"],
  knee: [
    "vault",
    "sprint",
    "lower-strength",
    "total-body-power",
    "acceleration",
  ],
  "low-back": ["vault", "posterior-chain", "heavy-hinging", "max-velocity"],
  "upper-back": ["vault", "max-velocity"],
  shoulder: ["vault", "upper-strength", "total-body-power"],
  elbow: ["vault", "upper-strength"],
  "wrist-hand": ["vault"],
};

const RESTRICTION_LABELS: Record<TrainingRestriction, string> = {
  vault: "Vault sessions",
  sprint: "Sprint workouts",
  "max-velocity": "Max velocity work",
  acceleration: "Acceleration work",
  "lower-strength": "Lower body strength",
  "posterior-chain": "Posterior chain work",
  "heavy-hinging": "Heavy hinging",
  "total-body-power": "Total body power",
  "upper-strength": "Upper body strength",
};

export const DEFAULT_INJURY_PROFILE: InjuryProfile = {
  status: "normal",
};

export function getBodyAreaLabel(area: InjuryBodyArea): string {
  return INJURY_BODY_AREAS.find((entry) => entry.id === area)?.label ?? area;
}

export function getRestrictionsForBodyArea(
  area: InjuryBodyArea
): TrainingRestriction[] {
  return RESTRICTIONS_BY_AREA[area] ?? [];
}

export function getRestrictionLabels(restrictions: TrainingRestriction[]): string[] {
  return restrictions.map((restriction) => RESTRICTION_LABELS[restriction]);
}

export function isInjuryModeActive(profile: InjuryProfile): boolean {
  return profile.status === "managing" && Boolean(profile.bodyArea);
}

export function hasRestriction(
  restrictions: TrainingRestriction[],
  restriction: TrainingRestriction
): boolean {
  return restrictions.includes(restriction);
}

const STRENGTH_CATEGORY_RESTRICTIONS: Record<
  StrengthCategory,
  TrainingRestriction[]
> = {
  LS: ["lower-strength"],
  US: ["upper-strength"],
  PC: ["posterior-chain", "heavy-hinging"],
  AS: [],
  TBP: ["total-body-power"],
};

export function isStrengthCategoryAllowed(
  category: StrengthCategory,
  restrictions: TrainingRestriction[]
): boolean {
  const categoryRestrictions = STRENGTH_CATEGORY_RESTRICTIONS[category];
  return !categoryRestrictions.some((restriction) =>
    restrictions.includes(restriction)
  );
}

export function filterStrengthCategoryPriority(
  priority: StrengthCategory[],
  restrictions: TrainingRestriction[]
): StrengthCategory[] {
  const allowed = priority.filter((category) =>
    isStrengthCategoryAllowed(category, restrictions)
  );

  if (allowed.length > 0) {
    return allowed;
  }

  return ["AS"];
}

export function isSprintWorkoutAllowed(
  workout: SprintWorkout,
  restrictions: TrainingRestriction[]
): boolean {
  if (hasRestriction(restrictions, "sprint")) {
    return false;
  }

  if (
    workout.category === "MaxVelocity" &&
    hasRestriction(restrictions, "max-velocity")
  ) {
    return false;
  }

  if (
    workout.category === "Acceleration" &&
    hasRestriction(restrictions, "acceleration")
  ) {
    return false;
  }

  return true;
}

export function getInjurySubstituteStrengthId(
  bodyArea: InjuryBodyArea | undefined,
  weekNumber: number
): string {
  if (bodyArea === "shoulder" || bodyArea === "elbow" || bodyArea === "wrist-hand") {
    return "AS3";
  }

  const rehabPool = ["AS1", "AS2", "AS3"];
  return rehabPool[(weekNumber - 1) % rehabPool.length] ?? "AS1";
}

export function markInjuryAdjustedSession(
  session: SessionOption,
  originalType: TrainingType
): SessionOption {
  return {
    ...session,
    notes: `Adjusted for injury recovery (replaces ${originalType}).`,
  };
}

export function normalizeInjuryProfile(value: unknown): InjuryProfile {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_INJURY_PROFILE };
  }

  const record = value as Record<string, unknown>;
  const status = record.status === "managing" ? "managing" : "normal";
  const bodyArea = INJURY_BODY_AREAS.some((entry) => entry.id === record.bodyArea)
    ? (record.bodyArea as InjuryBodyArea)
    : undefined;

  return {
    status,
    bodyArea: status === "managing" ? bodyArea : undefined,
    startedAt:
      typeof record.startedAt === "string" ? record.startedAt : undefined,
    notes: typeof record.notes === "string" ? record.notes : undefined,
  };
}
