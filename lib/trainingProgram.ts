import {
  strengthCatalog,
  type StrengthCategory,
  type StrengthWorkout,
} from "./catalogs/strengthCatalog";
import { sprintCatalog, type SprintWorkout } from "./catalogs/sprintCatalog";
import { vaultCatalog, type VaultWorkout } from "./catalogs/vaultCatalog";

export type TrainingType = "vault" | "strength" | "speed";
export type TrafficLightLevel = "Green" | "Yellow" | "Orange" | "Red" | "Black";

export type DailySchedule = {
  sessions: SessionOption[];
  load: number;
  level: TrafficLightLevel;
};

export type GeneratedWeekSchedule = Record<string, DailySchedule>;

export const ENGINE_VERSION = 2;

export type PlannerDay = {
  vault: boolean;
  strength: boolean;
  speed: boolean;
};

export type PlannerWeek = Record<string, PlannerDay>;

// Unified session type for the planner
export type SessionOption = {
  id: string;
  type: TrainingType;
  name: string;
  load: number;
  tags: string[];
  phase?: string;
  jumpVolume?: string;
  focus?: string;
  workout?: string[];
  exercises?: string[];
  notes?: string;
};

// For detailed workout information
export type DetailedWorkout = StrengthWorkout | SprintWorkout | VaultWorkout;

export type PhaseDefinition = {
  name: string;
  targets: Record<TrainingType, number>;
  vault: SessionOption[];
  strength: SessionOption[];
  sprint: SessionOption[];
};

export const plannerDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const trafficLightThresholds = {
  green: 5,
  yellow: 9,
  orange: 13,
  red: 17,
};

// Helper: Convert catalog workouts to SessionOption format
function vaultToSession(vault: VaultWorkout): SessionOption {
  const tags: string[] = [];
  if (vault.id === "VD4") {
    tags.push("competition");
  }
  if (vault.id === "VD5") {
    tags.push("long-run");
  }

  return {
    id: vault.id,
    type: "vault",
    name: vault.name,
    load: vault.load,
    tags,
    phase: vault.phase,
    jumpVolume: vault.jumpVolume,
    focus: `${vault.runLength} - ${vault.jumpVolume} jumps`,
  };
}

function strengthToSession(strength: StrengthWorkout): SessionOption {
  return {
    id: strength.id,
    type: "strength",
    name: strength.name,
    load: strength.load,
    tags: [strength.category],
    phase: strength.phase,
    exercises: [strength.primaryLift, strength.secondaryLift],
  };
}

function sprintToSession(sprint: SprintWorkout): SessionOption {
  return {
    id: sprint.id,
    type: "speed",
    name: sprint.name,
    load: sprint.load,
    tags: [],
    phase: sprint.phase,
    workout: sprint.workout,
  };
}

// Helper: Get catalog item by ID
export function getCatalogWorkout(id: string): DetailedWorkout | undefined {
  const vault = vaultCatalog.find((v) => v.id === id);
  if (vault) return vault;
  const strength = strengthCatalog.find((s) => s.id === id);
  if (strength) return strength;
  return sprintCatalog.find((s) => s.id === id);
}

// Phase definitions with phase-based vault and sprint assignments.
// Strength is assigned dynamically by category priority in the training engine.

const rebuildVaults = [
  vaultToSession(vaultCatalog.find((v) => v.id === "VD2")!),
  vaultToSession(vaultCatalog.find((v) => v.id === "VD3")!),
];

const rebuildSprints = [
  sprintToSession(sprintCatalog.find((s) => s.id === "S2")!),
  sprintToSession(sprintCatalog.find((s) => s.id === "S1")!),
  sprintToSession(sprintCatalog.find((s) => s.id === "S3")!),
];

const buildVaults = [
  vaultToSession(vaultCatalog.find((v) => v.id === "VD3")!),
  vaultToSession(vaultCatalog.find((v) => v.id === "VD5")!),
];

const buildSprints = [
  sprintToSession(sprintCatalog.find((s) => s.id === "S2")!),
  sprintToSession(sprintCatalog.find((s) => s.id === "S5")!),
  sprintToSession(sprintCatalog.find((s) => s.id === "S3")!),
  sprintToSession(sprintCatalog.find((s) => s.id === "S6")!),
];

