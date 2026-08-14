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
  },
];

export function getStrengthWorkout(id: string): StrengthWorkout | undefined {
  return strengthCatalog.find((w) => w.id === id);
}
