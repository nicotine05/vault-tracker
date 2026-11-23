export const glassPanelClassName =
  "bg-black/55 backdrop-blur-2xl border border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.35)]";

/** Minimum ~44pt Apple HIG touch target */
export const glassButtonClassName =
  "flex items-center justify-center rounded-full bg-black/40 backdrop-blur-xl border border-white/12 text-white transition active:scale-95 active:bg-white/20 touch-manipulation select-none";

export const glassPillClassName =
  "rounded-full bg-black/45 backdrop-blur-xl border border-white/12 px-3 py-1.5 text-xs font-medium text-white/90";

export const overlayFadeClass = (visible: boolean) =>
  `transition-opacity duration-200 ease-out ${
    visible ? "opacity-100" : "pointer-events-none opacity-0"
  }`;

export const ANNOTATION_COLORS = [
  "#34C759",
  "#FF9500",
  "#FF3B30",
  "#007AFF",
  "#FFFFFF",
] as const;