const specificVaults = [
  vaultToSession(vaultCatalog.find((v) => v.id === "VD5")!),
  vaultToSession(vaultCatalog.find((v) => v.id === "VD4")!),
];

const specificSprints = [
  sprintToSession(sprintCatalog.find((s) => s.id === "S5")!),
  sprintToSession(sprintCatalog.find((s) => s.id === "S6")!),
  sprintToSession(sprintCatalog.find((s) => s.id === "S8")!),
  sprintToSession(sprintCatalog.find((s) => s.id === "S9")!),
];

export const phases: Record<string, PhaseDefinition> = {
  Rebuild: {
    name: "Rebuild",
    targets: {
      vault: 1,
      strength: 2,
      speed: 2,
    },
    vault: rebuildVaults,
    strength: [],
    sprint: rebuildSprints,
  },
  Build: {
    name: "Build",
    targets: {
      vault: 2,
      strength: 3,
      speed: 2,
    },
    vault: buildVaults,
    strength: [],
    sprint: buildSprints,
  },
  Specific: {
    name: "Specific",
    targets: {
      vault: 2,
      strength: 2,
      speed: 2,
    },
    vault: specificVaults,
    strength: [],
    sprint: specificSprints,
  },
};

export function getPhaseConfig(weekNumber: number): PhaseDefinition {
  if (weekNumber <= 4) return phases.Rebuild;
  if (weekNumber <= 8) return phases.Build;
  return phases.Specific;
}

export function getTrafficLight(load: number): TrafficLightLevel {
  if (load <= trafficLightThresholds.green) return "Green";
  if (load <= trafficLightThresholds.yellow) return "Yellow";
  if (load <= trafficLightThresholds.orange) return "Orange";
  if (load <= trafficLightThresholds.red) return "Red";
  return "Black";
}

export function getTrafficLightSymbol(level: TrafficLightLevel) {
  switch (level) {
    case "Green":
      return "🟢";
    case "Yellow":
      return "🟡";
    case "Orange":
      return "🟠";
    case "Red":
      return "🔴";
    default:
      return "⚫";
  }
}

export function getDailyRecommendation(level: TrafficLightLevel) {
  switch (level) {
    case "Green":
      return "Low stress day.";
    case "Yellow":
      return "Manage fatigue normally.";
    case "Orange":
      return "Moderate fatigue expected.";
    case "Red":
      return "Recovery emphasis recommended.";
    default:
      return "Very high fatigue day. Consider schedule adjustments.";
  }
}

function getPhasePool(phase: PhaseDefinition, type: TrainingType) {
  if (type === "vault") return phase.vault;
  if (type === "strength") return phase.strength;
  return phase.sprint;
}

const STRENGTH_CATEGORY_PRIORITY: Record<string, StrengthCategory[]> = {
  Rebuild: ["LS", "US", "AS", "PC", "TBP"],
  Build: ["TBP", "LS", "US", "PC", "AS"],
  Specific: ["TBP", "PC", "US", "AS", "LS"],
};

function getWorkoutsByCategory(category: StrengthCategory): StrengthWorkout[] {
  return strengthCatalog
    .filter((workout) => workout.category === category)
    .sort((a, b) => a.id.localeCompare(b.id));
}

function assignStrengthWorkout(
  category: StrengthCategory,
  weekNumber: number
): StrengthWorkout {
  const pool = getWorkoutsByCategory(category);
  const index = (weekNumber - 1) % pool.length;
  return pool[index] ?? pool[0];
}

function buildStrengthAssignments(
  plannerWeek: Partial<Record<string, PlannerDay>>,
  weekNumber: number
): Map<string, SessionOption> {
  const phase = getPhaseConfig(weekNumber);
  const priority =
    STRENGTH_CATEGORY_PRIORITY[phase.name] ?? STRENGTH_CATEGORY_PRIORITY.Rebuild;
  const strengthDays = plannerDays.filter((day) => plannerWeek[day]?.strength);
  const categories = priority.slice(0, strengthDays.length);
  const assignments = new Map<string, SessionOption>();

  strengthDays.forEach((day, index) => {
    const category = categories[index];
    if (!category) {
      return;
    }

    const workout = assignStrengthWorkout(category, weekNumber);
    assignments.set(day, strengthToSession(workout));
  });

  return assignments;
}

