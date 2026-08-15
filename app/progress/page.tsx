"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import TrainingCalendar from "@/components/TrainingCalendar";
import VaultPRChart from "@/components/progress/VaultPRChart";
import { useAuth } from "@/components/AuthProvider";
import type { HeightPREntry, RunPRs, WeightEntry } from "@/lib/domain/types";
import {
  computeVaultGoalProgress,
  getHighestPRDisplay,
  type VaultRunChartKey,
} from "@/lib/domain/vaultProgress";
import {
  computeWeightStats,
  formatWeightDelta,
} from "@/lib/domain/weightStats";
import {
  appendWeightEntry,
  loadWeightHistory,
  subscribeWeightHistory,
} from "@/lib/storage/weightStore";
import {
  loadVaultPRHistory,
  loadVaultRunPRs,
  subscribeVaultRunPRs,
} from "@/lib/storage/logStore";

export default function ProgressPage() {
  const { isCoachReadOnly } = useAuth();
  const [vaultRunPRs, setVaultRunPRs] = useState<RunPRs>(loadVaultRunPRs);
  const [prHistory, setPrHistory] = useState<HeightPREntry[]>([]);
  const [selectedRun, setSelectedRun] = useState<VaultRunChartKey>("sevenL");
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [showWeightEditor, setShowWeightEditor] = useState(false);
  const [newWeight, setNewWeight] = useState("");

  useEffect(() => {
    const refresh = () => {
      setVaultRunPRs(loadVaultRunPRs());
      setPrHistory(loadVaultPRHistory());
      setWeightHistory(loadWeightHistory());
    };

    refresh();

    const unsubPRs = subscribeVaultRunPRs(refresh);
    const unsubWeights = subscribeWeightHistory(refresh);

    return () => {
      unsubPRs();
      unsubWeights();
    };
  }, []);

  function saveWeight() {
    const parsed = parseFloat(newWeight);
    if (isNaN(parsed)) return;

    setWeightHistory(appendWeightEntry(parsed));
    setNewWeight("");
    setShowWeightEditor(false);
  }

  const { currentWeight, dailyChange, monthlyChange, previousDate } =
    computeWeightStats(weightHistory);
  const maxPRString = getHighestPRDisplay(vaultRunPRs);
  const goalProgress = computeVaultGoalProgress(vaultRunPRs);

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <h1 className="mb-4 text-3xl font-bold">Progress</h1>

      <Card className="mb-4">
        <p className="text-sm text-gray-500">Current Weight</p>

        <p className="text-3xl font-bold">
          {currentWeight}
          {currentWeight !== "--" ? " lbs" : ""}
        </p>

        <div className="mt-1 space-y-1">
          {dailyChange !== null && (
            <p
              className={`text-sm font-medium ${
                dailyChange > 0
                  ? "text-green-600"
                  : dailyChange < 0
                    ? "text-red-600"
                    : "text-gray-500"
              }`}
            >
              {formatWeightDelta(dailyChange)}
              lbs since {previousDate}
            </p>
          )}

          {monthlyChange !== null && (
            <p
              className={`text-sm font-medium ${
                monthlyChange > 0
                  ? "text-green-600"
                  : monthlyChange < 0
                    ? "text-red-600"
                    : "text-gray-500"
              }`}
            >
              {monthlyChange > 0 ? "+" : ""}
              {monthlyChange.toFixed(1)}
              lbs (30d)
            </p>
          )}
        </div>

        {!isCoachReadOnly && (
          <button
            onClick={() => setShowWeightEditor(!showWeightEditor)}
            className="mt-3 w-full rounded-xl bg-blue-500 py-2 text-sm font-medium text-white"
          >
            Update Weight
          </button>
        )}

        {showWeightEditor && !isCoachReadOnly && (
          <div className="mt-3 space-y-2">
            <input
              type="number"
              step="0.1"
              value={newWeight}
              onChange={(event) => setNewWeight(event.target.value)}
              placeholder="182.4"
              className="w-full rounded-xl border p-2"
            />

            <button
              onClick={saveWeight}
              className="w-full rounded-xl bg-green-500 py-2 text-white"
            >
              Save
            </button>
          </div>
        )}
      </Card>

      <div className="mb-4">
        <Card>
          <p className="text-sm text-gray-500">Current PR</p>
          <p className="text-xl font-bold">{maxPRString || "--"}</p>
        </Card>
      </div>

      <Card>
        <div className="mb-2 flex justify-between">
          <span className="font-medium">Goal Progress</span>
          <span className="font-bold">{goalProgress}%</span>
        </div>

        <div className="h-3 w-full rounded-full bg-gray-200">
          <div
            className="h-3 rounded-full bg-blue-500"
            style={{ width: `${goalProgress}%` }}
          />
        </div>

        <p className="mt-2 text-sm text-gray-500">Goal: 15ft</p>
      </Card>

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
