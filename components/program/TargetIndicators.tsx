import type { PlannerHealthMetric } from "@/lib/domain/plannerHealth";

type TargetIndicatorsProps = {
  metrics: PlannerHealthMetric[];
};

export default function TargetIndicators({ metrics }: TargetIndicatorsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {metrics.map(({ label, current, required }) => {
        const met = current >= required;

        return (
          <div
            key={label}
            className="flex items-center gap-1.5 text-sm"
            title={`${label}: ${current}/${required}`}
          >
            <span
              className={`font-medium ${
                met
                  ? "text-emerald-700 [data-theme=dark]:text-emerald-300"
                  : "text-muted"
              }`}
            >
              {label}
            </span>
            <span
              className={`text-xs font-semibold ${
                met
                  ? "text-emerald-600 [data-theme=dark]:text-emerald-400"
                  : "text-foreground"
              }`}
            >
              {met ? "✓" : `${current}/${required}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
