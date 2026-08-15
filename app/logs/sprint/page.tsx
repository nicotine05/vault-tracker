"use client";

import { useAuth } from "@/components/AuthProvider";
import PRDisplayCard from "@/components/logs/PRDisplayCard";
import PRInputForm from "@/components/logs/PRInputForm";
import {
  SPRINT_PR_DISPLAY,
  SPRINT_PR_FIELDS,
} from "@/lib/domain/prLog";
import { useSprintPRState } from "@/lib/hooks/useSprintPRState";

export default function SprintPage() {
  const { isCoachReadOnly } = useAuth();
  const { prs, inputs, updateInput, savePRs, clearPRs } = useSprintPRState();

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sprint PRs</h1>

        {!isCoachReadOnly && (
          <button
            type="button"
            onClick={clearPRs}
            className="rounded-lg border border-red-300 px-3 py-1 text-xs text-red-500"
          >
            Reset
          </button>
        )}
      </div>

      <PRInputForm
        readOnly={isCoachReadOnly}
        fields={SPRINT_PR_FIELDS}
        inputs={inputs}
        onInputChange={updateInput}
        onSave={savePRs}
      />

      <div className="mt-6 space-y-4">
        {SPRINT_PR_DISPLAY.map((item) => (
          <PRDisplayCard
            key={item.prKey}
            label={item.label}
            value={prs[item.prKey]}
            date={prs[item.dateKey]}
            colorClass={item.color}
            unit={item.unit}
          />
        ))}
      </div>
    </main>
  );
}
