export const glassPanelClassName =
  "bg-black/45 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)]";

export const glassButtonClassName =
  "flex items-center justify-center rounded-full bg-black/35 backdrop-blur-xl border border-white/10 text-white transition active:scale-95";

export const glassPillClassName =
  "rounded-full bg-black/40 backdrop-blur-xl border border-white/10 px-3 py-1 text-xs font-medium text-white/90";

export const overlayFadeClass = (visible: boolean) =>
  `transition-opacity duration-300 ease-out ${
    visible ? "opacity-100" : "pointer-events-none opacity-0"
  }`;

export const ANNOTATION_COLORS = [
  "#34C759",
  "#FF9500",
  "#FF3B30",
  "#007AFF",
  "#FFFFFF",
] as const;
