"use client";

import {
  useState,
  useEffect,
} from "react";
import Card from "@/components/Card";
import { programData } from "@/lib/programData";

type PlannerDay = {
  vault: boolean;
  strength: boolean;
  speed: boolean;
};

const plannerDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export default function ProgramPage() {
  const [selectedWeek, setSelectedWeek] =
    useState(1);

  const [unlockedWeek, setUnlockedWeek] =
    useState(1);

  const [currentWeek, setCurrentWeek] =
    useState(1);

  const [checkedItems, setCheckedItems] =
    useState<Record<string, boolean>>(
      {}
    );

  const [
    completedWorkouts,
    setCompletedWorkouts,
  ] = useState<
    Record<string, boolean>
  >({});

  const [planner, setPlanner] =
    useState<
      Record<
        number,
        Record<string, PlannerDay>
      >
    >({});

  const [loaded, setLoaded] =
    useState(false);

  useEffect(() => {
    const savedCurrentWeek =
      localStorage.getItem(
        "currentWeek"
      );

    const savedSelectedWeek =
      localStorage.getItem(
        "selectedWeek"
      );

    const current =
      Number(savedCurrentWeek || "1");

    const selected =
      Number(
        savedSelectedWeek ||
          savedCurrentWeek ||
          "1"
      );

    setCurrentWeek(current);
    setUnlockedWeek(current);
    setSelectedWeek(selected);

    const savedChecks =
      localStorage.getItem(
        "programChecks"
      );

    if (savedChecks) {
      setCheckedItems(
        JSON.parse(savedChecks)
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
      setPlanner(
        JSON.parse(savedPlanner)
      );
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "selectedWeek",
      selectedWeek.toString()
    );
  }, [selectedWeek, loaded]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "programChecks",
      JSON.stringify(
        checkedItems
      )
    );
  }, [checkedItems, loaded]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "completedWorkouts",
      JSON.stringify(
        completedWorkouts
      )
    );
  }, [
    completedWorkouts,
    loaded,
  ]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "weeklyPlannerByWeek",
      JSON.stringify(planner)
    );
  }, [planner, loaded]);

  const toggleCheck = (
    key: string
  ) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const completeWorkout = (
    workoutKey: string
  ) => {
    setCompletedWorkouts(
      (prev) => ({
        ...prev,
        [workoutKey]: true,
      })
    );
  };

  const resetWorkout = (
    workoutKey: string,
    itemKeys: string[]
  ) => {
    if (
      !confirm(
        "Reset this workout and uncheck everything?"
      )
    ) {
      return;
    }

    setCompletedWorkouts((prev) => {
      const updated = {
        ...prev,
      };

      delete updated[workoutKey];

      return updated;
    });

    setCheckedItems((prev) => {
      const updated = {
        ...prev,
      };

      itemKeys.forEach((key) => {
        delete updated[key];
      });

      return updated;
    });
  };

  const completeWeek = () => {
    if (
      !confirm(
        "Completing this week will advance your training week AND your meal plan. Continue?"
      )
    ) {
      return;
    }

    const nextWeek =
      Math.min(
        12,
        selectedWeek + 1
      );

    setUnlockedWeek(nextWeek);
    setCurrentWeek(nextWeek);
    setSelectedWeek(nextWeek);

    localStorage.setItem(
      "currentWeek",
      nextWeek.toString()
    );
  };

  const week =
    programData[
      selectedWeek as keyof typeof programData
    ];

  const weekPlanner =
    planner[selectedWeek] || {};

  const targets = {
    vault: Object.values(
      week.days
    ).filter((d: any) => d.vault)
      .length,
    strength: Object.values(
      week.days
    ).filter(
      (d: any) => d.lifts?.length
    ).length,
    speed: Object.values(
      week.days
    ).filter((d: any) => d.sprint)
      .length,
  };

  const counts = {
    vault: plannerDays.filter(
      (d) =>
        weekPlanner[d]?.vault
    ).length,
    strength:
      plannerDays.filter(
        (d) =>
          weekPlanner[d]
            ?.strength
      ).length,
    speed: plannerDays.filter(
      (d) =>
        weekPlanner[d]?.speed
    ).length,
  };

  const togglePlanner = (
    day: string,
    type:
      | "vault"
      | "strength"
      | "speed"
  ) => {
    setPlanner((prev) => ({
      ...prev,
      [selectedWeek]: {
        ...prev[selectedWeek],
        [day]: {
          vault:
            prev[selectedWeek]?.[day]
              ?.vault || false,
          strength:
            prev[selectedWeek]?.[day]
              ?.strength || false,
          speed:
            prev[selectedWeek]?.[day]
              ?.speed || false,
          [type]:
            !prev[selectedWeek]?.[day]
              ?.[type],
        },
      },
    }));
  };

  const plannerComplete =
    counts.vault ===
      targets.vault &&
    counts.strength ===
      targets.strength &&
    counts.speed === targets.speed;

  const warnings: string[] =
    [];

  if (
    counts.vault < targets.vault
  )
    warnings.push(
      "Missing Required Vault Session"
    );
  if (
    counts.strength <
    targets.strength
  )
    warnings.push(
      "Missing Required Strength Session"
    );
  if (
    counts.speed < targets.speed
  )
    warnings.push(
      "Missing Required Speed Session"
    );

  const weekWorkoutKeys =
    Object.keys(
      week?.days || {}
    ).map(
      (dayName) =>
        `${selectedWeek}-${dayName}`
    );

  const weekComplete =
    weekWorkoutKeys.length > 0 &&
    weekWorkoutKeys.every(
      (key) =>
        completedWorkouts[key]
    );

  const isLockedWeek =
    selectedWeek > currentWeek;

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold mb-4">
        Program
      </h1>

      <Card>
        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              setSelectedWeek((prev) =>
                Math.max(
                  1,
                  prev - 1
                )
              )
            }
            className="px-3 py-1 border rounded-lg"
          >
            ←
          </button>

          <div className="text-center">
            <p className="font-bold">
              Week {selectedWeek}
            </p>

            <p className="text-sm text-gray-500">
              {week?.phase}
            </p>

            {selectedWeek >
              currentWeek && (
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                EXAMPLE WEEK
              </span>
            )}
          </div>

          <button
            onClick={() =>
              setSelectedWeek((prev) =>
                Math.min(
                  12,
                  prev + 1
                )
              )
            }
            className="px-3 py-1 border rounded-lg"
          >
            →
          </button>
        </div>
      </Card>

      <div className="mt-4">
        <Card title="Weekly Planner">
          <div className="space-y-3">
            {plannerDays.map(
              (day) => (
                <div
                  key={day}
                  className="border rounded-xl p-3"
                >
                  <p className="font-semibold mb-2">
                    {day}
                  </p>

                  <div className="flex gap-2 flex-wrap">
                    {(
                      [
                        "vault",
                        "strength",
                        "speed",
                      ] as const
                    ).map(
                      (type) => (
                        <button
                          key={type}
                          onClick={() =>
                            togglePlanner(
                              day,
                              type
                            )
                          }
                          className={`px-3 py-1 rounded-lg border ${
                            weekPlanner[
                              day
                            ]?.[type]
                              ? "bg-purple-600 text-white"
                              : ""
                          }`}
                        >
                          {type}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card title="Planner Health">
          <p>
            Vault {counts.vault}/
            {targets.vault}
          </p>
          <p>
            Strength{" "}
            {counts.strength}/
            {targets.strength}
          </p>
          <p>
            Speed {counts.speed}/
            {targets.speed}
          </p>
        </Card>
      </div>

      {warnings.length > 0 && (
        <div className="mt-4">
          <Card title="Warnings">
            {warnings.map((w) => (
              <p key={w}>
                ⚠ {w}
              </p>
            ))}
          </Card>
        </div>
      )}

      <div className="mt-4">
        <Card title="Generated Schedule">
          {!plannerComplete ? (
            <p>
              Complete planner to
              generate schedule.
            </p>
          ) : (
            plannerDays.map((day) => {
              const d =
                weekPlanner[day];

              if (!d) return null;

              return (
                <div
                  key={day}
                  className="mb-2"
                >
                  <p className="font-semibold">
                    {day}
                  </p>
                  {d.vault && (
                    <p>
                      Vault Session
                    </p>
                  )}
                  {d.strength && (
                    <p>
                      Strength
                      Session
                    </p>
                  )}
                  {d.speed && (
                    <p>
                      Speed Session
                    </p>
                  )}
                </div>
              );
            })
          )}
        </Card>
      </div>
    </main>
  );
}
