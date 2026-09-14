"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import GeneratedScheduleCard from "@/components/program/GeneratedScheduleCard";
import ProgramWeekHeader from "@/components/program/ProgramWeekHeader";
import ScheduleWarningModal from "@/components/program/ScheduleWarningModal";
import TargetIndicators from "@/components/program/TargetIndicators";
import WeeklyPlannerCard from "@/components/program/WeeklyPlannerCard";
import { isProgramModified } from "@/lib/domain/injuryManagement";
import {
  countPlannerSessions,
  getPlannerHealthMetrics,
  isPlannerComplete,
} from "@/lib/domain/plannerHealth";
import { getPhaseNameForWeek } from "@/lib/domain/programWeek";
import { useProgramState } from "@/lib/hooks/useProgramState";
import {
  isWeekScheduleGenerated,
  maxViewableWeek,
} from "@/lib/storage/programStore";
import { loadInjuryProfile } from "@/lib/storage/injuryStore";
import { getPlannerWarnings, type TrainingType } from "@/lib/trainingProgram";
import InjuryModeBadge from "@/components/program/InjuryModeBadge";

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
  const router = useRouter();
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
  const [injuryProfile, setInjuryProfile] = useState(loadInjuryProfile);
  const maxWeek = maxViewableWeek(currentWeek);

  useEffect(() => {
    setInjuryProfile(loadInjuryProfile());
  }, [planningWeek]);

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
  const isModifiedProgram = isProgramModified(injuryProfile);
  const plannerComplete = isPlannerComplete(counts, planningWeek, injuryProfile);
  const healthMetrics = getPlannerHealthMetrics(
    counts,
    planningWeek,
    injuryProfile
  );

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
  const isPastWeek = planningWeek < currentWeek;
  const canModifySchedule = !isPastWeek && !isCoachReadOnly;

  function navigateToWeek(week: number) {
    const clampedWeek = Math.min(maxWeek, Math.max(1, week));
    setPlanningWeek(clampedWeek);

    const params = new URLSearchParams(searchParams.toString());
    params.set("week", String(clampedWeek));
    const query = params.toString();
    router.replace(query ? `/program?${query}` : "/program", { scroll: false });
  }

  function togglePlanner(day: string, type: TrainingType) {
    updatePlannerDay(planningWeek, day, type);
  }

  function requestScheduleGeneration() {
    if (isPastWeek) {
      return;
    }

    const warnings = getPlannerWarnings(
      weekPlanner,
      planningWeek,
      injuryProfile
    );

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
        maxWeek={maxWeek}
        onPreviousWeek={() => navigateToWeek(planningWeek - 1)}
        onNextWeek={() => navigateToWeek(planningWeek + 1)}
        onReturnToActiveWeek={() => navigateToWeek(currentWeek)}
      />

      {injuryProfile.status !== "active" && (
        <div className="mt-4">
          <InjuryModeBadge profile={injuryProfile} />
        </div>
      )}

      {!generated && (
        <div className="mt-4 space-y-4">
          {!isModifiedProgram && healthMetrics.length > 0 && (
            <TargetIndicators metrics={healthMetrics} />
          )}

          <WeeklyPlannerCard
            readOnly={isCoachReadOnly || isPastWeek}
            weekPlanner={weekPlanner}
            injuryProfile={injuryProfile}
            onToggle={togglePlanner}
          />

          {isPastWeek && (
            <p className="text-center text-sm text-muted">
              Past weeks are view-only. Schedules cannot be generated retroactively.
            </p>
          )}

          {plannerComplete && canModifySchedule && (
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
          canModifySchedule={canModifySchedule}
          planningWeek={planningWeek}
          currentWeek={currentWeek}
          generatedSchedule={generatedSchedule}
          weekPlanner={weekPlanner}
          injuryProfile={injuryProfile}
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
