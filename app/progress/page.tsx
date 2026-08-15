"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import TrainingCalendar from "@/components/TrainingCalendar";
import VaultGoalCard from "@/components/home/VaultGoalCard";
import WeightSummaryCard from "@/components/home/WeightSummaryCard";
import VaultPRChart from "@/components/progress/VaultPRChart";
import type {
  HeightPREntry,
  SprintPREntry,
  StrengthPREntry,
} from "@/lib/domain/types";
import type {
  PRChartTab,
  SprintChartKey,
  StrengthChartKey,
} from "@/lib/domain/prProgress";
import { useWeightHistory } from "@/lib/hooks/useWeightHistory";
import { useVaultRunPRs } from "@/lib/hooks/useVaultRunPRs";
import {
  loadSprintPRHistory,
  loadStrengthPRHistory,
  loadVaultPRHistory,
  subscribeSprintPRs,
  subscribeStrengthPRs,
  subscribeVaultRunPRs,
} from "@/lib/storage/logStore";

export default function ProgressPage() {
  const runPRs = useVaultRunPRs();
  const [vaultHistory, setVaultHistory] = useState<HeightPREntry[]>([]);
  const [sprintHistory, setSprintHistory] = useState<SprintPREntry[]>([]);
  const [strengthHistory, setStrengthHistory] = useState<StrengthPREntry[]>([]);
  const [selectedTab, setSelectedTab] = useState<PRChartTab>("sevenL");
  const [sprintMetric, setSprintMetric] = useState<SprintChartKey>("tenMeter");
  const [strengthMetric, setStrengthMetric] =
    useState<StrengthChartKey>("bench");
  const { weightHistory } = useWeightHistory();

  useEffect(() => {
    const refreshVaultHistory = () => setVaultHistory(loadVaultPRHistory());
    const refreshSprintHistory = () => setSprintHistory(loadSprintPRHistory());
    const refreshStrengthHistory = () =>
      setStrengthHistory(loadStrengthPRHistory());

    refreshVaultHistory();
    refreshSprintHistory();
    refreshStrengthHistory();

    const unsubscribeVault = subscribeVaultRunPRs(refreshVaultHistory);
    const unsubscribeSprint = subscribeSprintPRs(refreshSprintHistory);
    const unsubscribeStrength = subscribeStrengthPRs(refreshStrengthHistory);

    return () => {
      unsubscribeVault();
      unsubscribeSprint();
      unsubscribeStrength();
    };
  }, []);

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <WeightSummaryCard weightHistory={weightHistory} readOnly />

      <VaultGoalCard runPRs={runPRs} />

      <div className="mt-4">
        <Card>
          <VaultPRChart
            vaultHistory={vaultHistory}
            sprintHistory={sprintHistory}
            strengthHistory={strengthHistory}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            sprintMetric={sprintMetric}
            onSprintMetricChange={setSprintMetric}
            strengthMetric={strengthMetric}
            onStrengthMetricChange={setStrengthMetric}
          />
        </Card>
      </div>

      <div className="mt-4">
        <TrainingCalendar />
      </div>
    </main>
  );
}
