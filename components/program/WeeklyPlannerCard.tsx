import Card from "@/components/Card";
import { getActiveTrainingTypes } from "@/lib/domain/plannerHealth";
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
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {plannerDays.map((day) => {
        const activeTypes = getActiveTrainingTypes(weekPlanner[day]);
        const singleType =
          activeTypes.length === 1 ? activeTypes[0] : undefined;
        const styles = singleType ? trainingTypeStyles[singleType] : null;

        if (compact) {
          return (
            <div
              key={day}
              className={`flex items-center gap-2.5 rounded-xl border px-2.5 py-2 transition-colors ${
                activeTypes.length > 0
                  ? singleType
                    ? `${styles!.card} ring-1 ${styles!.ring}`
                    : "border-border bg-surface-muted ring-1 ring-border/60"
                  : "border-border bg-surface-muted"
              }`}
            >
              <div className="flex w-10 shrink-0 flex-col gap-1">
                <p className="text-xs font-semibold text-foreground">
                  {dayAbbreviations[day]}
                </p>
                {activeTypes.length > 1 && (
                  <div className="flex gap-0.5">
                    {activeTypes.map((type) => (
                      <span
                        key={type}
                        className={`h-1.5 w-1.5 rounded-full ${trainingTypeStyles[type].dot}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="grid flex-1 grid-cols-3 gap-1.5">
                {(["vault", "strength", "speed"] as const).map((type) => {
                  const isSelected = Boolean(weekPlanner[day]?.[type]);

                  return (
                    <button
                      key={type}
                      type="button"
                      disabled={readOnly}
                      onClick={() => onToggle(day, type)}
                      className={`rounded-full border px-1.5 py-1.5 text-[10px] font-semibold capitalize leading-none transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        isSelected
                          ? trainingTypeStyles[type].selected
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
        }

        return (
          <div
            key={day}
            className={`relative overflow-hidden rounded-2xl border p-4 transition-colors duration-300 ${
              activeTypes.length > 0
                ? singleType
                  ? `${styles!.card} ring-1 ${styles!.ring}`
                  : "border-border bg-surface-muted ring-1 ring-border/60 [data-theme=dark]:border-border [data-theme=dark]:bg-surface"
                : "border-border bg-surface-muted [data-theme=dark]:bg-surface [data-theme=dark]:border-border"
            }`}
          >
            {singleType && (
              <span
                aria-hidden
                className={`absolute inset-y-3 left-0 w-1 rounded-r-full transition-opacity duration-300 ${styles!.accent}`}
              />
            )}

            <div className="mb-3 flex items-center gap-2">
              {activeTypes.length > 0 && (
                <div className="flex items-center gap-1">
                  {activeTypes.map((type) => (
                    <span
                      key={type}
                      className={`h-2.5 w-2.5 rounded-full transition-transform duration-300 ${trainingTypeStyles[type].dot}`}
                    />
                  ))}
                </div>
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
        Select one or more training types for each day. Your choices shape the
        generated schedule.
      </p>
      {plannerContent}
    </Card>
  );
}
