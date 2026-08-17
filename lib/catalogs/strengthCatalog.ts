export type PrescriptionSet = {
  primary: string;
  secondary: string;
  supersetA: string[];
  supersetB: string[];
  finisher: string;
};

export type StrengthCategory = "LS" | "US" | "PC" | "AS" | "TBP";

export type StrengthWorkout = {
  id: string;
  name: string;
  category: StrengthCategory;
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

export const STRENGTH_CATEGORY_LOADS: Record<StrengthCategory, number> = {
  LS: 8,
  US: 7,
  PC: 8,
  AS: 4,
  TBP: 5,
};

export const STRENGTH_CATEGORY_LABELS: Record<StrengthCategory, string> = {
  LS: "Lower Strength",
  US: "Upper Strength",
  PC: "Posterior Chain",
  AS: "Athletic Support",
  TBP: "Total Body Power",
};

function standardPrescriptions(): StrengthWorkout["phaseModifications"] {
  return {
    rebuild: {
      primary: "5x5",
      secondary: "3x8",
      supersetA: ["3x10", "3x10"],
      supersetB: ["3x10", "3x12"],
      finisher: "3x10",
    },
    build: {
      primary: "4x4",
      secondary: "3x6",
      supersetA: ["3x8", "3x8"],
      supersetB: ["3x8", "3x10"],
      finisher: "3x10",
    },
    specific: {
      primary: "3x3",
      secondary: "3x5",
      supersetA: ["2x6", "2x6"],
      supersetB: ["2x6", "2x8"],
      finisher: "2x10",
    },
  };
}

function powerPrescriptions(): StrengthWorkout["phaseModifications"] {
  return {
    rebuild: {
      primary: "5x3",
      secondary: "4x5",
      supersetA: ["3x8", "3x8"],
      supersetB: ["3x8", "3x10"],
      finisher: "3x8",
    },
    build: {
      primary: "4x3",
      secondary: "3x5",
      supersetA: ["3x5", "3x6"],
      supersetB: ["3x5", "3x8"],
      finisher: "3x8",
    },
    specific: {
      primary: "3x2",
      secondary: "3x3",
      supersetA: ["2x5", "2x5"],
      supersetB: ["2x5", "2x6"],
      finisher: "2x8",
    },
  };
}

function supportPrescriptions(): StrengthWorkout["phaseModifications"] {
  return {
    rebuild: {
      primary: "4x8",
      secondary: "3x10",
      supersetA: ["3x10", "3x10"],
      supersetB: ["3x10", "3x12"],
      finisher: "3x12",
    },
    build: {
      primary: "3x8",
      secondary: "3x8",
      supersetA: ["3x10", "3x10"],
      supersetB: ["3x10", "3x12"],
      finisher: "3x10",
    },
    specific: {
      primary: "3x6",
      secondary: "2x8",
      supersetA: ["2x8", "2x8"],
      supersetB: ["2x8", "2x10"],
      finisher: "2x10",
    },
  };
}

function createWorkout(params: {
  id: string;
  name: string;
  category: StrengthCategory;
  primaryLift: string;
  secondaryLift: string;
  supersetA: string[];
  supersetB: string[];
  finisher: string;
  phase: StrengthWorkout["phase"];
  prescriptions?: StrengthWorkout["phaseModifications"];
}): StrengthWorkout {
  const prescriptions =
    params.prescriptions ??
    (params.category === "TBP"
      ? powerPrescriptions()
      : params.category === "AS"
        ? supportPrescriptions()
        : standardPrescriptions());

  return {
    id: params.id,
    name: params.name,
    category: params.category,
    load: STRENGTH_CATEGORY_LOADS[params.category],
    primaryLift: params.primaryLift,
    secondaryLift: params.secondaryLift,
    supersetA: params.supersetA,
    supersetB: params.supersetB,
    finisher: params.finisher,
    phase: params.phase,
    phaseModifications: prescriptions,
  };
}

export const strengthCatalog: StrengthWorkout[] = [
  createWorkout({
    id: "LS1",
    name: "Squat Foundation",
    category: "LS",
    primaryLift: "Back Squat",
    secondaryLift: "Romanian Deadlift",
    supersetA: ["Bulgarian Split Squat", "Pullup"],
    supersetB: ["Hamstring Curl", "DB Row"],
    finisher: "Ab Wheel",
    phase: "Rebuild",
  }),
  createWorkout({
    id: "LS2",
    name: "Front Squat Strength",
    category: "LS",
    primaryLift: "Front Squat",
    secondaryLift: "Trap Bar Deadlift",
    supersetA: ["Reverse Lunge", "Chinup"],
    supersetB: ["Back Extension", "Face Pull"],
    finisher: "Farmer Carry",
    phase: "Rebuild",
  }),
  createWorkout({
    id: "LS3",
    name: "Unilateral Lower",
    category: "LS",
    primaryLift: "Back Squat",
    secondaryLift: "Single Leg RDL",
    supersetA: ["Step Up", "Pullup"],
    supersetB: ["Single Leg Calf Raise", "Cable Row"],
    finisher: "Pallof Press",
    phase: "Build",
  }),
  createWorkout({
    id: "LS4",
    name: "Heavy Pull Lower",
    category: "LS",
    primaryLift: "Trap Bar Deadlift",
    secondaryLift: "Front Squat",
    supersetA: ["Walking Lunge", "Pullup"],
    supersetB: ["Nordic Curl", "DB Row"],
    finisher: "Suitcase Carry",
    phase: "Build",
  }),
  createWorkout({
    id: "US1",
    name: "Pull Emphasis",
    category: "US",
    primaryLift: "Weighted Pullup",
    secondaryLift: "Bench Press",
    supersetA: ["Barbell Row", "Push Press"],
    supersetB: ["Lat Pulldown", "Face Pull"],
    finisher: "Dead Bug",
    phase: "Rebuild",
  }),
  createWorkout({
    id: "US2",
    name: "Press and Pull",
    category: "US",
    primaryLift: "Overhead Press",
    secondaryLift: "Barbell Row",
    supersetA: ["Incline DB Press", "Pullup"],
    supersetB: ["Band Pull Apart", "Rear Delt Fly"],
    finisher: "Farmer Carry",
    phase: "Rebuild",
  }),
  createWorkout({
    id: "US3",
    name: "Vertical Pull",
    category: "US",
    primaryLift: "Chinup",
    secondaryLift: "Incline DB Press",
    supersetA: ["Cable Row", "Landmine Press"],
    supersetB: ["Face Pull", "Scap Pushup"],
    finisher: "Hanging Leg Raise",
    phase: "Build",
  }),
  createWorkout({
    id: "US4",
    name: "Upper Power Support",
    category: "US",
    primaryLift: "Push Press",
    secondaryLift: "Weighted Pullup",
    supersetA: ["DB Row", "Landmine Rotation"],
    supersetB: ["Band Face Pull", "External Rotation"],
    finisher: "Plank",
    phase: "Build",
  }),
  createWorkout({
    id: "PC1",
    name: "Hip Hinge",
    category: "PC",
    primaryLift: "Romanian Deadlift",
    secondaryLift: "Hip Thrust",
    supersetA: ["Nordic Curl", "Pullup"],
    supersetB: ["Single Leg RDL", "Back Extension"],
    finisher: "Glute Bridge Hold",
    phase: "Rebuild",
  }),
  createWorkout({
    id: "PC2",
    name: "Posterior Chain Heavy",
    category: "PC",
    primaryLift: "Trap Bar Deadlift",
    secondaryLift: "Hip Thrust",
    supersetA: ["Hamstring Curl", "Pullup"],
    supersetB: ["Good Morning", "Face Pull"],
    finisher: "Reverse Hyper",
    phase: "Build",
  }),
  createWorkout({
    id: "PC3",
    name: "Sprint Support",
    category: "PC",
    primaryLift: "Romanian Deadlift",
    secondaryLift: "Glute Ham Raise",
    supersetA: ["Single Leg RDL", "Pullup"],
    supersetB: ["Calf Raise", "Back Extension"],
    finisher: "Dead Bug",
    phase: "Specific",
  }),
  createWorkout({
    id: "PC4",
    name: "Hamstring Focus",
    category: "PC",
    primaryLift: "Romanian Deadlift",
    secondaryLift: "Hip Thrust",
    supersetA: ["Nordic Curl", "Chinup"],
    supersetB: ["KB Swing", "Band Row"],
    finisher: "Side Plank",
    phase: "Specific",
  }),
  createWorkout({
    id: "AS1",
    name: "Core and Stability",
    category: "AS",
    primaryLift: "Goblet Squat",
    secondaryLift: "Single Leg RDL",
    supersetA: ["Pallof Press", "Bird Dog"],
    supersetB: ["Side Plank", "Glute Bridge"],
    finisher: "Dead Bug",
    phase: "Rebuild",
  }),
  createWorkout({
    id: "AS2",
    name: "Unilateral Athletic",
    category: "AS",
    primaryLift: "Bulgarian Split Squat",
    secondaryLift: "Step Up",
    supersetA: ["Lateral Lunge", "Pullup"],
    supersetB: ["Single Leg Calf Raise", "Band Row"],
    finisher: "Suitcase Carry",
    phase: "Build",
  }),
  createWorkout({
    id: "AS3",
    name: "Shoulder Health",
    category: "AS",
    primaryLift: "Landmine Press",
    secondaryLift: "Face Pull",
    supersetA: ["Y-T-W Raises", "Band Pull Apart"],
    supersetB: ["Scap Pushup", "External Rotation"],
    finisher: "Plank",
    phase: "Specific",
  }),
  createWorkout({
    id: "TBP1",
    name: "Olympic Power",
    category: "TBP",
    primaryLift: "Hang Clean",
    secondaryLift: "Push Press",
    supersetA: ["Box Jump", "Pullup"],
    supersetB: ["Med Ball Throw", "Band Pull Apart"],
    finisher: "Rotational Med Ball Throw",
    phase: "Build",
  }),
  createWorkout({
    id: "TBP2",
    name: "Jump Power",
    category: "TBP",
    primaryLift: "Trap Bar Jump",
    secondaryLift: "Speed Squat",
    supersetA: ["Bounds", "Pullup"],
    supersetB: ["Box Jump", "Med Ball Slam"],
    finisher: "Dead Bug",
    phase: "Build",
  }),
  createWorkout({
    id: "TBP3",
    name: "Competition Power",
    category: "TBP",
    primaryLift: "Hang Power Clean",
    secondaryLift: "Med Ball Throw",
    supersetA: ["Depth Jump", "Pullup"],
    supersetB: ["Pogo Series", "Push Press"],
    finisher: "Plank",
    phase: "Specific",
  }),
];

export function getStrengthWorkout(id: string): StrengthWorkout | undefined {
  return strengthCatalog.find((workout) => workout.id === id);
}
