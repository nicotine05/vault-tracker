"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import GeneratedScheduleCard from "@/components/program/GeneratedScheduleCard";
import PlannerHealthBar from "@/components/program/PlannerHealthBar";
import ProgramWeekHeader from "@/components/program/ProgramWeekHeader";
import WeeklyPlannerCard from "@/components/program/WeeklyPlannerCard";
import {
  countPlannerSessions,
  getPlannerHealthMetrics,
  getPlannerHealthWarnings,
  isPlannerComplete,
} from "@/lib/domain/plannerHealth";
import { getPhaseNameForWeek } from "@/lib/domain/programWeek";
import { useProgramState } from "@/lib/hooks/useProgramState";
import { isWeekScheduleGenerated } from "@/lib/storage/programStore";
import type { TrainingType } from "@/lib/trainingProgram";

export default function ProgramPage() {
  const { isCoachReadOnly } = useAuth();
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
  const phaseName = getPhaseNameForWeek(planningWeek);
  const counts = countPlannerSessions(weekPlanner);
  const plannerComplete = isPlannerComplete(counts, planningWeek);
  const healthMetrics = getPlannerHealthMetrics(counts, planningWeek);
  const { healthWarnings, otherWarnings } = getPlannerHealthWarnings(
    weekPlanner,
    planningWeek,
    counts
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

  function togglePlanner(day: string, type: TrainingType) {
    updatePlannerDay(planningWeek, day, type);
  }

  function toggleExpanded(key: string) {
    setExpandedWorkouts((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <h1 className="mb-4 text-3xl font-bold">Program</h1>

      <ProgramWeekHeader
        planningWeek={planningWeek}
        currentWeek={currentWeek}
        phaseName={phaseName}
      />

      {!generated && (
        <>
          <div className="mt-4">
            <PlannerHealthBar
              metrics={healthMetrics}
              healthWarnings={healthWarnings}
              otherWarnings={otherWarnings}
            />
          </div>

          <div className="mt-4">
            <WeeklyPlannerCard
              readOnly={isCoachReadOnly}
              weekPlanner={weekPlanner}
              onToggle={togglePlanner}
            />
          </div>

          {plannerComplete && !isCoachReadOnly && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => generateWeekSchedule(planningWeek)}
                className="w-full rounded-xl bg-purple-600 p-4 font-bold text-white"
              >
                Generate Schedule
              </button>

              <button
                type="button"
                onClick={() => resetWeekPlanner(planningWeek)}
                className="mt-2 w-full rounded-xl border border-gray-300 p-2 text-sm text-gray-700"
              >
                Reset
              </button>
            </div>
          )}
        </>
      )}

      {generated && (
        <GeneratedScheduleCard
          readOnly={isCoachReadOnly}
          planningWeek={planningWeek}
          generatedSchedule={generatedSchedule}
          completedWorkouts={completedWorkouts}
          expandedWorkouts={expandedWorkouts}
          confirmingKey={confirmingKey}
          onToggleExpanded={toggleExpanded}
          onConfirmWorkout={completeWorkout}
          onSetConfirmingKey={setConfirmingKey}
          onReset={() => resetWeekPlanner(planningWeek)}
        />
      )}
    </main>
  );
}
