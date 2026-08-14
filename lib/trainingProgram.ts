export type TrainingType = "vault" | "strength" | "speed";

export type PlannerDay = {
  vault: boolean;
  strength: boolean;
  speed: boolean;
};

export type PlannerWeek = Record<string, PlannerDay>;

export type SessionOption = {
  id: string;
  type: TrainingType;
  label: string;
  load: number;
  tags: string[];
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
  red: 12,
};

export const vaultCatalog: SessionOption[] = [
  {
    id: "VD1",
    type: "vault",
    label: "Vault Session 1",
    load: 3,
    tags: ["technical"],
  },
  {
    id: "VD2",
    type: "vault",
    label: "Vault Session 2",
    load: 4,
    tags: ["technical"],
  },
  {
    id: "VD3",
    type: "vault",
    label: "Vault Session 3",
    load: 4,
    tags: ["technical"],
  },
  {
    id: "VD4",
    type: "vault",
    label: "Vault Session 4",
    load: 5,
    tags: ["competition"],
  },
  {
    id: "VD5",
    type: "vault",
    label: "Vault Session 5",
    load: 5,
    tags: ["competition"],
  },
];

export const strengthCatalog: SessionOption[] = [
  {
    id: "ST1",
    type: "strength",
    label: "Strength Session 1",
    load: 5,
    tags: ["heavy"],
  },
  {
    id: "ST2",
    type: "strength",
    label: "Strength Session 2",
    load: 4,
    tags: ["moderate"],
  },
  {
    id: "ST3",
    type: "strength",
    label: "Strength Session 3",
    load: 5,
    tags: ["heavy"],
  },
  {
    id: "ST4",
    type: "strength",
    label: "Strength Session 4",
    load: 6,
    tags: ["heavy"],
  },
  {
    id: "ST5",
    type: "strength",
    label: "Strength Session 5",
    load: 3,
    tags: ["light"],
  },
];

export const sprintCatalog: SessionOption[] = [
  {
    id: "SP1",
    type: "speed",
    label: "Speed Session 1",
    load: 3,
    tags: ["short"],
  },
  {
    id: "SP2",
    type: "speed",
    label: "Speed Session 2",
    load: 4,
    tags: ["long-run"],
  },
  {
    id: "SP3",
    type: "speed",
    label: "Speed Session 3",
    load: 5,
    tags: ["long-run"],
  },
  {
    id: "SP4",
    type: "speed",
    label: "Speed Session 4",
    load: 4,
    tags: ["short"],
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
    strength: [strengthCatalog[1], strengthCatalog[4]],
    sprint: [sprintCatalog[0], sprintCatalog[1]],
  },
  Build: {
    name: "Build",
    targets: {
      vault: 2,
      strength: 3,
      speed: 2,
    },
    vault: [vaultCatalog[1], vaultCatalog[3], vaultCatalog[4]],
    strength: [strengthCatalog[0], strengthCatalog[2], strengthCatalog[3]],
    sprint: [sprintCatalog[0], sprintCatalog[2], sprintCatalog[3]],
  },
  Specific: {
    name: "Specific",
    targets: {
      vault: 2,
      strength: 2,
      speed: 2,
    },
    vault: [vaultCatalog[2], vaultCatalog[3], vaultCatalog[4]],
    strength: [strengthCatalog[0], strengthCatalog[2]],
    sprint: [sprintCatalog[1], sprintCatalog[2], sprintCatalog[3]],
  },
};

export function getPhaseConfig(weekNumber: number): PhaseDefinition {
  if (weekNumber <= 4) return phases.Rebuild;
  if (weekNumber <= 8) return phases.Build;
  return phases.Specific;
}

export function getTrafficLight(load: number): "Green" | "Yellow" | "Red" | "Black" {
  if (load <= trafficLightThresholds.green) return "Green";
  if (load <= trafficLightThresholds.yellow) return "Yellow";
  if (load <= trafficLightThresholds.red) return "Red";
  return "Black";
}

export function getTrafficLightSymbol(level: "Green" | "Yellow" | "Red" | "Black") {
  switch (level) {
    case "Green":
      return "🟢";
    case "Yellow":
      return "🟡";
    case "Red":
      return "🔴";
    default:
      return "⚫️";
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
): Record<string, { sessions: SessionOption[]; load: number; level: "Green" | "Yellow" | "Red" | "Black" }> {
  const phase = getPhaseConfig(weekNumber);

  return plannerDays.reduce((acc, day, dayIndex) => {
    const entry = plannerWeek[day] || { vault: false, strength: false, speed: false };
    const assignedSessions: SessionOption[] = [];

    if (entry.vault) {
      const vaultPool = getPhasePool(phase, "vault");
      const vaultChoice = vaultPool[dayIndex % vaultPool.length] ?? vaultPool[0];
      assignedSessions.push(vaultChoice);
    }

    if (entry.strength) {
      const strengthPool = getPhasePool(phase, "strength");
      const strengthChoice = strengthPool[dayIndex % strengthPool.length] ?? strengthPool[0];
      assignedSessions.push(strengthChoice);
    }

    if (entry.speed) {
      const sprintPool = getPhasePool(phase, "speed");
      const sprintChoice = sprintPool[dayIndex % sprintPool.length] ?? sprintPool[0];
      assignedSessions.push(sprintChoice);
    }

    const load = assignedSessions.reduce((total, session) => total + session.load, 0);

    acc[day] = {
      sessions: assignedSessions,
      load,
      level: getTrafficLight(load),
    };

    return acc;
  }, {} as Record<string, { sessions: SessionOption[]; load: number; level: "Green" | "Yellow" | "Red" | "Black" }>);
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
    if (!planned.vault || !planned.strength) return;

    const vaultSession = scheduled[day]?.sessions.find((session) =>
      session.type === "vault" && session.tags.includes("competition")
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
