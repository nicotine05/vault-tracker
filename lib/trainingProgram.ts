export type TrainingType = "vault" | "strength" | "speed";
export type TrafficLightLevel = "Green" | "Yellow" | "Orange" | "Red" | "Black";

export type PlannerDay = {
  vault: boolean;
  strength: boolean;
  speed: boolean;
};

export type PlannerWeek = Record<string, PlannerDay>;

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
  green: 4,
  yellow: 8,
  orange: 12,
  red: 17,
};

export const vaultCatalog: SessionOption[] = [
  {
    id: "VD1",
    type: "vault",
    name: "Drill Day",
    load: 1,
    tags: ["technical"],
    jumpVolume: "8-12",
    focus: "Technical rhythm and posture",
    phase: "Rebuild",
    notes: "Low volume technical day for coordination and safe movement patterns.",
  },
  {
    id: "VD2",
    type: "vault",
    name: "Technical Day",
    load: 3,
    tags: ["technical"],
    jumpVolume: "10-14",
    focus: "Short approach vaulting",
    phase: "Build",
    notes: "Technical focus with controlled outputs and smooth sequencing.",
  },
  {
    id: "VD3",
    type: "vault",
    name: "Short Run Day",
    load: 6,
    tags: ["technical", "run-up"],
    jumpVolume: "10-16",
    focus: "Short approach vaulting",
    phase: "Build",
    notes: "Short run work with a high technical demand and strong nervous system stimulus.",
  },
  {
    id: "VD4",
    type: "vault",
    name: "Competition Day",
    load: 10,
    tags: ["competition"],
    jumpVolume: "6-10",
    focus: "Competition model vaulting",
    phase: "Specific",
    notes: "Primary technical and neurological stress session for the week.",
  },
  {
    id: "VD5",
    type: "vault",
    name: "Long Run Day",
    load: 8,
    tags: ["long-run", "competition"],
    jumpVolume: "12-18",
    focus: "Long approach and rhythm work",
    phase: "Specific",
    notes: "Higher-volume run-up work to integrate speed, rhythm, and posture.",
  },
];

export const strengthCatalog: SessionOption[] = [
  {
    id: "ST1",
    type: "strength",
    name: "Heavy Lower",
    load: 8,
    tags: ["heavy", "lower"],
    exercises: ["Romanian Deadlift", "Front Squat", "Split Squat", "Core Circuit"],
    phase: "Rebuild",
    notes: "Primary lower-body heavy session with high recovery cost.",
  },
  {
    id: "ST2",
    type: "strength",
    name: "Heavy Squat",
    load: 8,
    tags: ["heavy", "squat"],
    exercises: ["Back Squat", "Front Squat", "Walking Lunge", "Ab Wheel"],
    phase: "Build",
    notes: "Heavy squat emphasis with longer rest and lower total rep output.",
  },
  {
    id: "ST3",
    type: "strength",
    name: "Strength-Speed",
    load: 5,
    tags: ["speed-strength"],
    exercises: ["Box Jump", "Push Press", "Trap Bar", "Med Ball Throws"],
    phase: "Build",
    notes: "Explosive work with moderate fatigue and high movement quality demands.",
  },
  {
    id: "ST4",
    type: "strength",
    name: "Dynamic Strength",
    load: 5,
    tags: ["dynamic"],
    exercises: ["Jump Squat", "Bench Press", "Single-Leg RDL", "Pull-Up"],
    phase: "Build",
    notes: "Dynamic lower-body emphasis with speed of movement and moderate load.",
  },
  {
    id: "ST5",
    type: "strength",
    name: "Posterior Chain",
    load: 4,
    tags: ["posterior-chain"],
    exercises: ["Romanian Deadlift", "Split Squat", "Pull-Up", "Core Circuit"],
    phase: "Specific",
    notes: "Posterior chain work to support force transmission and vault power.",
  },
  {
    id: "ST6",
    type: "strength",
    name: "Single-Leg Athleticism",
    load: 3,
    tags: ["single-leg"],
    exercises: ["Single-Leg RDL", "Step-Up", "Lateral Lunge", "Balance Drill"],
    phase: "Specific",
    notes: "Unilateral stability and force production with lower total fatigue cost.",
  },
  {
    id: "ST7",
    type: "strength",
    name: "Jump Development",
    load: 3,
    tags: ["jump"],
    exercises: ["Box Jump", "Depth Jump", "Broad Jump", "Core Circuit"],
    phase: "Specific",
    notes: "A lower-load jump exposure day designed to improve reactive power.",
  },
  {
    id: "ST8",
    type: "strength",
    name: "Competition Power",
    load: 2,
    tags: ["power"],
    exercises: ["Clean Pull", "Trap Bar Jump", "Hanging Knee Raise", "Explosive Push-Up"],
    phase: "Specific",
    notes: "Lower fatigue but still high-power exposure in the competition window.",
  },
];

