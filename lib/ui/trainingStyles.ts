import type { TrafficLightLevel, TrainingType } from "@/lib/trainingProgram";

const dark = "[data-theme=dark]:";

export const trafficStyles: Record<TrafficLightLevel, string> = {
  Green: [
    "border-emerald-200 bg-emerald-50 text-emerald-900",
    `${dark}border-emerald-400/60 ${dark}bg-emerald-500/25 ${dark}text-emerald-200`,
  ].join(" "),
  Yellow: [
    "border-yellow-200 bg-yellow-50 text-yellow-900",
    `${dark}border-yellow-400/60 ${dark}bg-yellow-500/25 ${dark}text-yellow-200`,
  ].join(" "),
  Orange: [
    "border-orange-200 bg-orange-50 text-orange-900",
    `${dark}border-orange-400/60 ${dark}bg-orange-500/25 ${dark}text-orange-200`,
  ].join(" "),
  Red: [
    "border-red-200 bg-red-50 text-red-900",
    `${dark}border-red-400/60 ${dark}bg-red-500/25 ${dark}text-red-200`,
  ].join(" "),
  Black: [
    "border-slate-300 bg-slate-800 text-white",
    `${dark}border-slate-500 ${dark}bg-slate-700 ${dark}text-white`,
  ].join(" "),
};

export const trainingTypeStyles = {
  vault: {
    button: [
      "border-amber-300/50 bg-surface-muted text-foreground hover:border-amber-400/70 hover:bg-amber-500/10",
      `${dark}border-amber-500/25 ${dark}bg-surface ${dark}text-foreground ${dark}hover:border-amber-400/40 ${dark}hover:bg-amber-500/10`,
    ].join(" "),
    selected: [
      "border-amber-400/80 bg-amber-500/15 text-amber-950 font-semibold ring-1 ring-amber-400/40",
      `${dark}border-amber-400/50 ${dark}bg-amber-500/20 ${dark}text-amber-100 ${dark}ring-amber-400/25`,
    ].join(" "),
    card: [
      "border-amber-200/60 bg-surface-muted",
      `${dark}border-amber-500/20 ${dark}bg-surface`,
    ].join(" "),
    row: [
      "border-amber-200/80 bg-amber-50/80 text-amber-900 hover:bg-amber-100/80",
      `${dark}border-amber-400/50 ${dark}bg-amber-500/20 ${dark}text-amber-200 ${dark}hover:bg-amber-500/30`,
    ].join(" "),
    dot: "bg-amber-500",
    accent: "bg-amber-500/70",
    ring: [`ring-amber-200/40`, `${dark}ring-amber-500/20`].join(" "),
  },
  strength: {
    button: [
      "border-indigo-300/50 bg-surface-muted text-foreground hover:border-indigo-400/70 hover:bg-indigo-500/10",
      `${dark}border-indigo-500/25 ${dark}bg-surface ${dark}text-foreground ${dark}hover:border-indigo-400/40 ${dark}hover:bg-indigo-500/10`,
    ].join(" "),
    selected: [
      "border-indigo-400/80 bg-indigo-500/15 text-indigo-950 font-semibold ring-1 ring-indigo-400/40",
      `${dark}border-indigo-400/50 ${dark}bg-indigo-500/20 ${dark}text-indigo-100 ${dark}ring-indigo-400/25`,
    ].join(" "),
    card: [
      "border-indigo-200/60 bg-surface-muted",
      `${dark}border-indigo-500/20 ${dark}bg-surface`,
    ].join(" "),
    row: [
      "border-indigo-200/80 bg-indigo-50/80 text-indigo-900 hover:bg-indigo-100/80",
      `${dark}border-indigo-400/50 ${dark}bg-indigo-500/20 ${dark}text-indigo-200 ${dark}hover:bg-indigo-500/30`,
    ].join(" "),
    dot: "bg-indigo-500",
    accent: "bg-indigo-500/70",
    ring: [`ring-indigo-200/40`, `${dark}ring-indigo-500/20`].join(" "),
  },
  speed: {
    button: [
      "border-teal-300/50 bg-surface-muted text-foreground hover:border-teal-400/70 hover:bg-teal-500/10",
      `${dark}border-teal-500/25 ${dark}bg-surface ${dark}text-foreground ${dark}hover:border-teal-400/40 ${dark}hover:bg-teal-500/10`,
    ].join(" "),
    selected: [
      "border-teal-400/80 bg-teal-500/15 text-teal-950 font-semibold ring-1 ring-teal-400/40",
      `${dark}border-teal-400/50 ${dark}bg-teal-500/20 ${dark}text-teal-100 ${dark}ring-teal-400/25`,
    ].join(" "),
    card: [
      "border-teal-200/60 bg-surface-muted",
      `${dark}border-teal-500/20 ${dark}bg-surface`,
    ].join(" "),
    row: [
      "border-teal-200/80 bg-teal-50/80 text-teal-900 hover:bg-teal-100/80",
      `${dark}border-teal-400/50 ${dark}bg-teal-500/20 ${dark}text-teal-200 ${dark}hover:bg-teal-500/30`,
    ].join(" "),
    dot: "bg-teal-500",
    accent: "bg-teal-500/70",
    ring: [`ring-teal-200/40`, `${dark}ring-teal-500/20`].join(" "),
  },
} as const satisfies Record<
  TrainingType,
  {
    button: string;
    selected: string;
    card: string;
    row: string;
    dot: string;
    accent: string;
    ring: string;
  }
>;
