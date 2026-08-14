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

const trainingTypeStyles = {
  vault: {
    button: "border-amber-200 text-amber-900 hover:bg-amber-200",
    selected: "bg-amber-500 text-white border-amber-500 shadow-sm",
    card: "bg-amber-50 border-amber-200",
    badge: "border-amber-200 bg-amber-100 text-amber-800",
  },
  strength: {
    button: "border-sky-200 text-sky-900 hover:bg-sky-200",
    selected: "bg-sky-500 text-white border-sky-500 shadow-sm",
    card: "bg-sky-50 border-sky-200",
    badge: "border-sky-200 bg-sky-100 text-sky-800",
  },
  speed: {
    button: "border-emerald-200 text-emerald-900 hover:bg-emerald-200",
    selected: "bg-emerald-500 text-white border-emerald-500 shadow-sm",
    card: "bg-emerald-50 border-emerald-200",
    badge: "border-emerald-200 bg-emerald-100 text-emerald-800",
  },
} as const;

export default function ProgramPage() {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [unlockedWeek, setUnlockedWeek] = useState(1);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [completedWorkouts, setCompletedWorkouts] = useState<Record<string, boolean>>({});
  const [planner, setPlanner] = useState<Record<number, Record<string, PlannerDay>>>({});
  const [scheduleGenerated, setScheduleGenerated] = useState<Record<number, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedCurrentWeek = localStorage.getItem("currentWeek");
    const savedSelectedWeek = localStorage.getItem("selectedWeek");

    const current = Number(savedCurrentWeek || "1");
    const selected = Number(savedSelectedWeek || savedCurrentWeek || "1");

    setCurrentWeek(current);
    setUnlockedWeek(current);
    setSelectedWeek(selected);

    const savedChecks = localStorage.getItem("programChecks");
    if (savedChecks) setCheckedItems(JSON.parse(savedChecks));

    const savedCompleted = localStorage.getItem("completedWorkouts");
    if (savedCompleted) setCompletedWorkouts(JSON.parse(savedCompleted));

    const savedPlanner = localStorage.getItem("weeklyPlannerByWeek");
    if (savedPlanner) setPlanner(JSON.parse(savedPlanner));

    const savedGenerated = localStorage.getItem("generatedSchedules");
    if (savedGenerated) setScheduleGenerated(JSON.parse(savedGenerated));

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem("selectedWeek", selectedWeek.toString());
    localStorage.setItem("programChecks", JSON.stringify(checkedItems));
    localStorage.setItem("completedWorkouts", JSON.stringify(completedWorkouts));
    localStorage.setItem("weeklyPlannerByWeek", JSON.stringify(planner));
    localStorage.setItem("generatedSchedules", JSON.stringify(scheduleGenerated));
  }, [
    selectedWeek,
    checkedItems,
    completedWorkouts,
    planner,
    scheduleGenerated,
    loaded,
  ]);

  const week =
    programData[selectedWeek as keyof typeof programData];

  const weekPlanner = planner[selectedWeek] || {};

  const targets = {
    vault: Object.values(week.days).filter((d: any) => d.vault).length,
    strength: Object.values(week.days).filter((d: any) => d.lifts?.length).length,
    speed: Object.values(week.days).filter((d: any) => d.sprint).length,
  };

  const counts = {
    vault: plannerDays.filter((d) => weekPlanner[d]?.vault).length,
    strength: plannerDays.filter((d) => weekPlanner[d]?.strength).length,
    speed: plannerDays.filter((d) => weekPlanner[d]?.speed).length,
  };

  const plannerComplete =
    counts.vault === targets.vault &&
    counts.strength === targets.strength &&
    counts.speed === targets.speed;

  const togglePlanner = (
    day: string,
    type: "vault" | "strength" | "speed"
  ) => {
    setPlanner((prev) => ({
      ...prev,
      [selectedWeek]: {
        ...prev[selectedWeek],
        [day]: {
          vault: prev[selectedWeek]?.[day]?.vault || false,
          strength: prev[selectedWeek]?.[day]?.strength || false,
          speed: prev[selectedWeek]?.[day]?.speed || false,
          [type]: !prev[selectedWeek]?.[day]?.[type],
        },
      },
    }));
  };

  const warnings: string[] = [];

  if (counts.vault < targets.vault)
    warnings.push("Missing Required Vault Session");
  if (counts.strength < targets.strength)
    warnings.push("Missing Required Strength Session");
  if (counts.speed < targets.speed)
    warnings.push("Missing Required Speed Session");

  const resetPlanner = () => {
    setPlanner((prev) => ({
      ...prev,
      [selectedWeek]: {},
    }));
    setScheduleGenerated((prev) => ({
      ...prev,
      [selectedWeek]: false,
    }));
  };

  const generated = scheduleGenerated[selectedWeek];

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold mb-4">
        Program
      </h1>

      <Card>
        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              setSelectedWeek((prev) => Math.max(1, prev - 1))
            }
            className="px-3 py-1 border rounded-lg"
          >
            ←
          </button>

          <div className="text-center">
            <p className="font-bold">Week {selectedWeek}</p>
            <p className="text-sm text-gray-500">{week?.phase}</p>

            {selectedWeek > currentWeek && (
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                EXAMPLE WEEK
              </span>
            )}
          </div>

          <button
            onClick={() =>
              setSelectedWeek((prev) => Math.min(12, prev + 1))
            }
            className="px-3 py-1 border rounded-lg"
          >
            →
          </button>
        </div>
      </Card>

      {!generated && (
        <>
          <div className="mt-4">
            <Card title="Weekly Planner">
              <div className="space-y-3">
                {plannerDays.map((day) => {
                  const activeType = (["vault", "strength", "speed"] as const).find(
                    (type) => weekPlanner[day]?.[type]
                  );

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
                              onClick={() =>
                                togglePlanner(day, type)
                              }
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

          <div className="mt-4">
            <Card title="Planner Health">
              <p>Vault {counts.vault}/{targets.vault}</p>
              <p>Strength {counts.strength}/{targets.strength}</p>
              <p>Speed {counts.speed}/{targets.speed}</p>
            </Card>
          </div>

          {warnings.length > 0 && (
            <div className="mt-4">
              <Card title="Warnings">
                {warnings.map((w) => (
                  <p key={w}>⚠ {w}</p>
                ))}
              </Card>
            </div>
          )}

          {plannerComplete && (
            <div className="mt-4">
              <button
                onClick={() =>
                  setScheduleGenerated((prev) => ({
                    ...prev,
                    [selectedWeek]: true,
                  }))
                }
                className="w-full bg-purple-600 text-white rounded-xl p-4 font-bold"
              >
                Generate Schedule
              </button>

              <button
                type="button"
                onClick={resetPlanner}
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
              const d = weekPlanner[day];

              if (!d) return null;

              const hasItems =
                d.vault || d.strength || d.speed;

              if (!hasItems) return null;

              const activeType = (["vault", "strength", "speed"] as const).find(
                (type) => d[type]
              );

              return (
                <div
                  key={day}
                  className={`mb-3 rounded-xl border p-3 ${
                    activeType
                      ? trainingTypeStyles[activeType].card
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <p className="font-semibold text-slate-800">{day}</p>
                  {d.vault && (
                    <span className={`mt-2 inline-flex rounded-full border px-2 py-1 text-xs font-medium ${trainingTypeStyles.vault.badge}`}>
                      Vault Session
                    </span>
                  )}
                  {d.strength && (
                    <span className={`mt-2 ml-2 inline-flex rounded-full border px-2 py-1 text-xs font-medium ${trainingTypeStyles.strength.badge}`}>
                      Strength Session
                    </span>
                  )}
                  {d.speed && (
                    <span className={`mt-2 ml-2 inline-flex rounded-full border px-2 py-1 text-xs font-medium ${trainingTypeStyles.speed.badge}`}>
                      Speed Session
                    </span>
                  )}
                </div>
              );
            })}
          </Card>

          <button
            type="button"
            onClick={resetPlanner}
            className="mt-3 w-full border border-gray-300 text-gray-700 rounded-xl p-2 text-sm"
          >
            Reset
          </button>
        </div>
      )}
    </main>
  );
}
