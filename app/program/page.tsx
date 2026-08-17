"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import GeneratedScheduleCard from "@/components/program/GeneratedScheduleCard";
import ProgramWeekHeader from "@/components/program/ProgramWeekHeader";
import ScheduleWarningModal from "@/components/program/ScheduleWarningModal";
import TargetIndicators from "@/components/program/TargetIndicators";
import WeeklyPlannerCard from "@/components/program/WeeklyPlannerCard";
import {
  countPlannerSessions,
  getPlannerHealthMetrics,
  isPlannerComplete,
} from "@/lib/domain/plannerHealth";
import { getPhaseNameForWeek } from "@/lib/domain/programWeek";
import { useProgramState } from "@/lib/hooks/useProgramState";
import { isWeekScheduleGenerated } from "@/lib/storage/programStore";
import { getPlannerWarnings, type TrainingType } from "@/lib/trainingProgram";

export default function ProgramPage() {
  return (
    <Suspense
      fallback={
        <main className="max-w-md mx-auto p-4 pb-20" />
      }
    >
      <ProgramPageContent />
    </Suspense>
  );
}

function ProgramPageContent() {
  const searchParams = useSearchParams();
  const { isCoachReadOnly } = useAuth();
  const {
    currentWeek,
    currentWeekStartDate,
    planningWeek,
    plannerByWeek,
    scheduleSnapshotsByWeek,
    completedWorkouts,
    executionHistory,
    updatePlannerDay,
    generateWeekSchedule,
    resetWeekPlanner,
    completeWorkout,
    setPlanningWeek,
  } = useProgramState();

  const [confirmingKey, setConfirmingKey] = useState<string | null>(null);
  const [scheduleWarnings, setScheduleWarnings] = useState<string[] | null>(null);

  useEffect(() => {
    const weekParam = searchParams.get("week");
    if (!weekParam) {
      return;
    }

    const week = Number(weekParam);
    if (Number.isFinite(week) && week !== planningWeek) {
      setPlanningWeek(week);
    }
  }, [searchParams, planningWeek, setPlanningWeek]);

  const weekPlanner = plannerByWeek[planningWeek] || {};
  const phaseName = getPhaseNameForWeek(planningWeek);
  const counts = countPlannerSessions(weekPlanner);
  const plannerComplete = isPlannerComplete(counts, planningWeek);
  const healthMetrics = getPlannerHealthMetrics(counts, planningWeek);

  const programState = {
    currentWeek,
    currentWeekStartDate,
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

  function requestScheduleGeneration() {
    const warnings = getPlannerWarnings(weekPlanner, planningWeek);

    if (warnings.length > 0) {
      setScheduleWarnings(warnings);
      return;
    }

    generateWeekSchedule(planningWeek);
  }

  function confirmScheduleGeneration() {
    generateWeekSchedule(planningWeek);
    setScheduleWarnings(null);
  }

  function cancelScheduleGeneration() {
    setScheduleWarnings(null);
  }

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <ProgramWeekHeader
        planningWeek={planningWeek}
        currentWeek={currentWeek}
        phaseName={phaseName}
        isPlanning={!generated}
      />

      {!generated && (
        <div className="mt-4 space-y-4">
          <TargetIndicators metrics={healthMetrics} />

          <WeeklyPlannerCard
            readOnly={isCoachReadOnly}
            weekPlanner={weekPlanner}
            onToggle={togglePlanner}
          />

          {plannerComplete && !isCoachReadOnly && (
            <button
              type="button"
              onClick={requestScheduleGeneration}
              className="w-full rounded-2xl bg-accent p-4 font-bold text-white shadow-lg shadow-accent/20 transition hover:opacity-95"
            >
              Generate Schedule
            </button>
          )}
        </div>
      )}

      {generated && (
        <GeneratedScheduleCard
          readOnly={isCoachReadOnly}
          planningWeek={planningWeek}
          currentWeek={currentWeek}
          generatedSchedule={generatedSchedule}
          weekPlanner={weekPlanner}
          plannerComplete={plannerComplete}
          completedWorkouts={completedWorkouts}
          confirmingKey={confirmingKey}
          onConfirmWorkout={completeWorkout}
          onSetConfirmingKey={setConfirmingKey}
          onTogglePlanner={togglePlanner}
          onRegenerate={requestScheduleGeneration}
          onReset={() => resetWeekPlanner(planningWeek)}
        />
      )}

      {scheduleWarnings && (
        <ScheduleWarningModal
          warnings={scheduleWarnings}
          onContinue={confirmScheduleGeneration}
          onCancel={cancelScheduleGeneration}
        />
      )}
    </main>
  );
}
