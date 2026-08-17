"use client";

import MealPlanCard from "@/components/home/MealPlanCard";
import HomeGreeting from "@/components/home/HomeGreeting";
import TodayTrainingCard from "@/components/home/TodayTrainingCard";
import WeightSummaryCard from "@/components/home/WeightSummaryCard";
import Card from "@/components/Card";
import { useAuth } from "@/components/AuthProvider";
import { program } from "@/lib/data";
import { getMealPlanKeyForWeek, getPhaseNameForWeek } from "@/lib/domain/programWeek";
import { useProgramState } from "@/lib/hooks/useProgramState";
import { useWeightHistory } from "@/lib/hooks/useWeightHistory";
import { getPhaseBadgeClass } from "@/lib/ui/phaseStyles";

export default function Home() {
  const { isCoachReadOnly } = useAuth();
  const { currentWeek, scheduleSnapshotsByWeek } = useProgramState();
  const {
    weightHistory,
    showEditor,
    setShowEditor,
    newWeight,
    setNewWeight,
    saveWeight,
  } = useWeightHistory();

  const currentPhase = getPhaseNameForWeek(currentWeek);
  const planKey = getMealPlanKeyForWeek(currentWeek);

  const weekProgress = Math.round((currentWeek / program.totalWeeks) * 100);

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <div className="mb-6">
        <div className="min-w-0">
          <h1 className="text-[1.65rem] font-bold leading-none tracking-tight text-foreground">
            Vault{" "}
            <span className="text-accent-text">Tracker</span>
          </h1>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-2.5 py-1">
              <span className="text-[11px] font-semibold tabular-nums text-foreground">
                Week {currentWeek}
                <span className="font-normal text-muted">
                  /{program.totalWeeks}
                </span>
              </span>

              <span className="h-3 w-px bg-border" aria-hidden />

              <div className="flex items-center gap-1.5">
                <div className="h-1 w-10 overflow-hidden rounded-full bg-border/70">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-300"
                    style={{ width: `${weekProgress}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium tabular-nums text-muted">
                  {weekProgress}%
                </span>
              </div>
            </div>

            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getPhaseBadgeClass(currentPhase)}`}
            >
              {currentPhase}
            </span>
          </div>
        </div>
      </div>

      <HomeGreeting />

      <div className="mb-4">
        <MealPlanCard planKey={planKey} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TodayTrainingCard
          currentWeek={currentWeek}
          scheduleSnapshotsByWeek={scheduleSnapshotsByWeek}
        />

        <Card>
          <WeightSummaryCard
            compact
            weightHistory={weightHistory}
            readOnly={isCoachReadOnly}
            showEditor={showEditor}
            newWeight={newWeight}
            onToggleEditor={() => setShowEditor(!showEditor)}
            onNewWeightChange={setNewWeight}
            onSave={saveWeight}
          />
        </Card>
      </div>
    </main>
  );
}
