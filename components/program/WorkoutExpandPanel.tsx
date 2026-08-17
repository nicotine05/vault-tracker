import {
  getPrescriptionsForWeek,
  isDeloadWeek,
} from "@/lib/domain/strengthPrescriptions";
import { STRENGTH_CATEGORY_LABELS } from "@/lib/catalogs/strengthCatalog";
import {
  getPhaseConfig,
  type DetailedWorkout,
} from "@/lib/trainingProgram";
import { todayBadgeClassName } from "@/lib/ui/componentStyles";

type WorkoutExpandPanelProps = {
  workout: DetailedWorkout;
  planningWeek: number;
};

export default function WorkoutExpandPanel({
  workout,
  planningWeek,
}: WorkoutExpandPanelProps) {
  return (
    <div className="mt-1 space-y-2 text-xs">
      {"primaryLift" in workout && (
        <>
          {(() => {
            const phase = getPhaseConfig(planningWeek);
            const prescriptions = getPrescriptionsForWeek(workout, planningWeek);
            const deload = isDeloadWeek(planningWeek);

            return (
              <>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={todayBadgeClassName}>
                    {phase.name.toUpperCase()}
                  </span>
                  <span className="rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-muted">
                    {STRENGTH_CATEGORY_LABELS[workout.category]}
                  </span>
                  {deload && (
                    <span className="rounded-full border border-amber-300/60 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-800 [data-theme=dark]:text-amber-200">
                      DELOAD
                    </span>
                  )}
                </div>

                <div className="space-y-1 pt-2">
                  <div>
                    <span className="font-semibold text-accent-text">Main Lift</span>
                    <div className="text-foreground">
                      {workout.primaryLift} — {prescriptions.primary}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-accent-text">Secondary Lift</span>
                    <div className="text-foreground">
                      {workout.secondaryLift} — {prescriptions.secondary}
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="font-semibold text-accent-text">Superset A</span>
                    <div className="space-y-1 text-foreground">
                      {workout.supersetA.map((exercise, index) => (
                        <div key={index}>
                          {exercise} — {prescriptions.supersetA[index]}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="font-semibold text-accent-text">Superset B</span>
                    <div className="space-y-1 text-foreground">
                      {workout.supersetB.map((exercise, index) => (
                        <div key={index}>
                          {exercise} — {prescriptions.supersetB[index]}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="font-semibold text-accent-text">Finisher</span>
                    <div className="text-foreground">
                      {workout.finisher} — {prescriptions.finisher}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </>
      )}

      {"workout" in workout && (
        <>
          <div>
            <span className="font-semibold">Category:</span> {workout.category}
          </div>
          <div>
            <span className="font-semibold">Workout:</span>
            <ul className="mt-1 list-inside list-disc">
              {workout.workout.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-semibold">Rest:</span> {workout.rest}
          </div>
          <div>
            <span className="font-semibold">Purpose:</span> {workout.purpose}
          </div>
        </>
      )}

      {"runLength" in workout && (
        <>
          <div>
            <span className="font-semibold">Run Length:</span> {workout.runLength}
          </div>
          <div>
            <span className="font-semibold">Jump Volume:</span>{" "}
            {workout.jumpVolume}
          </div>
          <div>
            <span className="font-semibold">Description:</span>{" "}
            {workout.description}
          </div>
        </>
      )}
    </div>
  );
}
