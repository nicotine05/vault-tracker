export type SprintWorkout = {
  id: string;
  name: string;
  category: "Acceleration" | "MaxVelocity" | "RunwayTransfer";
  load: number;
  workout: string[];
  rest: string;
  purpose: string;
  phase: "Rebuild" | "Build" | "Specific";
};

export const sprintCatalog: SprintWorkout[] = [
  {
    id: "S1",
    name: "Acceleration Foundations",
    category: "Acceleration",
    load: 4,
    workout: ["3 x 10m", "3 x 20m", "2 x 30m"],
    rest: "Walk back",
    purpose: "Build acceleration technique and force application",
    phase: "Rebuild",
  },
  {
    id: "S2",
    name: "Acceleration Development",
    category: "Acceleration",
    load: 5,
    workout: ["4 x 20m", "3 x 30m", "2 x 40m"],
    rest: "Walk back",
    purpose: "Develop explosive power and acceleration mechanics",
    phase: "Rebuild",
  },
  {
    id: "S3",
    name: "Acceleration Power",
    category: "Acceleration",
    load: 6,
    workout: ["5 x 20m", "3 x 30m", "2 x 40m"],
    rest: "3 min",
    purpose: "High-quality acceleration with more volume",
    phase: "Build",
  },
  {
    id: "S4",
    name: "Acceleration Advanced",
    category: "Acceleration",
    load: 7,
    workout: ["6 x 30m", "4 x 40m"],
    rest: "3-4 min",
    purpose: "Max-effort acceleration development",
    phase: "Build",
  },
  {
    id: "S5",
    name: "Fly 10",
    category: "MaxVelocity",
    load: 4,
    workout: ["10m build + 20m fly", "6 x (10m + 20m)"],
    rest: "4-5 min",
    purpose: "Maximize top-end velocity",
    phase: "Build",
  },
  {
    id: "S6",
    name: "Fly 20",
    category: "MaxVelocity",
    load: 6,
    workout: ["20m build + 30m fly", "5 x (20m + 30m)"],
    rest: "5 min",
    purpose: "High-velocity running mechanics",
    phase: "Specific",
  },
  {
    id: "S7",
    name: "Mixed Fly Session",
    category: "MaxVelocity",
    load: 8,
    workout: ["2-3 x Fly 10", "2-3 x Fly 20"],
    rest: "5-6 min",
    purpose: "Blend velocity and extended acceleration",
    phase: "Specific",
  },
  {
    id: "S8",
    name: "Pole Run Mechanics",
    category: "RunwayTransfer",
    load: 5,
    workout: ["3 x 20m approach", "3 x 30m approach", "2 x 40m approach"],
    rest: "Walk back",
    purpose: "Transfer speed into pole approach",
    phase: "Specific",
  },
  {
    id: "S9",
    name: "Full Approach Transfer",
    category: "RunwayTransfer",
    load: 3,
    workout: ["2-3 x full approach runs", "2-3 x 50m runway"],
    rest: "5 min",
    purpose: "Integrate speed into competition approach",
    phase: "Specific",
  },
];

export function getSprintWorkout(id: string): SprintWorkout | undefined {
  return sprintCatalog.find((w) => w.id === id);
}
