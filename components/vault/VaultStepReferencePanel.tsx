"use client";

import type { RunPRs, VaultStepReferences } from "@/lib/domain/types";
import { VAULT_RUN_STEPS } from "@/lib/domain/vaultLog";
import VaultHeightInput from "@/components/vault/VaultHeightInput";

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
      <div className="h-fit space-y-3 rounded-xl border border-border-accent bg-surface-accent p-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-foreground">Step Reference</h2>

          <button
            type="button"
            onClick={onToggleEditing}
            className="rounded-lg border border-border bg-surface px-3 py-1 text-sm text-foreground hover:bg-surface-muted"
          >
            {editingRefs ? "Done" : "Edit"}
          </button>

          <button
            type="button"
            onClick={onTogglePRMenu}
            className="rounded-lg bg-accent px-3 py-1 text-sm font-medium text-white"
          >
            PRs
          </button>
        </div>

        {VAULT_RUN_STEPS.map(([label, key]) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <span className="font-medium text-foreground">{label}</span>

            {editingRefs ? (
              <input
                value={stepRefs[key]}
                onChange={(event) =>
                  onStepRefsChange({
                    ...stepRefs,
                    [key]: event.target.value,
                  })
                }
                className="w-24 rounded-lg border border-border bg-surface-muted px-2 py-1 text-right text-foreground"
              />
            ) : (
              <span className="text-foreground">{stepRefs[key] || "--"}</span>
            )}
          </div>
        ))}

        {showPRMenu && (
          <div className="mt-3 space-y-2 border-t border-border pt-3">
            <p className="font-semibold text-foreground">PR by Step</p>

            {VAULT_RUN_STEPS.map(([label, key]) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="shrink-0 text-foreground">{label}</span>

                <VaultHeightInput
                  value={runPRs[key]}
                  onChange={(value) => onRunPRChange(key, value)}
                  onCommit={onSaveHeightPRs}
                />

                <span className="w-20 shrink-0 text-right text-xs text-muted">
                  {runPRs[`${key}Date` as keyof RunPRs] as string}
                </span>
              </div>
            ))}

            <button
              type="button"
              onClick={onSaveHeightPRs}
              className="mt-2 w-full rounded-lg bg-accent p-2 font-medium text-white"
            >
              Save Height PRs
            </button>

            {latestPRDate && (
              <div className="border-t border-border pt-2 text-xs text-muted">
                Latest Saved: {latestPRDate}
              </div>
            )}
          </div>
        )}
      </div>
    </fieldset>
  );
}
