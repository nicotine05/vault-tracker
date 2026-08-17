export type VaultWorkout = {
  id: string;
  name: string;
  load: number;
  runLength: string;
  jumpVolume: string;
  description: string;
  phase: "Rebuild" | "Build" | "Specific";
};

export const vaultCatalog: VaultWorkout[] = [
  {
    id: "VD1",
    name: "Drill Day",
    load: 3,
    runLength: "Short (8-10 steps)",
    jumpVolume: "8-12",
    description: "Low volume technical day for coordination and safe movement patterns.",
    phase: "Rebuild",
  },
  {
    id: "VD2",
    name: "Technical Day",
    load: 5,
    runLength: "Short approach (10-14 steps)",
    jumpVolume: "10-14",
    description: "Technical focus with controlled outputs and smooth sequencing.",
    phase: "Build",
  },
  {
    id: "VD3",
    name: "Short Run Day",
    load: 7,
    runLength: "Short approach (14-18 steps)",
    jumpVolume: "10-16",
    description: "Short run work with a high technical demand and strong nervous system stimulus.",
    phase: "Build",
  },
  {
    id: "VD4",
    name: "Competition Day",
    load: 9,
    runLength: "Full approach (18-22+ steps)",
    jumpVolume: "6-10",
    description: "Primary technical and neurological stress session for the week.",
    phase: "Specific",
  },
  {
    id: "VD5",
    name: "Long Run Day",
    load: 10,
    runLength: "Full approach (22+ steps)",
    jumpVolume: "12-18",
    description: "Higher-volume run-up work to integrate speed, rhythm, and posture.",
    phase: "Specific",
  },
];

export function getVaultWorkout(id: string): VaultWorkout | undefined {
  return vaultCatalog.find((w) => w.id === id);
}
