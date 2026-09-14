"use client";

import WorkoutExpandPanel from "@/components/program/WorkoutExpandPanel";
import type { WorkoutToggleParams } from "@/lib/hooks/useProgramState";
import {
  getCatalogWorkout,
  getDailyRecommendation,
  getTrafficLightSymbol,
  workoutCompletionKey,
  type DailySchedule,
} from "@/lib/trainingProgram";
import { trafficStyles, trainingTypeStyles } from "@/lib/ui/trainingStyles";
import { successTextClassName } from "@/lib/ui/componentStyles";

type ScheduleDaySectionProps = {
  day: string;
  planningWeek: number;
  dailyPlan: DailySchedule;
  readOnly: boolean;
  completedWorkouts: Record<string, boolean>;
  confirmingKey: string | null;
  onConfirmWorkout: (params: WorkoutToggleParams) => void;
  onSetConfirmingKey: (key: string | null) => void;
};

function getSessionTypeLabel(type: string): string {
  if (type === "vault") return "Vault Session";
  if (type === "strength") return "Strength Session";
  if (type === "speed") return "Speed Session";
  return "Session";
}

export default function ScheduleDaySection({
  day,
  planningWeek,
  dailyPlan,
  readOnly,
  completedWorkouts,
  confirmingKey,
  onConfirmWorkout,
  onSetConfirmingKey,
}: ScheduleDaySectionProps) {
  if (dailyPlan.sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface-muted p-6 text-center">
        <p className="text-xl font-bold text-foreground">{day}</p>
        <p className="mt-2 text-sm text-muted">Recovery day — no training scheduled.</p>
      </div>
    );
  }

  const allComplete = dailyPlan.sessions.every((session) =>
    Boolean(
      completedWorkouts[workoutCompletionKey(planningWeek, day, session.id)]
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-2xl font-bold text-foreground">{day}</p>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${trafficStyles[dailyPlan.level]}`}
        >
          {getTrafficLightSymbol(dailyPlan.level)}
          {dailyPlan.level}
        </span>
      </div>

      <div className="space-y-3">
        {dailyPlan.sessions.map((session) => {
          const completionKey = workoutCompletionKey(
            planningWeek,
            day,
            session.id
          );
          const isComplete = Boolean(completedWorkouts[completionKey]);
          const workout = getCatalogWorkout(session.id);
          const typeStyles = trainingTypeStyles[session.type];

          return (
            <div
              key={session.id}
              className={`overflow-hidden rounded-2xl border ${typeStyles.row} ${isComplete ? "opacity-70" : ""}`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                      {getSessionTypeLabel(session.type)}
                    </p>
                    <p className="mt-1 text-lg font-bold">{session.name}</p>
                    {session.focus && (
                      <p className="mt-1 text-sm opacity-80">{session.focus}</p>
                    )}
                    {session.jumpVolume && (
                      <p className="mt-1 text-xs uppercase tracking-wide opacity-70">
                        {session.jumpVolume} jumps
                      </p>
                    )}
                  </div>
                  <span className="rounded-lg bg-black/5 px-2 py-1 text-xs font-bold [data-theme=dark]:bg-white/10">
                    Load {session.load}
                  </span>
                </div>

                {workout && (
                  <div className="mt-3 border-t border-black/10 pt-3 [data-theme=dark]:border-white/10">
                    <WorkoutExpandPanel
                      workout={workout}
                      planningWeek={planningWeek}
                    />
                  </div>
                )}

                {isComplete ? (
                  <p className={`mt-3 text-center ${successTextClassName}`}>
                    Completed ✓
                  </p>
                ) : !readOnly ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmingKey === completionKey) {
                        onConfirmWorkout({
                          weekNumber: planningWeek,
                          day,
                          sessionId: session.id,
                          sessionName: session.name,
                          sessionType: session.type,
                        });
                        onSetConfirmingKey(null);
                      } else {
                        onSetConfirmingKey(completionKey);
                      }
                    }}
                    className={`mt-3 w-full rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                      confirmingKey === completionKey
                        ? "bg-accent text-white"
                        : "border border-border bg-surface text-foreground hover:bg-surface-muted"
                    }`}
                  >
                    {confirmingKey === completionKey
                      ? "Confirm Complete?"
                      : "Complete Workout"}
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border/60 bg-surface-muted/50 px-4 py-3 text-xs text-muted">
        <div className="flex items-center justify-between gap-3">
          <span>Daily load: {dailyPlan.load}</span>
          <span>{getDailyRecommendation(dailyPlan.level)}</span>
        </div>
        {allComplete && (
          <p className={`mt-2 text-center ${successTextClassName}`}>
            All workouts complete for {day} ✓
          </p>
        )}
      </div>
    </div>
  );
}
