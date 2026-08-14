"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import { useProgramState } from "@/lib/hooks/useProgramState";
import { getPhaseNameForWeek } from "@/lib/domain/programWeek";
import {
  plannerDays,
  getPhaseConfig,
  getPlannerWarnings,
  getTrafficLightSymbol,
  getDailyRecommendation,
  getCatalogWorkout,
  workoutCompletionKey,
  type TrainingType,
} from "@/lib/trainingProgram";
import { isWeekScheduleGenerated } from "@/lib/storage/programStore";
import { trafficStyles, trainingTypeStyles } from "@/lib/ui/trainingStyles";

export default function ProgramPage() {
  const {
    currentWeek,
    planningWeek,
    plannerByWeek,
    scheduleSnapshotsByWeek,
    completedWorkouts,
    executionHistory,
    updatePlannerDay,
    generateWeekSchedule,
    resetWeekPlanner,
    completeWorkout,
  } = useProgramState();

  const [expandedWorkouts, setExpandedWorkouts] = useState<Record<string, boolean>>({});
  const [confirmingKey, setConfirmingKey] = useState<string | null>(null);

  const weekPlanner = plannerByWeek[planningWeek] || {};
  const phaseConfig = getPhaseConfig(planningWeek);
  const phaseName = getPhaseNameForWeek(planningWeek);
  const targets = phaseConfig.targets;

  const counts = {
    vault: plannerDays.filter((d) => weekPlanner[d]?.vault).length,
    strength: plannerDays.filter((d) => weekPlanner[d]?.strength).length,
    speed: plannerDays.filter((d) => weekPlanner[d]?.speed).length,
  };

  const plannerComplete =
    counts.vault >= targets.vault &&
    counts.strength >= targets.strength &&
    counts.speed >= targets.speed;

  const togglePlanner = (day: string, type: TrainingType) => {
    updatePlannerDay(planningWeek, day, type);
  };

  const warnings = getPlannerWarnings(weekPlanner, planningWeek);

  if (counts.vault < targets.vault)
    warnings.unshift("Missing Required Vault Session");
  if (counts.strength < targets.strength)
    warnings.unshift("Missing Required Strength Session");
  if (counts.speed < targets.speed)
    warnings.unshift("Missing Required Speed Session");

  const healthMetrics = [
    { label: "Vault", current: counts.vault, required: targets.vault },
    { label: "Strength", current: counts.strength, required: targets.strength },
    { label: "Speed", current: counts.speed, required: targets.speed },
  ];

  const healthWarnings = warnings.filter((warning) =>
    warning.startsWith("Missing Required ")
  );
  const otherWarnings = warnings.filter(
    (warning) => !warning.startsWith("Missing Required ")
  );

  const programState = {
    currentWeek,
    planningWeek,
    plannerByWeek,
    scheduleSnapshotsByWeek,
    completedWorkouts,
    executionHistory,
  };

  const generated = isWeekScheduleGenerated(programState, planningWeek);
  const snapshot = scheduleSnapshotsByWeek[planningWeek];
  const generatedSchedule = snapshot?.schedule ?? {};

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold mb-4">Program</h1>

      <Card>
        <div className="text-center">
          <p className="font-bold">Week {planningWeek}</p>
          <p className="text-sm text-gray-500">{phaseName}</p>

          {planningWeek > currentWeek && (
            <span className="mt-2 inline-block text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
              Planning ahead
            </span>
          )}

          <Link
            href="/settings"
            className="mt-3 block text-xs text-blue-500"
          >
            Change week in Settings →
          </Link>
        </div>
      </Card>

      {!generated && (
        <>
          <div className="sticky top-0 z-20 mt-4 rounded-xl border border-amber-200 bg-amber-50/95 px-3 py-2 shadow-sm backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900">
              <span aria-hidden="true">⚠</span>
              <span>Planner Health</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm text-slate-800">
              {healthMetrics.map(({ label, current, required }) => {
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

          <div className="mt-4">
            <Card title="Weekly Planner">
              <div className="space-y-3">
                {plannerDays.map((day) => {
                  const activeType = (
                    ["vault", "strength", "speed"] as const
                  ).find((type) => weekPlanner[day]?.[type]);

                  return (
                    <div
                      key={day}
                      className={`border rounded-xl p-3 ${
                        activeType
                          ? trainingTypeStyles[activeType].card
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <p className="font-semibold mb-2 text-slate-800">{day}</p>

                      <div className="flex gap-2 flex-wrap">
                        {(["vault", "strength", "speed"] as const).map(
                          (type) => (
                            <button
                              key={type}
                              onClick={() => togglePlanner(day, type)}
                              className={`px-3 py-1 rounded-lg border capitalize ${
                                weekPlanner[day]?.[type]
                                  ? trainingTypeStyles[type].selected
                                  : trainingTypeStyles[type].button
                              }`}
                            >
                              {type}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {plannerComplete && (
            <div className="mt-4">
              <button
                onClick={() => generateWeekSchedule(planningWeek)}
                className="w-full bg-purple-600 text-white rounded-xl p-4 font-bold"
              >
                Generate Schedule
              </button>

              <button
                type="button"
                onClick={() => resetWeekPlanner(planningWeek)}
                className="mt-2 w-full border border-gray-300 text-gray-700 rounded-xl p-2 text-sm"
              >
                Reset
              </button>
            </div>
          )}
        </>
      )}

      {generated && (
        <div className="mt-4">
          <Card title="Generated Schedule">
            {plannerDays.map((day) => {
              const dailyPlan = generatedSchedule[day];

              if (!dailyPlan || dailyPlan.sessions.length === 0) return null;

              const dailyLoad = dailyPlan.load;
              const loadLabel = dailyPlan.level;

              return (
                <div
                  key={day}
                  className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-800">{day}</p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${trafficStyles[loadLabel]}`}
                    >
                      {getTrafficLightSymbol(loadLabel)} {loadLabel}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {dailyPlan.sessions.map((session) => {
                      const completionKey = workoutCompletionKey(
                        planningWeek,
                        day,
                        session.id
                      );
                      const isComplete = Boolean(
                        completedWorkouts[completionKey]
                      );
                      const isExpanded =
                        expandedWorkouts[`${day}-${session.id}`];
                      const workout = getCatalogWorkout(session.id);

                      return (
                        <div key={session.id}>
                          <button
                            onClick={() =>
                              setExpandedWorkouts((prev) => ({
                                ...prev,
                                [`${day}-${session.id}`]: !isExpanded,
                              }))
                            }
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
                                <span className="font-semibold">
                                  {session.load}
                                </span>
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
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirmingKey === completionKey) {
                                  completeWorkout({
                                    weekNumber: planningWeek,
                                    day,
                                    sessionId: session.id,
                                    sessionName: session.name,
                                    sessionType: session.type,
                                  });
                                  setConfirmingKey(null);
                                } else {
                                  setConfirmingKey(completionKey);
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
                          )}

                          {isExpanded && workout && (
                            <div className="mt-1 rounded-lg border border-slate-200 bg-white p-3 text-xs space-y-2">
                              {workout && "primaryLift" in workout && (
                                <>
                                  {(() => {
                                    const phase = getPhaseConfig(planningWeek);
                                    const phaseNameLower =
                                      phase.name.toLowerCase() as
                                        | "rebuild"
                                        | "build"
                                        | "specific";
                                    const prescriptions =
                                      workout.phaseModifications[phaseNameLower];

                                    return (
                                      <>
                                        <div className="mb-2 inline-block rounded-full bg-sky-100 px-2 py-1 font-semibold text-sky-800">
                                          {phase.name.toUpperCase()}
                                        </div>

                                        <div className="space-y-1 pt-2">
                                          <div>
                                            <span className="font-semibold text-sky-700">
                                              Primary
                                            </span>
                                            <div className="text-slate-700">
                                              {workout.primaryLift} —{" "}
                                              {prescriptions.primary}
                                            </div>
                                          </div>
                                          <div>
                                            <span className="font-semibold text-sky-700">
                                              Secondary
                                            </span>
                                            <div className="text-slate-700">
                                              {workout.secondaryLift} —{" "}
                                              {prescriptions.secondary}
                                            </div>
                                          </div>

                                          <div className="pt-1">
                                            <span className="font-semibold text-sky-700">
                                              Superset A
                                            </span>
                                            <div className="space-y-1 text-slate-700">
                                              {workout.supersetA.map(
                                                (exercise, i) => (
                                                  <div key={i}>
                                                    {exercise} —{" "}
                                                    {prescriptions.supersetA[i]}
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          </div>

                                          <div className="pt-1">
                                            <span className="font-semibold text-sky-700">
                                              Superset B
                                            </span>
                                            <div className="space-y-1 text-slate-700">
                                              {workout.supersetB.map(
                                                (exercise, i) => (
                                                  <div key={i}>
                                                    {exercise} —{" "}
                                                    {prescriptions.supersetB[i]}
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          </div>

                                          <div className="pt-1">
                                            <span className="font-semibold text-sky-700">
                                              Finisher
                                            </span>
                                            <div className="text-slate-700">
                                              {workout.finisher} —{" "}
                                              {prescriptions.finisher}
                                            </div>
                                          </div>
                                        </div>
                                      </>
                                    );
                                  })()}
                                </>
                              )}
                              {workout && "workout" in workout && (
                                <>
                                  <div>
                                    <span className="font-semibold">
                                      Category:
                                    </span>{" "}
                                    {workout.category}
                                  </div>
                                  <div>
                                    <span className="font-semibold">
                                      Workout:
                                    </span>
                                    <ul className="list-inside list-disc mt-1">
                                      {workout.workout.map((w, i) => (
                                        <li key={i}>{w}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <span className="font-semibold">Rest:</span>{" "}
                                    {workout.rest}
                                  </div>
                                  <div>
                                    <span className="font-semibold">
                                      Purpose:
                                    </span>{" "}
                                    {workout.purpose}
                                  </div>
                                </>
                              )}
                              {workout && "runLength" in workout && (
                                <>
                                  <div>
                                    <span className="font-semibold">
                                      Run Length:
                                    </span>{" "}
                                    {workout.runLength}
                                  </div>
                                  <div>
                                    <span className="font-semibold">
                                      Jump Volume:
                                    </span>{" "}
                                    {workout.jumpVolume}
                                  </div>
                                  <div>
                                    <span className="font-semibold">
                                      Description:
                                    </span>{" "}
                                    {workout.description}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-700">
                    <span>Daily load: {dailyLoad}</span>
                    <span>{getDailyRecommendation(loadLabel)}</span>
                  </div>
                </div>
              );
            })}
          </Card>

          <button
            type="button"
            onClick={() => resetWeekPlanner(planningWeek)}
            className="mt-3 w-full border border-gray-300 text-gray-700 rounded-xl p-2 text-sm"
          >
            Reset
          </button>
        </div>
      )}
    </main>
  );
}
