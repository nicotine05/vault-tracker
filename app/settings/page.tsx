"use client";

import { useState } from "react";
import AccountSettings from "@/components/AccountSettings";
import Card from "@/components/Card";
import { useAuth } from "@/components/AuthProvider";
import { program } from "@/lib/data";
import { getPhaseNameForWeek } from "@/lib/domain/programWeek";
import { useProgramState } from "@/lib/hooks/useProgramState";
import {
  MAX_PLAN_AHEAD_WEEKS,
  maxViewableWeek,
} from "@/lib/storage/programStore";

export default function SettingsPage() {
  const { isCoachReadOnly } = useAuth();
  const {
    currentWeek,
    planningWeek,
    advanceToNextWeek,
    planAhead,
    setPlanningWeek,
  } = useProgramState();

  const [viewingWeek, setViewingWeek] = useState(currentWeek);

  const viewingPhase = getPhaseNameForWeek(viewingWeek);
  const maxWeek = maxViewableWeek(currentWeek);
  const isActiveWeek = viewingWeek === currentWeek;
  const isFutureWeek = viewingWeek > currentWeek;
  const isProgramOnFutureWeek = planningWeek > currentWeek;
  const canPlanAhead =
    isFutureWeek && viewingWeek <= currentWeek + MAX_PLAN_AHEAD_WEEKS;
  const canFinishWeek =
    isActiveWeek && currentWeek < program.totalWeeks;
  const showReturnToActiveWeek =
    !isCoachReadOnly &&
    (!isActiveWeek || isProgramOnFutureWeek);

  function handlePreviousWeek() {
    setViewingWeek((prev) => Math.max(1, prev - 1));
  }

  function handleNextWeek() {
    setViewingWeek((prev) => Math.min(maxWeek, prev + 1));
  }

  function handlePlanAhead() {
    planAhead(viewingWeek);
  }

  function handleReturnToActiveWeek() {
    setViewingWeek(currentWeek);
    setPlanningWeek(currentWeek);
  }

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>

      <Card title="Program Week">
        {isCoachReadOnly ? (
          <p className="text-sm text-gray-500 mb-4">
            Athlete&apos;s active week is Week {currentWeek} ({viewingPhase}{" "}
            phase). Program changes can only be made by the athlete.
          </p>
        ) : (
          <p className="text-sm text-gray-500 mb-4">
            Your active week is Week {currentWeek}. Browse up to{" "}
            {MAX_PLAN_AHEAD_WEEKS} weeks ahead to plan workouts — they&apos;ll
            show on your calendar and Program tab.
          </p>
        )}

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
          <button
            type="button"
            onClick={handlePreviousWeek}
            disabled={viewingWeek <= 1}
            className="px-3 py-1 border rounded-lg disabled:opacity-40"
          >
            ←
          </button>

          <div className="text-center">
            <p className="text-2xl font-bold">Week {viewingWeek}</p>
            <p className="text-sm text-gray-500">{viewingPhase} phase</p>
            {isActiveWeek && (
              <span className="mt-1 inline-block text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                Active week
              </span>
            )}
            {isFutureWeek && (
              <span className="mt-1 inline-block text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Future week
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleNextWeek}
            disabled={viewingWeek >= maxWeek}
            className="px-3 py-1 border rounded-lg disabled:opacity-40"
          >
            →
          </button>
        </div>

        {canFinishWeek && !isCoachReadOnly && (
          <button
            type="button"
            onClick={advanceToNextWeek}
            className="mt-4 w-full rounded-xl bg-purple-600 p-3 font-semibold text-white"
          >
            Finish Week {currentWeek} → Start Week {currentWeek + 1}
          </button>
        )}

        {canPlanAhead && !isCoachReadOnly && (
          <button
            type="button"
            onClick={handlePlanAhead}
            className="mt-4 w-full rounded-xl bg-amber-500 p-3 font-semibold text-white"
          >
            Plan Ahead — Week {viewingWeek}
          </button>
        )}

        {showReturnToActiveWeek && (
          <button
            type="button"
            onClick={handleReturnToActiveWeek}
            className="mt-4 w-full rounded-xl border border-slate-300 p-3 text-sm font-medium text-slate-700"
          >
            Back to active week (Week {currentWeek})
          </button>
        )}

        {isProgramOnFutureWeek && isActiveWeek && !showReturnToActiveWeek && (
          <p className="mt-3 text-center text-xs text-amber-700">
            Program tab is showing planned Week {planningWeek}.
          </p>
        )}

        {currentWeek >= program.totalWeeks && isActiveWeek && (
          <p className="mt-4 text-center text-sm text-gray-500">
            You&apos;re on the final week of the program.
          </p>
        )}
      </Card>

      <div className="mt-4">
        <AccountSettings />
      </div>
    </main>
  );
}