export function getStrengthCategoryPriority(
  phaseName: string
): StrengthCategory[] {
  return (
    STRENGTH_CATEGORY_PRIORITY[phaseName] ?? STRENGTH_CATEGORY_PRIORITY.Rebuild
  );
}

export function generateScheduleForWeek(
  plannerWeek: Partial<Record<string, PlannerDay>>,
  weekNumber: number
): GeneratedWeekSchedule {
  const phase = getPhaseConfig(weekNumber);
  const strengthAssignments = buildStrengthAssignments(plannerWeek, weekNumber);

  return plannerDays.reduce((acc, day, dayIndex) => {
    const entry = plannerWeek[day] || { vault: false, strength: false, speed: false };
    const assignedSessions: SessionOption[] = [];

    if (entry.vault) {
      const pool = getPhasePool(phase, "vault");
      assignedSessions.push(pool[dayIndex % pool.length] ?? pool[0]);
    }

    if (entry.strength) {
      const strengthSession = strengthAssignments.get(day);
      if (strengthSession) {
        assignedSessions.push(strengthSession);
      }
    }

    if (entry.speed) {
      const pool = getPhasePool(phase, "speed");
      assignedSessions.push(pool[dayIndex % pool.length] ?? pool[0]);
    }

    const load = assignedSessions.reduce((total, session) => total + session.load, 0);

    acc[day] = {
      sessions: assignedSessions,
      load,
      level: getTrafficLight(load),
    };

    return acc;
  }, {} as GeneratedWeekSchedule);
}

export function workoutCompletionKey(
  weekNumber: number,
  day: string,
  sessionId: string
): string {
  return `${weekNumber}-${day}-${sessionId}`;
}

export function getPlannerWarnings(
  plannerWeek: Partial<Record<string, PlannerDay>>,
  weekNumber: number
): string[] {
  const warnings = new Set<string>();
  const scheduled = generateScheduleForWeek(plannerWeek, weekNumber);

  const vaultStreak: string[] = [];
  plannerDays.forEach((day) => {
    if (plannerWeek[day]?.vault) {
      vaultStreak.push(day);
      if (vaultStreak.length >= 2) {
        warnings.add("Consecutive vault days");
      }
    } else {
      vaultStreak.length = 0;
    }
  });

  for (let idx = 0; idx <= plannerDays.length - 3; idx += 1) {
    const slice = plannerDays.slice(idx, idx + 3);
    const highLoadDays = slice.filter((day) => {
      const level = scheduled[day]?.level;
      return level === "Red" || level === "Black";
    });

    if (highLoadDays.length >= 3) {
      warnings.add("Three consecutive Red/Black days");
      break;
    }
  }

  plannerDays.forEach((day) => {
    const planned = plannerWeek[day] || { vault: false, strength: false, speed: false };
    const dailyLoad = scheduled[day]?.load ?? 0;

    if (dailyLoad >= 18) {
      warnings.add("Stacked High-Stress Day");
    }

    if (planned.vault && planned.speed) {
      warnings.add("Vault should occur before Speed on the same day.");
    }

    if (!planned.vault || !planned.strength) return;

    const vaultSession = scheduled[day]?.sessions.find(
      (session) => session.type === "vault" && session.tags.includes("competition")
    );
    const heavyStrength = scheduled[day]?.sessions.find(
      (session) => session.type === "strength" && session.load >= 7
    );

    if (vaultSession && heavyStrength) {
      warnings.add("Competition Day + Heavy Strength same day");
    }

    const longRun = scheduled[day]?.sessions.find(
      (session) => session.type === "vault" && session.tags.includes("long-run")
    );
    if (longRun && heavyStrength) {
      warnings.add("Long Run Day + Heavy Strength same day");
    }
  });

  return Array.from(warnings);
}
