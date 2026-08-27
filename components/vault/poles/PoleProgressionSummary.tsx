"use client";

type PoleProgressionSummaryProps = {
  poleCount: number;
};

export default function PoleProgressionSummary({
  poleCount,
}: PoleProgressionSummaryProps) {
  return (
    <div className="rounded-2xl border border-border-accent bg-gradient-to-br from-surface via-surface-muted to-surface-accent px-4 py-3 text-center shadow-sm">
      <p className="text-2xl font-bold text-foreground">{poleCount}</p>
      <p className="text-xs text-muted">
        pole{poleCount === 1 ? "" : "s"} on progression grid
      </p>
    </div>
  );
}
