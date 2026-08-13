"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import { program } from "@/lib/data";
import { programData } from "@/lib/programData";
import { mealPlans } from "@/lib/mealPlans";

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

  const [
    completedWorkouts,
    setCompletedWorkouts,
  ] = useState<
    Record<string, boolean>
  >({});

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
  }, []);

  const latestLog =
    logs.length > 0 ? logs[0] : null;

  const START_PR = 3.96;
  const GOAL_PR = 4.57;

  const currentPR =
    parseFloat(
      latestLog?.vaultPR || ""
    ) || START_PR;

  const currentWeight =
    latestLog?.bodyWeight || "--";

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
              Next Workout
            </p>

            <p className="font-bold text-lg">
              {nextWorkoutDay}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {nextWorkoutSummary}
            </p>

            <p className="text-xs text-blue-500 mt-2">
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
          </p>
        </Card>
      </div>
    </main>
  );
}
