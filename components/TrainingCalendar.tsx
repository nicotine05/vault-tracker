"use client";

import { useEffect, useState } from "react";

type DayPlan = {
  vault: boolean;
  strength: boolean;
  speed: boolean;
};

type WeekPlan = {
  Monday: DayPlan;
  Tuesday: DayPlan;
  Wednesday: DayPlan;
  Thursday: DayPlan;
  Friday: DayPlan;
  Saturday: DayPlan;
  Sunday: DayPlan;
};

const defaultPlan: WeekPlan = {
  Monday: {
    vault: false,
    strength: false,
    speed: false,
  },
  Tuesday: {
    vault: false,
    strength: false,
    speed: false,
  },
  Wednesday: {
    vault: false,
    strength: false,
    speed: false,
  },
  Thursday: {
    vault: false,
    strength: false,
    speed: false,
  },
  Friday: {
    vault: false,
    strength: false,
    speed: false,
  },
  Saturday: {
    vault: false,
    strength: false,
    speed: false,
  },
  Sunday: {
    vault: false,
    strength: false,
    speed: false,
  },
};

type Props = {
  trainingHistory: string[];
};

export default function TrainingCalendar({
  trainingHistory,
}: Props) {
  const [weekPlan, setWeekPlan] =
    useState<WeekPlan>(defaultPlan);

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "weeklyTrainingPlan"
      );

    if (saved) {
      try {
        setWeekPlan(
          JSON.parse(saved)
        );
      } catch {
        console.error(
          "Failed to load weekly plan"
        );
      }
    }
  }, []);

  function toggleWorkout(
    day: keyof WeekPlan,
    type: keyof DayPlan
  ) {
    const updated = {
      ...weekPlan,
      [day]: {
        ...weekPlan[day],
        [type]:
          !weekPlan[day][type],
      },
    };

    setWeekPlan(updated);

    localStorage.setItem(
      "weeklyTrainingPlan",
      JSON.stringify(updated)
    );
  }

  const vaultCount =
    Object.values(weekPlan).filter(
      (day) => day.vault
    ).length;

  const strengthCount =
    Object.values(weekPlan).filter(
      (day) => day.strength
    ).length;

  const speedCount =
    Object.values(weekPlan).filter(
      (day) => day.speed
    ).length;

  const days = Object.keys(
    weekPlan
  ) as (keyof WeekPlan)[];

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Weekly Planner
        </h2>

        <button
          onClick={() => {
            setWeekPlan(defaultPlan);

            localStorage.setItem(
              "weeklyTrainingPlan",
              JSON.stringify(
                defaultPlan
              )
            );
          }}
          className="text-sm px-3 py-1 border rounded-lg text-red-500"
        >
          Reset
        </button>
      </div>

      {days.map((day) => (
        <div
          key={day}
          className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
        >
          <h3 className="font-bold text-lg mb-3">
            {day}
          </h3>

          <div className="grid grid-cols-3 gap-2">

            <button
              onClick={() =>
                toggleWorkout(
                  day,
                  "vault"
                )
              }
              className={`rounded-xl py-2 text-sm font-medium ${
                weekPlan[day].vault
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              Vault
            </button>

            <button
              onClick={() =>
                toggleWorkout(
                  day,
                  "strength"
                )
              }
              className={`rounded-xl py-2 text-sm font-medium ${
                weekPlan[day]
                  .strength
                  ? "bg-green-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              Strength
            </button>

            <button
              onClick={() =>
                toggleWorkout(
                  day,
                  "speed"
                )
              }
              className={`rounded-xl py-2 text-sm font-medium ${
                weekPlan[day].speed
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              Speed
            </button>

          </div>
        </div>
      ))}

      <div className="bg-violet-50 border border-violet-300 rounded-2xl p-4">
        <h3 className="font-bold text-lg mb-3">
          Week Health
        </h3>

        <div className="space-y-2">

          <div className="flex justify-between">
            <span>Vault</span>

            <span>
              {vaultCount}/2{" "}
              {vaultCount >= 2
                ? "🟢"
                : "🟡"}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Strength</span>

            <span>
              {strengthCount}/3{" "}
              {strengthCount >= 3
                ? "🟢"
                : "🟡"}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Speed</span>

            <span>
              {speedCount}/2{" "}
              {speedCount >= 2
                ? "🟢"
                : "🟡"}
            </span>
          </div>

        </div>

        <div className="mt-4 text-sm text-gray-600">
          Recommended Weekly Targets:
          <ul className="list-disc ml-5 mt-1">
            <li>
              Vault: 1–2 sessions
            </li>
            <li>
              Strength: 2–3 sessions
            </li>
            <li>
              Speed: 1–2 sessions
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
}