"use client";

import Link from "next/link";
import MealPlanCard from "@/components/home/MealPlanCard";
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

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold">Road to 15ft</h1>

          <div className="mt-1 flex items-center gap-2">
            <p className="text-gray-500">
              Week {currentWeek}/{program.totalWeeks}
            </p>

            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${getPhaseBadgeClass(currentPhase)}`}
            >
              {currentPhase}
            </span>
          </div>
        </div>

        <Link href="/settings" className="text-2xl">
          ⚙️
        </Link>
      </div>

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
