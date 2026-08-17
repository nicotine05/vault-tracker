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
            const phaseNameLower = phase.name.toLowerCase() as
              | "rebuild"
              | "build"
              | "specific";
            const prescriptions = workout.phaseModifications[phaseNameLower];

            return (
              <>
                <div className={`mb-2 inline-block ${todayBadgeClassName}`}>
                  {phase.name.toUpperCase()}
                </div>

                <div className="space-y-1 pt-2">
                  <div>
                    <span className="font-semibold text-accent-text">Primary</span>
                    <div className="text-foreground">
                      {workout.primaryLift} — {prescriptions.primary}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-accent-text">Secondary</span>
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