export const sprintCatalog: SessionOption[] = [
  {
    id: "S1",
    type: "speed",
    name: "Acceleration Development",
    load: 2,
    tags: ["short"],
    workout: ["4 x 10m", "4 x 20m", "3 x 30m"],
    phase: "Rebuild",
    notes: "Short acceleration work focused on mechanics and force application.",
  },
  {
    id: "S2",
    type: "speed",
    name: "Acceleration Power",
    load: 3,
    tags: ["short"],
    workout: ["5 x 20m", "3 x 30m", "2 x 40m"],
    phase: "Build",
    notes: "Acceleration emphasis with moderate speed exposure and controlled recovery.",
  },
  {
    id: "S3",
    type: "speed",
    name: "Max Velocity Development",
    load: 4,
    tags: ["max-velocity"],
    workout: ["6 x 30m", "4 x 40m", "2 x 60m"],
    phase: "Specific",
    notes: "Higher-speed work to maximize top-end velocity output.",
  },
  {
    id: "S4",
    type: "speed",
    name: "Runway Session",
    load: 2,
    tags: ["runway"],
    workout: ["3 x 20m", "3 x 30m", "2 x 50m"],
    phase: "Specific",
    notes: "Lower-cost runway work used to maintain rhythm and coordination.",
  },
  {
    id: "S5",
    type: "speed",
    name: "Sprint Mechanics",
    load: 3,
    tags: ["mechanics"],
    workout: ["6 x 10m", "4 x 20m", "2 x 30m"],
    phase: "Build",
    notes: "Technique-driven speed session with moderate fatigue demands.",
  },
];

export const phases: Record<string, PhaseDefinition> = {
  Rebuild: {
    name: "Rebuild",
    targets: {
      vault: 1,
      strength: 2,
      speed: 2,
    },
    vault: [vaultCatalog[0], vaultCatalog[2]],
    strength: [strengthCatalog[0], strengthCatalog[5]],
    sprint: [sprintCatalog[0], sprintCatalog[4]],
  },
  Build: {
    name: "Build",
    targets: {
      vault: 2,
      strength: 3,
      speed: 2,
    },
    vault: [vaultCatalog[1], vaultCatalog[2], vaultCatalog[4]],
    strength: [strengthCatalog[1], strengthCatalog[2], strengthCatalog[3]],
    sprint: [sprintCatalog[1], sprintCatalog[2], sprintCatalog[4]],
  },
  Specific: {
    name: "Specific",
    targets: {
      vault: 2,
      strength: 2,
      speed: 2,
    },
    vault: [vaultCatalog[2], vaultCatalog[3], vaultCatalog[4]],
    strength: [strengthCatalog[4], strengthCatalog[6]],
    sprint: [sprintCatalog[2], sprintCatalog[3], sprintCatalog[4]],
  },
};

export function getPhaseConfig(weekNumber: number): PhaseDefinition {
  if (weekNumber <= 4) return phases.Rebuild;
  if (weekNumber <= 8) return phases.Build;
  return phases.Specific;
}

export function getTrafficLight(load: number): TrafficLightLevel {
  if (load <= 4) return "Green";
  if (load <= 8) return "Yellow";
  if (load <= 12) return "Orange";
  if (load <= 17) return "Red";
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
