export type PrescriptionSet = {
  primary: string;
  secondary: string;
  supersetA: string[];
  supersetB: string[];
  finisher: string;
};

export type StrengthWorkout = {
  id: string;
  name: string;
  load: number;
  primaryLift: string;
  secondaryLift: string;
  supersetA: string[];
  supersetB: string[];
  finisher: string;
  phase: "Rebuild" | "Build" | "Specific";
  phaseModifications: {
    rebuild: PrescriptionSet;
    build: PrescriptionSet;
    specific: PrescriptionSet;
  };
};

export const strengthCatalog: StrengthWorkout[] = [
  {
    id: "ST1",
    name: "Heavy Lower",
    load: 8,
    primaryLift: "Back Squat",
    secondaryLift: "Romanian Deadlift",
    supersetA: ["Bulgarian Split Squat", "Pullups"],
    supersetB: ["Hamstring Curl", "DB Row"],
    finisher: "Ab Wheel",
    phase: "Rebuild",
    phaseModifications: {
      rebuild: {
        primary: "4x8",
        secondary: "4x8",
        supersetA: ["3x10", "3x8"],
        supersetB: ["3x10", "3x12"],
        finisher: "3x10",
      },
      build: {
        primary: "5x5",
        secondary: "4x6",
        supersetA: ["3x8", "3x8"],
        supersetB: ["3x8", "3x10"],
        finisher: "3x12",
      },
      specific: {
        primary: "3x3",
        secondary: "3x5",
        supersetA: ["2x6", "2x6"],
        supersetB: ["2x6", "2x8"],
        finisher: "2x10",
      },
    },
  },
  {
    id: "ST2",
    name: "Heavy Pull",
    load: 8,
    primaryLift: "Trap Bar Deadlift",
    secondaryLift: "Front Squat",
    supersetA: ["Reverse Lunge", "Chinup"],
    supersetB: ["Back Extension", "Face Pull"],
    finisher: "Farmer Carry",
    phase: "Build",
    phaseModifications: {
      rebuild: {
        primary: "4x8",
        secondary: "4x8",
        supersetA: ["3x10", "3x8"],
        supersetB: ["3x10", "3x12"],
        finisher: "3x10",
      },
      build: {
        primary: "5x5",
        secondary: "4x6",
        supersetA: ["3x8", "3x8"],
        supersetB: ["3x8", "3x10"],
        finisher: "3x12",
      },
      specific: {
        primary: "3x3",
        secondary: "3x5",
        supersetA: ["2x6", "2x6"],
        supersetB: ["2x6", "2x8"],
        finisher: "2x10",
      },
    },
  },
  {
    id: "ST3",
    name: "Strength-Speed",
    load: 5,
    primaryLift: "Speed Squat",
    secondaryLift: "Trap Bar Jump",
    supersetA: ["Walking Lunge", "Pullup"],
    supersetB: ["Single Leg RDL", "Band Pull Apart"],
    finisher: "Med Ball Slam",
    phase: "Build",
    phaseModifications: {
      rebuild: {
        primary: "5x8",
        secondary: "3x5",
        supersetA: ["3x8", "3x8"],
        supersetB: ["3x8", "3x10"],
        finisher: "3x10",
      },
      build: {
        primary: "4x6",
        secondary: "3x5",
        supersetA: ["3x5", "3x6"],
        supersetB: ["3x5", "3x8"],
        finisher: "3x10",
      },
      specific: {
        primary: "3x3",
        secondary: "3x3",
        supersetA: ["2x5", "2x5"],
        supersetB: ["2x5", "2x6"],
        finisher: "2x8",
      },
    },
  },
  {
    id: "ST4",
    name: "Dynamic Strength",
    load: 5,
    primaryLift: "Hang Clean",
    secondaryLift: "Push Press",
    supersetA: ["Box Jump", "Pullup"],
    supersetB: ["Rear Foot Elevated Split Squat", "Cable Row"],
    finisher: "Rotational Med Ball Throw",
    phase: "Build",
    phaseModifications: {
      rebuild: {
        primary: "5x3",
        secondary: "4x5",
        supersetA: ["3x8", "3x8"],
        supersetB: ["3x8", "3x10"],
        finisher: "3x10",
      },
      build: {
        primary: "4x3",
        secondary: "3x5",
        supersetA: ["3x5", "3x6"],
        supersetB: ["3x5", "3x8"],
        finisher: "3x10",
      },
      specific: {
        primary: "3x2",
        secondary: "3x3",
        supersetA: ["2x5", "2x5"],
        supersetB: ["2x5", "2x6"],
        finisher: "2x8",
      },
    },
  },
  {
    id: "ST5",
    name: "Posterior Chain",
    load: 4,
    primaryLift: "Romanian Deadlift",
    secondaryLift: "Hip Thrust",
    supersetA: ["Nordic Curl", "Pullup"],
    supersetB: ["Single Leg RDL", "DB Row"],
    finisher: "Hanging Leg Raise",
    phase: "Specific",
    phaseModifications: {
      rebuild: {
        primary: "4x10",
        secondary: "4x10",
        supersetA: ["3x10", "3x8"],
        supersetB: ["3x10", "3x10"],
        finisher: "3x12",
      },
      build: {
        primary: "4x8",
        secondary: "4x8",
        supersetA: ["3x8", "3x8"],
        supersetB: ["3x8", "3x10"],
        finisher: "3x12",
      },
      specific: {
        primary: "3x5",
        secondary: "3x5",
        supersetA: ["2x6", "2x6"],
        supersetB: ["2x6", "2x8"],
        finisher: "2x10",
      },
    },
  },
  {
    id: "ST6",
    name: "Single-Leg Athleticism",
    load: 3,
    primaryLift: "Bulgarian Split Squat",
    secondaryLift: "Step Up",
    supersetA: ["Lateral Lunge", "Pullup"],
    supersetB: ["Single Leg Calf Raise", "Band Row"],
    finisher: "Suitcase Carry",
    phase: "Specific",
    phaseModifications: {
      rebuild: {
        primary: "3x10",
        secondary: "3x10",
        supersetA: ["3x10", "3x8"],
        supersetB: ["3x10", "3x10"],
        finisher: "3x12",
      },
      build: {
        primary: "3x8",
        secondary: "3x8",
        supersetA: ["3x8", "3x8"],
        supersetB: ["3x8", "3x10"],
        finisher: "3x12",
      },
      specific: {
        primary: "2x5",
        secondary: "2x5",
        supersetA: ["2x6", "2x6"],
        supersetB: ["2x6", "2x8"],
        finisher: "2x10",
      },
    },
  },
  {
    id: "ST7",
    name: "Jump Development",
    load: 3,
    primaryLift: "Depth Jump",
    secondaryLift: "Box Jump",
    supersetA: ["Bounds", "Pullup"],
    supersetB: ["Pogo Series", "Med Ball Toss"],
    finisher: "Dead Bug",
    phase: "Specific",
    phaseModifications: {
      rebuild: {
        primary: "5x3",
        secondary: "4x3",
        supersetA: ["3x5", "3x8"],
        supersetB: ["3x5", "3x5"],
        finisher: "3x8",
      },
      build: {
        primary: "4x3",
        secondary: "3x3",
        supersetA: ["3x5", "3x6"],
        supersetB: ["3x5", "3x5"],
        finisher: "3x8",
      },
      specific: {
        primary: "3x2",
        secondary: "3x2",
        supersetA: ["2x3", "2x5"],
        supersetB: ["2x3", "2x5"],
        finisher: "2x6",
      },
    },
  },
  {
    id: "ST8",
    name: "Competition Power",
    load: 2,
    primaryLift: "Trap Bar Jump",
    secondaryLift: "Med Ball Throw",
    supersetA: ["Pogo Series", "Pullup"],
    supersetB: ["Box Jump", "Band Pull Apart"],
    finisher: "Plank Variation",
    phase: "Specific",
    phaseModifications: {
      rebuild: {
        primary: "5x2",
        secondary: "4x3",
        supersetA: ["3x5", "3x8"],
        supersetB: ["3x5", "3x5"],
        finisher: "3x6",
      },
      build: {
        primary: "4x2",
        secondary: "3x3",
        supersetA: ["3x3", "3x6"],
        supersetB: ["3x3", "3x5"],
        finisher: "3x6",
      },
      specific: {
        primary: "3x1",
        secondary: "3x2",
        supersetA: ["2x3", "2x5"],
        supersetB: ["2x3", "2x5"],
        finisher: "2x5",
      },
    },
  },
];

export function getStrengthWorkout(id: string): StrengthWorkout | undefined {
  return strengthCatalog.find((w) => w.id === id);
}
