"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import TrainingCalendar from "@/components/TrainingCalendar";
import VaultGoalCard from "@/components/home/VaultGoalCard";
import WeightSummaryCard from "@/components/home/WeightSummaryCard";
import VaultPRChart from "@/components/progress/VaultPRChart";
import { useAuth } from "@/components/AuthProvider";
import type { HeightPREntry } from "@/lib/domain/types";
import type { VaultRunChartKey } from "@/lib/domain/vaultProgress";
import { useWeightHistory } from "@/lib/hooks/useWeightHistory";
import { useVaultRunPRs } from "@/lib/hooks/useVaultRunPRs";
import { loadVaultPRHistory, subscribeVaultRunPRs } from "@/lib/storage/logStore";

export default function ProgressPage() {
  const { isCoachReadOnly } = useAuth();
  const runPRs = useVaultRunPRs();
  const [prHistory, setPrHistory] = useState<HeightPREntry[]>([]);
  const [selectedRun, setSelectedRun] = useState<VaultRunChartKey>("sevenL");
  const {
    weightHistory,
    showEditor,
    setShowEditor,
    newWeight,
    setNewWeight,
    saveWeight,
  } = useWeightHistory();

  useEffect(() => {
    const refreshHistory = () => setPrHistory(loadVaultPRHistory());
    refreshHistory();

    const unsubscribe = subscribeVaultRunPRs(refreshHistory);
    return unsubscribe;
  }, []);

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <h1 className="mb-4 text-3xl font-bold">Progress</h1>

      <WeightSummaryCard
        weightHistory={weightHistory}
        readOnly={isCoachReadOnly}
        showEditor={showEditor}
        newWeight={newWeight}
        onToggleEditor={() => setShowEditor(!showEditor)}
        onNewWeightChange={setNewWeight}
        onSave={saveWeight}
      />

      <VaultGoalCard runPRs={runPRs} />

      <div className="mt-4">
        <Card>
          <VaultPRChart
            prHistory={prHistory}
            selectedRun={selectedRun}
            onRunChange={setSelectedRun}
          />
        </Card>
      </div>

      <div className="mt-4">
        <TrainingCalendar />
      </div>
    </main>
  );
}
