"use client";

import type { RunPRs, VaultStepReferences } from "@/lib/domain/types";
import { VAULT_RUN_STEPS } from "@/lib/domain/vaultLog";

type VaultStepReferencePanelProps = {
  readOnly: boolean;
  editingRefs: boolean;
  onToggleEditing: () => void;
  showPRMenu: boolean;
  onTogglePRMenu: () => void;
  stepRefs: VaultStepReferences;
  onStepRefsChange: (refs: VaultStepReferences) => void;
  runPRs: RunPRs;
  onRunPRChange: (key: keyof RunPRs, value: string) => void;
  onSaveHeightPRs: () => void;
  latestPRDate?: string;
};

export default function VaultStepReferencePanel({
  readOnly,
  editingRefs,
  onToggleEditing,
  showPRMenu,
  onTogglePRMenu,
  stepRefs,
  onStepRefsChange,
  runPRs,
  onRunPRChange,
  onSaveHeightPRs,
  latestPRDate,
}: VaultStepReferencePanelProps) {
  return (
    <fieldset disabled={readOnly} className="m-0 min-w-0 border-0 p-0">
      <div className="h-fit space-y-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Step Reference</h2>

          <button
            type="button"
            onClick={onToggleEditing}
            className="rounded-lg border px-3 py-1 text-sm"
          >
            {editingRefs ? "Done" : "Edit"}
          </button>

          <button
            type="button"
            onClick={onTogglePRMenu}
            className="rounded-lg bg-green-500 px-3 py-1 text-sm text-white"
          >
            PRs
          </button>
        </div>

        {VAULT_RUN_STEPS.map(([label, key]) => (
          <div key={label} className="flex items-center justify-between">
            <span className="font-medium">{label}</span>

            {editingRefs ? (
              <input
                value={stepRefs[key]}
                onChange={(event) =>
                  onStepRefsChange({
                    ...stepRefs,
                    [key]: event.target.value,
                  })
                }
                className="w-24 rounded-lg border px-2 py-1 text-right"
              />
            ) : (
              <span>{stepRefs[key] || "--"}</span>
            )}
          </div>
        ))}

        {showPRMenu && (
          <div className="mt-3 space-y-2 border-t pt-3">
            <p className="font-semibold">PR by Step</p>

            {VAULT_RUN_STEPS.map(([label, key]) => (
              <div key={label} className="flex items-center justify-between">
                <span>{label}</span>

                <input
                  value={runPRs[key]}
                  onChange={(event) => onRunPRChange(key, event.target.value)}
                  placeholder="xxft xin"
                  className="w-24 rounded border px-2 py-1 text-right"
                />

                <span className="text-xs text-gray-500">
                  {runPRs[`${key}Date` as keyof RunPRs] as string}
                </span>
              </div>
            ))}

            <button
              type="button"
              onClick={onSaveHeightPRs}
              className="mt-2 w-full rounded-lg bg-green-500 p-2 text-white"
            >
              Save Height PRs
            </button>

            {latestPRDate && (
              <div className="border-t pt-2 text-xs">
                Latest Saved: {latestPRDate}
              </div>
            )}
          </div>
        )}
      </div>
    </fieldset>
  );
}
