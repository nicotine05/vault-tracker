import type { PlannerHealthMetric } from "@/lib/domain/plannerHealth";

type PlannerHealthBarProps = {
  metrics: PlannerHealthMetric[];
  healthWarnings: string[];
  otherWarnings: string[];
};

export default function PlannerHealthBar({
  metrics,
  healthWarnings,
  otherWarnings,
}: PlannerHealthBarProps) {
  return (
    <div className="rounded-2xl border border-border-accent bg-accent-soft/70 p-4 shadow-sm backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-accent-text">Week Targets</p>
        <span className="text-xs text-muted">Phase requirements</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {metrics.map(({ label, current, required }) => {
          const isWarning = current < required;
          const progress = Math.min(100, Math.round((current / required) * 100));

          return (
            <div
              key={label}
              className={`rounded-xl border p-3 ${
                isWarning
                  ? "border-red-300/50 bg-red-500/10"
                  : "border-emerald-300/50 bg-emerald-500/10"
              }`}
            >
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                {label}
              </div>

              <div
                className={`mt-2 text-lg font-bold ${
                  isWarning
                    ? "text-red-700 [data-theme=dark]:text-red-300"
                    : "text-emerald-700 [data-theme=dark]:text-emerald-300"
                }`}
              >
                {current}/{required}
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/5">
                <div
                  className={`h-full rounded-full transition-all ${
                    isWarning ? "bg-red-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {otherWarnings.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-accent-text">
          {otherWarnings.map((warning) => (
            <li key={warning}>• {warning}</li>
          ))}
        </ul>
      )}

      {healthWarnings.length > 0 && (
        <div className="mt-3 space-y-1 text-xs font-medium text-red-700 [data-theme=dark]:text-red-300">
          {healthWarnings.map((warning) => (
            <div key={warning}>
              •{" "}
              {warning
                .replace("Missing Required ", "")
                .replace(" Session", "")}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
