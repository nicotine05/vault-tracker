"use client";

import {
  useState,
  useEffect,
} from "react";
import Card from "@/components/Card";
import { programData } from "@/lib/programData";
import {
  plannerDays,
  getPhaseConfig,
  getPlannerWarnings,
  generateScheduleForWeek,
  getTrafficLightSymbol,
  getDailyRecommendation,
  getCatalogWorkout,
  type PlannerDay,
  type TrainingType,
  type TrafficLightLevel,
} from "@/lib/trainingProgram";
import type { StrengthWorkout } from "@/lib/catalogs/strengthCatalog";
import type { SprintWorkout } from "@/lib/catalogs/sprintCatalog";
import type { VaultWorkout } from "@/lib/catalogs/vaultCatalog";

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

const trafficStyles: Record<TrafficLightLevel, string> = {
  Green: "border-emerald-200 bg-emerald-50 text-emerald-900",
  Yellow: "border-yellow-200 bg-yellow-50 text-yellow-900",
  Orange: "border-orange-200 bg-orange-50 text-orange-900",
  Red: "border-red-200 bg-red-50 text-red-900",
  Black: "border-slate-300 bg-slate-800 text-white",
};

export default function ProgramPage() {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [unlockedWeek, setUnlockedWeek] = useState(1);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [completedWorkouts, setCompletedWorkouts] = useState<Record<string, boolean>>({});
  const [planner, setPlanner] = useState<Record<number, Record<string, PlannerDay>>>({});
  const [scheduleGenerated, setScheduleGenerated] = useState<Record<number, boolean>>({});
  const [expandedWorkouts, setExpandedWorkouts] = useState<Record<string, boolean>>({});
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
  const phaseConfig = getPhaseConfig(selectedWeek);

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

  const warnings = getPlannerWarnings(weekPlanner, selectedWeek);

  if (counts.vault < targets.vault)
    warnings.unshift("Missing Required Vault Session");
  if (counts.strength < targets.strength)
    warnings.unshift("Missing Required Strength Session");
  if (counts.speed < targets.speed)
    warnings.unshift("Missing Required Speed Session");

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
  const generatedSchedule = generated
    ? generateScheduleForWeek(weekPlanner, selectedWeek)
    : {};

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
          {warnings.length > 0 && (
            <div className="sticky top-0 z-20 mt-4 rounded-xl border border-amber-200 bg-amber-50/95 px-3 py-2 shadow-sm backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900">
                <span aria-hidden="true">⚠</span>
                <span>Warnings</span>
              </div>
              <ul className="space-y-1 text-sm text-amber-900">
                {warnings.map((w) => (
                  <li key={w}>• {w}</li>
                ))}
              </ul>
            </div>
          )}

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
              <p>
                Vault {counts.vault}/{targets.vault}
              </p>
              <p>
                Strength {counts.strength}/{targets.strength}
              </p>
              <p>
                Speed {counts.speed}/{targets.speed}
              </p>
            </Card>
          </div>

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
                      const isExpanded = expandedWorkouts[`${day}-${session.id}`];
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
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="font-medium">{session.name}</div>
                                {session.focus && (
                                  <div className="mt-1 text-[11px] opacity-80">{session.focus}</div>
                                )}
                                {session.jumpVolume && (
                                  <div className="mt-1 text-[10px] uppercase tracking-wide opacity-70">
                                    Jump volume: {session.jumpVolume}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{session.load}</span>
                                <span className="text-xs">{isExpanded ? "▼" : "▶"}</span>
                              </div>
                            </div>
                          </button>

                          {isExpanded && workout && (
                            <div className="mt-1 rounded-lg border border-slate-200 bg-white p-3 text-xs space-y-2">
                              {workout && "primaryLift" in workout && (
                                <>
                                  <div>
                                    <span className="font-semibold">Primary:</span> {workout.primaryLift}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Secondary:</span> {workout.secondaryLift}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Superset A:</span> {workout.supersetA.join(", ")}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Superset B:</span> {workout.supersetB.join(", ")}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Finisher:</span> {workout.finisher}
                                  </div>
                                </>
                              )}
                              {workout && "workout" in workout && (
                                <>
                                  <div>
                                    <span className="font-semibold">Category:</span> {workout.category}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Workout:</span>
                                    <ul className="list-inside list-disc mt-1">
                                      {workout.workout.map((w, i) => (
                                        <li key={i}>{w}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <span className="font-semibold">Rest:</span> {workout.rest}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Purpose:</span> {workout.purpose}
                                  </div>
                                </>
                              )}
                              {workout && "runLength" in workout && (
                                <>
                                  <div>
                                    <span className="font-semibold">Run Length:</span> {workout.runLength}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Jump Volume:</span> {workout.jumpVolume}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Description:</span> {workout.description}
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
