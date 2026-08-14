import { strengthCatalog, type StrengthWorkout } from "./catalogs/strengthCatalog";
import { sprintCatalog, type SprintWorkout } from "./catalogs/sprintCatalog";
import { vaultCatalog, type VaultWorkout } from "./catalogs/vaultCatalog";

export type TrainingType = "vault" | "strength" | "speed";
export type TrafficLightLevel = "Green" | "Yellow" | "Orange" | "Red" | "Black";

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
  return {
    id: vault.id,
    type: "vault",
    name: vault.name,
    load: vault.load,
    tags: [],
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
    tags: [],
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

// Phase definitions with phase-based session assignments
// REBUILD: VD2, VD3 | ST1, ST5, ST2, ST6 | S2, S1, S3
// BUILD: VD3, VD5 | ST1, ST3, ST2, ST4 | S2, S5, S3, S6
// SPECIFIC: VD5, VD4 | ST3, ST7, ST8 | S5, S6, S8, S9

const rebuildVaults = [
  vaultToSession(vaultCatalog.find((v) => v.id === "VD2")!),
  vaultToSession(vaultCatalog.find((v) => v.id === "VD3")!),
];

const rebuildStrength = [
  strengthToSession(strengthCatalog.find((s) => s.id === "ST1")!),
  strengthToSession(strengthCatalog.find((s) => s.id === "ST5")!),
  strengthToSession(strengthCatalog.find((s) => s.id === "ST2")!),
  strengthToSession(strengthCatalog.find((s) => s.id === "ST6")!),
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

const buildStrength = [
  strengthToSession(strengthCatalog.find((s) => s.id === "ST1")!),
  strengthToSession(strengthCatalog.find((s) => s.id === "ST3")!),
  strengthToSession(strengthCatalog.find((s) => s.id === "ST2")!),
  strengthToSession(strengthCatalog.find((s) => s.id === "ST4")!),
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

const specificStrength = [
  strengthToSession(strengthCatalog.find((s) => s.id === "ST3")!),
  strengthToSession(strengthCatalog.find((s) => s.id === "ST7")!),
  strengthToSession(strengthCatalog.find((s) => s.id === "ST8")!),
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
    strength: rebuildStrength,
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
    strength: buildStrength,
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
    strength: specificStrength,
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

export function generateScheduleForWeek(
  plannerWeek: Partial<Record<string, PlannerDay>>,
  weekNumber: number
): Record<string, { sessions: SessionOption[]; load: number; level: TrafficLightLevel }> {
  const phase = getPhaseConfig(weekNumber);

  return plannerDays.reduce((acc, day, dayIndex) => {
    const entry = plannerWeek[day] || { vault: false, strength: false, speed: false };
    const assignedSessions: SessionOption[] = [];

    if (entry.vault) {
      const pool = getPhasePool(phase, "vault");
      assignedSessions.push(pool[dayIndex % pool.length] ?? pool[0]);
    }

    if (entry.strength) {
      const pool = getPhasePool(phase, "strength");
      assignedSessions.push(pool[dayIndex % pool.length] ?? pool[0]);
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
  }, {} as Record<string, { sessions: SessionOption[]; load: number; level: TrafficLightLevel }>);
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

    if (planned.vault && planned.speed) {
      warnings.add("Vault should occur before Speed on the same day.");
    }

    if (!planned.vault || !planned.strength) return;

    const vaultSession = scheduled[day]?.sessions.find(
      (session) => session.type === "vault" && session.tags.includes("competition")
    );
    const heavyStrength = scheduled[day]?.sessions.find(
      (session) => session.type === "strength" && session.load >= 5
    );

    if (vaultSession && heavyStrength) {
      warnings.add("Competition Day + Heavy Strength same day");
    }

    const longRun = scheduled[day]?.sessions.find(
      (session) => session.type === "speed" && session.tags.includes("long-run")
    );
    if (longRun && heavyStrength) {
      warnings.add("Long Run Day + Heavy Strength same day");
    }
  });

  return Array.from(warnings);
}
