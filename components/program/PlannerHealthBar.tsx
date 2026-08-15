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
    <div className="sticky top-0 z-20 rounded-xl border border-amber-200 bg-amber-50/95 px-3 py-2 shadow-sm backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900">
        <span aria-hidden="true">⚠</span>
        <span>Planner Health</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm text-slate-800">
        {metrics.map(({ label, current, required }) => {
          const isWarning = current < required;

          return (
            <div
              key={label}
              className={`rounded-lg border p-2 text-center ${
                isWarning
                  ? "border-red-200 bg-red-50 text-red-900"
                  : "border-slate-200 bg-white text-slate-800"
              }`}
            >
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </div>
              <div className="mt-1 font-bold">
                {isWarning ? (
                  <>
                    <span className="inline-flex rounded bg-red-200 px-1 text-red-900">
                      {current}
                    </span>
                    <span className="text-slate-500">/{required}</span>
                  </>
                ) : (
                  <>
                    {current}/{required}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {otherWarnings.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-amber-900">
          {otherWarnings.map((warning) => (
            <li key={warning}>• {warning}</li>
          ))}
        </ul>
      )}

      {healthWarnings.length > 0 && (
        <div className="mt-3 text-xs font-medium text-red-700">
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
