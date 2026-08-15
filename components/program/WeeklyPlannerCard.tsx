import Card from "@/components/Card";
import { getActiveTrainingType } from "@/lib/domain/plannerHealth";
import type { PlannerDay } from "@/lib/trainingProgram";
import { plannerDays, type TrainingType } from "@/lib/trainingProgram";
import { trainingTypeStyles } from "@/lib/ui/trainingStyles";

type WeeklyPlannerCardProps = {
  readOnly: boolean;
  weekPlanner: Record<string, PlannerDay>;
  onToggle: (day: string, type: TrainingType) => void;
};

export default function WeeklyPlannerCard({
  readOnly,
  weekPlanner,
  onToggle,
}: WeeklyPlannerCardProps) {
  return (
    <Card title="Weekly Planner">
      <div className="space-y-3">
        {plannerDays.map((day) => {
          const activeType = getActiveTrainingType(weekPlanner[day]);

          return (
            <div
              key={day}
              className={`rounded-xl border p-3 ${
                activeType
                  ? trainingTypeStyles[activeType].card
                  : "border-slate-200 bg-white"
              }`}
            >
              <p className="mb-2 font-semibold text-slate-800">{day}</p>

              <div className="flex flex-wrap gap-2">
                {(["vault", "strength", "speed"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    disabled={readOnly}
                    onClick={() => onToggle(day, type)}
                    className={`rounded-lg border px-3 py-1 capitalize disabled:cursor-not-allowed disabled:opacity-50 ${
                      weekPlanner[day]?.[type]
                        ? trainingTypeStyles[type].selected
                        : trainingTypeStyles[type].button
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
