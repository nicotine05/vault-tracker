import type { TrafficLightLevel, TrainingType } from "@/lib/trainingProgram";

export const trafficStyles: Record<TrafficLightLevel, string> = {
  Green: "border-emerald-200 bg-emerald-50 text-emerald-900",
  Yellow: "border-yellow-200 bg-yellow-50 text-yellow-900",
  Orange: "border-orange-200 bg-orange-50 text-orange-900",
  Red: "border-red-200 bg-red-50 text-red-900",
  Black: "border-slate-300 bg-slate-800 text-white",
};

export const trainingTypeStyles = {
  vault: {
    button: "border-amber-200 text-amber-900 hover:bg-amber-200",
    selected: "bg-amber-500 text-white border-amber-500 shadow-sm",
    card: "bg-amber-50 border-amber-200",
    badge: "border-amber-200 bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
    ring: "border-amber-500",
  },
  strength: {
    button: "border-sky-200 text-sky-900 hover:bg-sky-200",
    selected: "bg-sky-500 text-white border-sky-500 shadow-sm",
    card: "bg-sky-50 border-sky-200",
    badge: "border-sky-200 bg-sky-100 text-sky-800",
    dot: "bg-sky-500",
    ring: "border-sky-500",
  },
  speed: {
    button: "border-emerald-200 text-emerald-900 hover:bg-emerald-200",
    selected: "bg-emerald-500 text-white border-emerald-500 shadow-sm",
    card: "bg-emerald-50 border-emerald-200",
    badge: "border-emerald-200 bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
    ring: "border-emerald-500",
  },
} as const satisfies Record<
  TrainingType,
  {
    button: string;
    selected: string;
    card: string;
    badge: string;
    dot: string;
    ring: string;
  }
>;
