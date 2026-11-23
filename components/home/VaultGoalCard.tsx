"use client";

import Card from "@/components/Card";
import type { RunPRs } from "@/lib/domain/types";
import {
  computeVaultGoalProgress,
  formatVaultHeightGoalDisplay,
  getHighestPRDisplay,
} from "@/lib/domain/vaultProgress";
import { useVaultHeightGoal } from "@/lib/hooks/useVaultHeightGoal";

type VaultGoalCardProps = {
  runPRs: RunPRs;
};

export default function VaultGoalCard({ runPRs }: VaultGoalCardProps) {
  const { goalHeight } = useVaultHeightGoal();
  const maxPRString = getHighestPRDisplay(runPRs);
  const goalProgress = computeVaultGoalProgress(runPRs, goalHeight);
  const goalLabel = formatVaultHeightGoalDisplay(goalHeight);

  return (
    <Card className="mb-4">
      <p className="text-sm text-muted">Current PR</p>
      <p className="text-xl font-bold">{maxPRString || "--"}</p>

      <div className="mt-4">
        <div className="mb-2 flex justify-between">
          <span className="font-medium">Goal Progress</span>
          <span className="font-bold">{goalProgress}%</span>
        </div>

        <div className="h-3 w-full rounded-full bg-border/70">
          <div
            className="h-3 rounded-full bg-accent transition-all duration-300"
            style={{ width: `${goalProgress}%` }}
          />
        </div>

        <p className="mt-2 text-sm text-muted">Goal: {goalLabel}</p>
      </div>
    </Card>
  );
}
