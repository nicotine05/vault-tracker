"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import { useAuth } from "@/components/AuthProvider";
import { program } from "@/lib/data";
import { mealPlans } from "@/lib/mealPlans";
import { getMealPlanKeyForWeek, getPhaseNameForWeek } from "@/lib/domain/programWeek";
import { getTodayWorkoutPlan } from "@/lib/domain/todayTraining";
import {
  computeWeightStats,
  formatWeightDelta,
} from "@/lib/domain/weightStats";
import type { WeightEntry } from "@/lib/domain/types";
import { useProgramState } from "@/lib/hooks/useProgramState";
import { getTrafficLightSymbol } from "@/lib/trainingProgram";
import { getPhaseBadgeClass } from "@/lib/ui/phaseStyles";
import { trafficStyles } from "@/lib/ui/trainingStyles";
import {
  appendWeightEntry,
  loadWeightHistory,
  subscribeWeightHistory,
} from "@/lib/storage/weightStore";

export default function Home() {
  const { isCoachReadOnly } = useAuth();
  const { currentWeek, scheduleSnapshotsByWeek } = useProgramState();

  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [showWeightEditor, setShowWeightEditor] = useState(false);
  const [newWeight, setNewWeight] = useState("");

  useEffect(() => {
    setWeightHistory(loadWeightHistory());

    const syncWeights = () => setWeightHistory(loadWeightHistory());
    const unsubWeights = subscribeWeightHistory(syncWeights);

    return () => {
      unsubWeights();
    };
  }, []);

  function saveWeight() {
    const parsed = parseFloat(newWeight);
    if (isNaN(parsed)) return;

    setWeightHistory(appendWeightEntry(parsed));
    setNewWeight("");
    setShowWeightEditor(false);
  }

  const { currentWeight, dailyChange, monthlyChange, previousDate } =
    computeWeightStats(weightHistory);

  const currentPhase = getPhaseNameForWeek(currentWeek);
  const { todayName, snapshot, dailyPlan: todayWorkoutPlan } =
    getTodayWorkoutPlan(scheduleSnapshotsByWeek, currentWeek);

  const planKey = getMealPlanKeyForWeek(currentWeek);
  const plan = mealPlans[planKey];

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold">Road to 15ft</h1>

          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-500">
              Week {currentWeek}/{program.totalWeeks}
            </p>

            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${getPhaseBadgeClass(currentPhase)}`}
            >
              {currentPhase}
            </span>
          </div>
        </div>

        <Link href="/settings" className="text-2xl">
          ⚙️
        </Link>
      </div>

      <div className="mb-4">
        <Card title="Current Meal Plan">
          <p className="text-sm text-gray-500 mb-3">Plan {planKey}</p>

          <div className="space-y-3">
            <div>
              <p className="font-medium">Breakfast</p>
              <p className="text-sm text-gray-500">{plan.breakfast}</p>
            </div>

            <div>
              <p className="font-medium">Lunch</p>
              <p className="text-sm text-gray-500">{plan.lunch}</p>
            </div>

            <div>
              <p className="font-medium">Dinner</p>
              <p className="text-sm text-gray-500">{plan.dinner}</p>
            </div>

            <div>
              <p className="font-medium">Snack</p>
              <p className="text-sm text-gray-500">{plan.snack}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/program">
          <Card className="cursor-pointer hover:shadow-md transition h-full">
            <p className="text-sm text-gray-500">Today&apos;s Training</p>

            {snapshot && todayWorkoutPlan && todayWorkoutPlan.sessions.length > 0 ? (
              <>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="font-bold text-base leading-tight">{todayName}</p>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${trafficStyles[todayWorkoutPlan.level]}`}
                  >
                    {getTrafficLightSymbol(todayWorkoutPlan.level)}{" "}
                    {todayWorkoutPlan.level}
                  </span>
                </div>

                <p className="mt-2 text-xs text-gray-600">
                  {todayWorkoutPlan.sessions
                    .slice(0, 2)
                    .map((session) => session.name)
                    .join(" • ")}
                  {todayWorkoutPlan.sessions.length > 2 ? " • + more" : ""}
                </p>
              </>
            ) : snapshot && todayWorkoutPlan && todayWorkoutPlan.sessions.length === 0 ? (
              <>
                <p className="mt-2 font-bold text-base text-slate-800">
                  Recovery Day.
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  No training scheduled.
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 font-bold text-base text-slate-800">
                  Complete your weekly planner.
                </p>
              </>
            )}

            <p className="text-xs text-blue-500 mt-3">Tap to open →</p>
          </Card>
        </Link>

        <Card>
          <p className="text-sm text-gray-500">Body Weight</p>

          <p className="text-3xl font-bold">
            {currentWeight}
            {currentWeight !== "--" ? " lbs" : ""}
          </p>

          <div className="mt-1 space-y-1">
            {dailyChange !== null && (
              <p
                className={`text-sm font-medium ${
                  dailyChange > 0
                    ? "text-green-600"
                    : dailyChange < 0
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
              >
                {formatWeightDelta(dailyChange)}
                lbs since {previousDate}
              </p>
            )}

            {monthlyChange !== null && (
              <p
                className={`text-sm font-medium ${
                  monthlyChange > 0
                    ? "text-green-600"
                    : monthlyChange < 0
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
              >
                {formatWeightDelta(monthlyChange)}
                lbs (30d)
              </p>
            )}
          </div>

          {!isCoachReadOnly && (
            <button
              onClick={() => setShowWeightEditor(!showWeightEditor)}
              className="mt-3 w-full bg-blue-500 text-white rounded-xl py-2 text-sm font-medium"
            >
              Update Weight
            </button>
          )}

          {showWeightEditor && !isCoachReadOnly && (
            <div className="mt-3 space-y-2">
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="182.4"
                className="w-full border rounded-xl p-2"
              />

              <button
                onClick={saveWeight}
                className="w-full bg-green-500 text-white rounded-xl py-2"
              >
                Save
              </button>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
