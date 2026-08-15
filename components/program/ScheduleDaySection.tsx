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
  expandedWorkouts: Record<string, boolean>;
  confirmingKey: string | null;
  onToggleExpanded: (key: string) => void;
  onConfirmWorkout: (params: WorkoutToggleParams) => void;
  onSetConfirmingKey: (key: string | null) => void;
};

export default function ScheduleDaySection({
  day,
  planningWeek,
  dailyPlan,
  readOnly,
  completedWorkouts,
  expandedWorkouts,
  confirmingKey,
  onToggleExpanded,
  onConfirmWorkout,
  onSetConfirmingKey,
}: ScheduleDaySectionProps) {
  if (dailyPlan.sessions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface-muted p-4 text-center">
        <p className="font-semibold text-foreground">{day}</p>
        <p className="mt-2 text-sm text-muted">Recovery day — no training scheduled.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface-muted p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="font-semibold text-foreground">{day}</p>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${trafficStyles[dailyPlan.level]}`}
        >
          {getTrafficLightSymbol(dailyPlan.level)} {dailyPlan.level}
        </span>
      </div>

      <div className="space-y-2">
        {dailyPlan.sessions.map((session) => {
          const completionKey = workoutCompletionKey(
            planningWeek,
            day,
            session.id
          );
          const expandKey = `${day}-${session.id}`;
          const isComplete = Boolean(completedWorkouts[completionKey]);
          const isExpanded = expandedWorkouts[expandKey];
          const workout = getCatalogWorkout(session.id);

          return (
            <div key={session.id}>
              <button
                type="button"
                onClick={() => onToggleExpanded(expandKey)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-all ${trainingTypeStyles[session.type].row} ${isComplete ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-medium">{session.name}</div>
                    {session.focus && (
                      <div className="mt-1 text-[11px] opacity-80">
                        {session.focus}
                      </div>
                    )}
                    {session.jumpVolume && (
                      <div className="mt-1 text-[10px] uppercase tracking-wide opacity-70">
                        Jump volume: {session.jumpVolume}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{session.load}</span>
                    <span className="text-xs">{isExpanded ? "▼" : "▶"}</span>
                  </div>
                </div>
              </button>

              {isComplete ? (
                <p className={`mt-1.5 text-center ${successTextClassName}`}>
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
                  className={`mt-1.5 w-full rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    confirmingKey === completionKey
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-surface text-foreground hover:bg-surface-muted"
                  }`}
                >
                  {confirmingKey === completionKey
                    ? "Confirm?"
                    : "Complete workout"}
                </button>
              ) : null}

              {isExpanded && workout && (
                <WorkoutExpandPanel
                  workout={workout}
                  planningWeek={planningWeek}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted">
        <span>Daily load: {dailyPlan.load}</span>
        <span>{getDailyRecommendation(dailyPlan.level)}</span>
      </div>
    </div>
  );
}
