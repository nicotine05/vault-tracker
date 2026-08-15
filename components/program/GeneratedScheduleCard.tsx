"use client";

import Card from "@/components/Card";
import WorkoutExpandPanel from "@/components/program/WorkoutExpandPanel";
import type { WorkoutToggleParams } from "@/lib/hooks/useProgramState";
import {
  getCatalogWorkout,
  getDailyRecommendation,
  getTrafficLightSymbol,
  plannerDays,
  workoutCompletionKey,
  type GeneratedWeekSchedule,
} from "@/lib/trainingProgram";
import { trafficStyles } from "@/lib/ui/trainingStyles";

type GeneratedScheduleCardProps = {
  readOnly: boolean;
  planningWeek: number;
  generatedSchedule: GeneratedWeekSchedule;
  completedWorkouts: Record<string, boolean>;
  expandedWorkouts: Record<string, boolean>;
  confirmingKey: string | null;
  onToggleExpanded: (key: string) => void;
  onConfirmWorkout: (params: WorkoutToggleParams) => void;
  onSetConfirmingKey: (key: string | null) => void;
  onReset: () => void;
};

export default function GeneratedScheduleCard({
  readOnly,
  planningWeek,
  generatedSchedule,
  completedWorkouts,
  expandedWorkouts,
  confirmingKey,
  onToggleExpanded,
  onConfirmWorkout,
  onSetConfirmingKey,
  onReset,
}: GeneratedScheduleCardProps) {
  return (
    <div className="mt-4">
      <Card title="Generated Schedule">
        {plannerDays.map((day) => {
          const dailyPlan = generatedSchedule[day];
          if (!dailyPlan || dailyPlan.sessions.length === 0) return null;

          return (
            <div
              key={day}
              className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-800">{day}</p>
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
                        className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                          session.type === "vault"
                            ? "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
                            : session.type === "strength"
                              ? "border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                        } ${isComplete ? "opacity-60" : ""}`}
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
                            <span className="text-xs">
                              {isExpanded ? "▼" : "▶"}
                            </span>
                          </div>
                        </div>
                      </button>

                      {isComplete ? (
                        <p className="mt-1.5 text-center text-xs font-medium text-green-700">
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
                              ? "border-green-600 bg-green-600 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
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

              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-700">
                <span>Daily load: {dailyPlan.load}</span>
                <span>{getDailyRecommendation(dailyPlan.level)}</span>
              </div>
            </div>
          );
        })}
      </Card>

      {!readOnly && (
        <button
          type="button"
          onClick={onReset}
          className="mt-3 w-full rounded-xl border border-gray-300 p-2 text-sm text-gray-700"
        >
          Reset
        </button>
      )}
    </div>
  );
}
