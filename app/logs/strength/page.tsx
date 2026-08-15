"use client";

import { useAuth } from "@/components/AuthProvider";
import PRDisplayCard from "@/components/logs/PRDisplayCard";
import PRInputForm from "@/components/logs/PRInputForm";
import {
  STRENGTH_PR_DISPLAY,
  STRENGTH_PR_FIELDS,
} from "@/lib/domain/prLog";
import { useStrengthPRState } from "@/lib/hooks/useStrengthPRState";
import { destructiveOutlineButtonClassName } from "@/lib/ui/componentStyles";

export default function StrengthPage() {
  const { isCoachReadOnly } = useAuth();
  const { prs, inputs, updateInput, savePRs, clearPRs } = useStrengthPRState();

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Strength PRs</h1>

        {!isCoachReadOnly && (
          <button
            type="button"
            onClick={clearPRs}
            className={destructiveOutlineButtonClassName}
          >
            Reset
          </button>
        )}
      </div>

      <PRInputForm
        readOnly={isCoachReadOnly}
        fields={STRENGTH_PR_FIELDS}
        inputs={inputs}
        onInputChange={updateInput}
        onSave={savePRs}
      />

      <div className="mt-6 space-y-4">
        {STRENGTH_PR_DISPLAY.map((item) => (
          <PRDisplayCard
            key={item.prKey}
            label={item.label}
            value={prs[item.prKey]}
            date={prs[item.dateKey]}
            colorClass={item.color}
          />
        ))}
      </div>
    </main>
  );
}
