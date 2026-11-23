export function getPhaseBadgeClass(phaseName: string): string {
  if (phaseName === "Rebuild") {
    return "border border-emerald-200/80 bg-emerald-500/10 text-emerald-800 [data-theme-mode=dark]:border-emerald-500/30 [data-theme-mode=dark]:bg-emerald-500/15 [data-theme-mode=dark]:text-emerald-300";
  }

  if (phaseName === "Build") {
    return "border border-sky-200/80 bg-sky-500/10 text-sky-800 [data-theme-mode=dark]:border-sky-500/30 [data-theme-mode=dark]:bg-sky-500/15 [data-theme-mode=dark]:text-sky-300";
  }

  return "border border-violet-200/80 bg-violet-500/10 text-violet-800 [data-theme-mode=dark]:border-violet-500/30 [data-theme-mode=dark]:bg-violet-500/15 [data-theme-mode=dark]:text-violet-300";
}
