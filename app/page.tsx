"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import { program } from "@/lib/data";
import { programData } from "@/lib/programData";
import { mealPlans } from "@/lib/mealPlans";
import {
  plannerDays,
  generateScheduleForWeek,
  getTrafficLightSymbol,
  type TrafficLightLevel,
} from "@/lib/trainingProgram";

type LogEntry = {
  date: string;
  bodyWeight: string;
  sleepHours: string;
  readiness: string;
  rpe: string;
  vaultPR: string;
  sprintDone: boolean;
  liftDone: boolean;
  vaultDone: boolean;
  notes: string;
};

type WeightEntry = {
  weight: number;
  date: string;
};

function metersToFeetInches(
  meters: number
) {
  const totalInches =
    meters * 39.3701;

  const feet = Math.floor(
    totalInches / 12
  );

  const inches =
    totalInches - feet * 12;

  return `${feet}'${inches.toFixed(
    1
  )}"`;
}

export default function Home() {
  const [logs, setLogs] = useState<
    LogEntry[]
  >([]);

  const [currentWeek, setCurrentWeek] =
    useState(1);

  const [plannerByWeek, setPlannerByWeek] =
    useState<
      Record<
        number,
        Record<string, { vault: boolean; strength: boolean; speed: boolean }>
      >
    >({});

  const [generatedSchedules, setGeneratedSchedules] =
    useState<Record<number, boolean>>({});

  const [
    completedWorkouts,
    setCompletedWorkouts,
  ] = useState<
    Record<string, boolean>
  >({});

  const [weightHistory, setWeightHistory] =
    useState<WeightEntry[]>([]);

  const [showWeightEditor, setShowWeightEditor] =
    useState(false);

  const [newWeight, setNewWeight] =
    useState("");

  useEffect(() => {
    const savedLogs =
      localStorage.getItem("logs");

    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }

    const savedWeek =
      localStorage.getItem(
        "currentWeek"
      );

    if (savedWeek) {
      setCurrentWeek(
        Number(savedWeek)
      );
    }

    const savedCompleted =
      localStorage.getItem(
        "completedWorkouts"
      );

    if (savedCompleted) {
      setCompletedWorkouts(
        JSON.parse(savedCompleted)
      );
    }

    const savedPlanner =
      localStorage.getItem(
        "weeklyPlannerByWeek"
      );

    if (savedPlanner) {
      const parsedPlanner =
        JSON.parse(savedPlanner);
      setPlannerByWeek(parsedPlanner);
    }

    const savedGenerated =
      localStorage.getItem(
        "generatedSchedules"
      );

    if (savedGenerated) {
      setGeneratedSchedules(
        JSON.parse(savedGenerated)
      );
    }

    const savedWeights =
      localStorage.getItem(
        "weightHistory"
      );

    if (savedWeights) {
      setWeightHistory(
        JSON.parse(savedWeights)
      );
    }
  }, []);

  function saveWeight() {
    const parsed =
      parseFloat(newWeight);

    if (isNaN(parsed)) return;

    const updated = [
      ...weightHistory,
      {
        weight: parsed,
        date:
          new Date().toISOString(),
      },
    ];

    setWeightHistory(updated);

    localStorage.setItem(
      "weightHistory",
      JSON.stringify(updated)
    );

    setNewWeight("");
    setShowWeightEditor(false);
  }

  const latestLog =
    logs.length > 0 ? logs[0] : null;

  const START_PR = 3.96;
  const GOAL_PR = 4.57;

  const highestLoggedPR =
    logs.reduce((max, log) => {
      const value =
        parseFloat(log.vaultPR || "");
      return Number.isFinite(value)
        ? Math.max(max, value)
        : max;
    }, START_PR);

  const currentPR = highestLoggedPR;

  const latestWeightEntry =
    weightHistory.length > 0
      ? weightHistory[
          weightHistory.length - 1
        ]
      : null;

  const currentWeight =
    latestWeightEntry
      ? latestWeightEntry.weight.toFixed(
          1
        )
      : "--";

  const thirtyDaysAgo =
    Date.now() -
    30 *
      24 *
      60 *
      60 *
      1000;

  const comparisonWeight =
    weightHistory.find(
      (entry) =>
        new Date(
          entry.date
        ).getTime() >=
        thirtyDaysAgo
    );

  const monthlyChange =
    latestWeightEntry &&
    comparisonWeight
      ? latestWeightEntry.weight -
        comparisonWeight.weight
      : null;

  const previousWeightEntry =
    weightHistory.length > 1
      ? weightHistory[
          weightHistory.length - 2
        ]
      : null;

  const dailyChange =
    latestWeightEntry &&
    previousWeightEntry
      ? latestWeightEntry.weight -
        previousWeightEntry.weight
      : null;

  const previousDate =
    previousWeightEntry
      ? new Date(
          previousWeightEntry.date
        ).toLocaleDateString()
      : null;

  const progressPercent =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(
          ((currentPR - START_PR) /
            (GOAL_PR -
              START_PR)) *
            100
        )
      )
    );

  const currentPhase =
    program.phases.find(
      (phase) =>
        currentWeek >=
          phase.startWeek &&
        currentWeek <=
          phase.endWeek
    )?.name || "Unknown";

  const todayIndex =
    (new Date().getDay() + 6) % 7;
  const todayName = plannerDays[todayIndex];
  const currentWeekPlanner =
    plannerByWeek[currentWeek] || {};
  const currentWeekSchedule =
    generatedSchedules[currentWeek] &&
    Object.keys(currentWeekPlanner).length > 0
      ? generateScheduleForWeek(
          currentWeekPlanner,
          currentWeek
        )
      : null;
  const todayWorkoutPlan =
    currentWeekSchedule?.[todayName];

  const trafficStyles: Record<
    TrafficLightLevel,
    string
  > = {
    Green:
      "border-emerald-200 bg-emerald-50 text-emerald-900",
    Yellow:
      "border-yellow-200 bg-yellow-50 text-yellow-900",
    Orange:
      "border-orange-200 bg-orange-50 text-orange-900",
    Red: "border-red-200 bg-red-50 text-red-900",
    Black:
      "border-slate-300 bg-slate-800 text-white",
  };

  const phaseColor =
    currentPhase === "Rebuild"
      ? "bg-green-100 text-green-700"
      : currentPhase === "Build"
      ? "bg-blue-100 text-blue-700"
      : "bg-purple-100 text-purple-700";

  const programPercent =
    Math.round(
      (currentWeek /
        program.totalWeeks) *
        100
    );

  const planKey =
    currentWeek % 3 === 1
      ? "A"
      : currentWeek % 3 === 2
      ? "B"
      : "C";

  const plan =
    mealPlans[
      planKey as keyof typeof mealPlans
    ];

  const currentWeekData =
    programData[
      currentWeek as keyof typeof programData
    ];

  let nextWorkoutDay =
    "Complete!";

  let nextWorkoutSummary =
    "All workouts finished";

  if (currentWeekData) {
    for (const [
      day,
      rawData,
    ] of Object.entries(
      currentWeekData.days
    )) {
      const workoutKey =
        `${currentWeek}-${day}`;

      if (
        !completedWorkouts[
          workoutKey
        ]
      ) {
        const data: any =
          rawData;

        const parts = [];

        if (data.sprint) {
          parts.push("Sprint");
        }

        if (data.vault) {
          parts.push("Vault");
        }

        if (
          data.lifts?.length
        ) {
          parts.push(
            `${data.lifts.length} Lifts`
          );
        }

        nextWorkoutDay =
          day.replace(
            "day",
            "Day "
          );

        nextWorkoutSummary =
          parts.join(" • ");

        break;
      }
    }
  }

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold">
            Road to 15'0"
          </h1>

          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-500">
              Week {currentWeek}
            </p>

            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${phaseColor}`}
            >
              {currentPhase}
            </span>
          </div>
        </div>

        <Link
          href="/settings"
          className="text-2xl"
        >
          ⚙️
        </Link>
      </div>

      <div className="mb-4">
        <Card>
          <div className="flex justify-between mb-2">
            <span className="font-medium">
              Year Goal
            </span>

            <span className="font-bold">
              {progressPercent}%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full"
              style={{
                width: `${progressPercent}%`,
              }}
            />
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Current PR:{" "}
            {currentPR.toFixed(2)}m (
            {metersToFeetInches(
              currentPR
            )}
            )
          </p>

          <p className="text-sm text-gray-500">
            Goal PR: 4.57m (15'0")
          </p>
        </Card>
      </div>

      <div className="mb-4">
        <Card title="Program Progress">
          <p>
            Current Week:{" "}
            {currentWeek} /{" "}
            {program.totalWeeks}
          </p>

          <p>
            Phase:{" "}
            {currentPhase}
          </p>

          <p>
            Program Completion:{" "}
            {programPercent}%
          </p>
        </Card>
      </div>

      <div className="mb-4">
        <Card title="Current Meal Plan">
          <p className="text-sm text-gray-500 mb-3">
            Plan {planKey}
          </p>

          <div className="space-y-3">
            <div>
              <p className="font-medium">
                Breakfast
              </p>

              <p className="text-sm text-gray-500">
                {plan.breakfast}
              </p>
            </div>

            <div>
              <p className="font-medium">
                Lunch
              </p>

              <p className="text-sm text-gray-500">
                {plan.lunch}
              </p>
            </div>

            <div>
              <p className="font-medium">
                Dinner
              </p>

              <p className="text-sm text-gray-500">
                {plan.dinner}
              </p>
            </div>

            <div>
              <p className="font-medium">
                Snack
              </p>

              <p className="text-sm text-gray-500">
                {plan.snack}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/program">
          <Card className="cursor-pointer hover:shadow-md transition h-full">
            <p className="text-sm text-gray-500">
              Today&apos;s Training
            </p>

            {currentWeekSchedule && todayWorkoutPlan && todayWorkoutPlan.sessions.length > 0 ? (
              <>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="font-bold text-base leading-tight">
                    {todayName}
                  </p>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${trafficStyles[todayWorkoutPlan.level]}`}
                  >
                    {getTrafficLightSymbol(todayWorkoutPlan.level)} {todayWorkoutPlan.level}
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
            ) : currentWeekSchedule && todayWorkoutPlan && todayWorkoutPlan.sessions.length === 0 ? (
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

            <p className="text-xs text-blue-500 mt-3">
              Tap to open →
            </p>
          </Card>
        </Link>

        <Card>
          <p className="text-sm text-gray-500">
            Body Weight
          </p>

          <p className="text-3xl font-bold">
            {currentWeight}
            {currentWeight !== "--"
              ? " lbs"
              : ""}
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
                {dailyChange > 0
                  ? "+"
                  : ""}
                {dailyChange.toFixed(1)}
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
                {monthlyChange > 0
                  ? "+"
                  : ""}
                {monthlyChange.toFixed(1)}
                lbs (30d)
              </p>
            )}

          </div>

          <button
            onClick={() =>
              setShowWeightEditor(
                !showWeightEditor
              )
            }
            className="mt-3 w-full bg-blue-500 text-white rounded-xl py-2 text-sm font-medium"
          >
            Update Weight
          </button>

          {showWeightEditor && (
            <div className="mt-3 space-y-2">
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) =>
                  setNewWeight(
                    e.target.value
                  )
                }
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