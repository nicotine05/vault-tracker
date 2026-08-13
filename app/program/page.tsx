"use client";

import {
  useState,
  useEffect,
} from "react";
import Card from "@/components/Card";
import { programData } from "@/lib/programData";

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

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "selectedWeek",
      selectedWeek.toString()
    );
  }, [selectedWeek]);

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

            <div className="mt-1 flex items-center justify-center gap-2">
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  week?.phase === "Rebuild"
                    ? "bg-yellow-100 text-yellow-800"
                    : week?.phase === "Build"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {week?.phase}
              </span>

              {isLockedWeek && (
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-200 text-gray-700">
                  🔒 Locked
                </span>
              )}
            </div>
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

      <div className="mt-4 space-y-4">
        {Object.entries(
          week?.days || {}
        ).map(([day, rawData]) => {
          const data: any = rawData;

          const itemKeys: string[] =
            [];

          if (data.sprint) {
            itemKeys.push(
              `${selectedWeek}-${day}-sprint`
            );
          }

          if (data.vault) {
            itemKeys.push(
              `${selectedWeek}-${day}-vault`
            );
          }

          if (data.lifts) {
            data.lifts.forEach(
              (lift: any) => {
                itemKeys.push(
                  `${selectedWeek}-${day}-${lift.name}`
                );
              }
            );
          }

          const allChecked =
            itemKeys.length > 0 &&
            itemKeys.every(
              (key) =>
                checkedItems[key]
            );

          const workoutKey =
            `${selectedWeek}-${day}`;

          const isCompleted =
            completedWorkouts[
              workoutKey
            ];

          return (
            <Card
              key={day}
              className={
                isCompleted
                  ? "opacity-60"
                  : ""
              }
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold capitalize">
                  {day}

                  {isCompleted && (
                    <span className="ml-2 text-green-600">
                      ✓ Complete
                    </span>
                  )}
                </h2>

               {!isCompleted &&
  !isLockedWeek && (
  <button
    onClick={() =>
      resetWorkout(
        workoutKey,
        itemKeys
      )
    }
    className="text-xs text-red-500 border border-red-300 px-2 py-1 rounded-lg"
  >
    Reset
  </button>
)}
              </div>

              {data.sprint && (
                <div className="mb-4 border rounded-xl p-3">
                  <div
                    onClick={() =>
                      !isCompleted &&
                      !isLockedWeek &&
                      toggleCheck(
                        `${selectedWeek}-${day}-sprint`
                      )
                    }
                    className="flex items-start gap-3 cursor-pointer"
                  >
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                        checkedItems[
                          `${selectedWeek}-${day}-sprint`
                        ]
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-400"
                      }`}
                    >
                      {checkedItems[
                        `${selectedWeek}-${day}-sprint`
                      ] && "✓"}
                    </div>

                    <div>
                      <p className="font-semibold">
                        Sprint
                      </p>

                      <p>
                        Distance:{" "}
                        {
                          data.sprint
                            .distance
                        }
                      </p>

                      <p>
                        Rest:{" "}
                        {
                          data.sprint
                            .rest
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {data.vault && (
                <div className="mb-4 border rounded-xl p-3">
                  <div
                    onClick={() =>
                      !isCompleted &&
                      !isLockedWeek &&
                      toggleCheck(
                        `${selectedWeek}-${day}-vault`
                      )
                    }
                    className="flex items-start gap-3 cursor-pointer"
                  >
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                        checkedItems[
                          `${selectedWeek}-${day}-vault`
                        ]
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-400"
                      }`}
                    >
                      {checkedItems[
                        `${selectedWeek}-${day}-vault`
                      ] && "✓"}
                    </div>

                    <div>
                      <p className="font-semibold">
                        Vault
                      </p>

                      <p>
                        Jumps:{" "}
                        {
                          data.vault
                            .jumpVolume
                        }
                      </p>

                      <p>
                        Focus:{" "}
                        {
                          data.vault
                            .jumpFocus
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {data.lifts?.length > 0 && (
                <div className="space-y-2">
                  {data.lifts.map(
                    (lift: any) => (
                      <div
                        key={lift.name}
                        className="border rounded-xl p-3"
                      >
                        <div
                          onClick={() =>
                            !isCompleted &&
                            !isLockedWeek &&
                            toggleCheck(
                              `${selectedWeek}-${day}-${lift.name}`
                            )
                          }
                          className="flex items-start gap-3 cursor-pointer"
                        >
                          <div
                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                              checkedItems[
                                `${selectedWeek}-${day}-${lift.name}`
                              ]
                                ? "bg-green-500 border-green-500 text-white"
                                : "border-gray-400"
                            }`}
                          >
                            {checkedItems[
                              `${selectedWeek}-${day}-${lift.name}`
                            ] && "✓"}
                          </div>

                          <div>
                            <p className="font-medium">
                              {lift.name}
                            </p>

                            <p className="text-sm text-gray-600">
                              {lift.sets} ×{" "}
                              {lift.reps}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {!isCompleted &&
                !isLockedWeek &&
                allChecked && (
                  <button
                    onClick={() =>
                      completeWorkout(
                        workoutKey
                      )
                    }
                    className="mt-4 w-full bg-green-600 text-white rounded-xl p-3 font-semibold"
                  >
                    Complete Workout
                  </button>
                )}
            </Card>
          );
        })}
      </div>

      {weekComplete &&
        !isLockedWeek && (
        <button
          onClick={completeWeek}
          className="mt-6 w-full bg-blue-600 text-white rounded-xl p-4 font-bold"
        >
          Complete Week →
        </button>
      )}
    </main>
  );
}