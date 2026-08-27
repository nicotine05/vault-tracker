import Card from "@/components/Card";
import { getActiveTrainingType } from "@/lib/domain/plannerHealth";
import type { PlannerDay } from "@/lib/trainingProgram";
import { plannerDays, type TrainingType } from "@/lib/trainingProgram";
import { trainingTypeStyles } from "@/lib/ui/trainingStyles";

type WeeklyPlannerCardProps = {
  readOnly: boolean;
  weekPlanner: Record<string, PlannerDay>;
  onToggle: (day: string, type: TrainingType) => void;
  compact?: boolean;
};

const dayAbbreviations: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

export default function WeeklyPlannerCard({
  readOnly,
  weekPlanner,
  onToggle,
  compact = false,
}: WeeklyPlannerCardProps) {
  const plannerContent = (
    <div className={compact ? "space-y-1.5" : "space-y-3"}>
      {plannerDays.map((day) => {
        const activeType = getActiveTrainingType(weekPlanner[day]);
        const styles = activeType ? trainingTypeStyles[activeType] : null;

        if (compact) {
          return (
            <div
              key={day}
              className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 transition-colors ${
                activeType
                  ? `${styles!.card} ring-1 ${styles!.ring}`
                  : "border-border bg-surface-muted"
              }`}
            >
              <p className="w-9 shrink-0 text-xs font-semibold text-foreground">
                {dayAbbreviations[day]}
              </p>

              <div className="grid flex-1 grid-cols-3 gap-1">
                {(["vault", "strength", "speed"] as const).map((type) => {
                  const isSelected = Boolean(weekPlanner[day]?.[type]);

                  return (
                    <button
                      key={type}
                      type="button"
                      disabled={readOnly}
                      onClick={() => onToggle(day, type)}
                      className={`rounded-full border px-1 py-1 text-[11px] font-semibold capitalize transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        isSelected
                          ? trainingTypeStyles[type].selected
                          : trainingTypeStyles[type].button
                      }`}
                    >
                      {type === "strength" ? "str" : type.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }

        return (
          <div
            key={day}
            className={`relative overflow-hidden rounded-2xl border p-4 transition-colors duration-300 ${
              activeType
                ? `${styles!.card} ring-1 ${styles!.ring}`
                : "border-border bg-surface-muted [data-theme=dark]:bg-surface [data-theme=dark]:border-border"
            }`}
          >
            {activeType && (
              <span
                aria-hidden
                className={`absolute inset-y-3 left-0 w-1 rounded-r-full transition-opacity duration-300 ${styles!.accent}`}
              />
            )}

            <div className="mb-3 flex items-center gap-2">
              {activeType && (
                <span
                  className={`h-2.5 w-2.5 rounded-full transition-transform duration-300 ${styles!.dot}`}
                />
              )}
              <p className="font-semibold text-foreground">{day}</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(["vault", "strength", "speed"] as const).map((type) => {
                const isSelected = Boolean(weekPlanner[day]?.[type]);

                return (
                  <button
                    key={type}
                    type="button"
                    disabled={readOnly}
                    onClick={() => onToggle(day, type)}
                    className={`rounded-full border px-2 py-2 text-sm font-semibold capitalize transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isSelected
                        ? `${trainingTypeStyles[type].selected} scale-[1.02]`
                        : trainingTypeStyles[type].button
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  if (compact) {
    return plannerContent;
  }

  return (
    <Card title="Weekly Planner">
      <p className="-mt-1 mb-4 text-sm text-muted">
        Pick one session type per day. Your choices shape the generated schedule.
      </p>
      {plannerContent}
    </Card>
  );
}
