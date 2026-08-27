"use client";

import type { Jump, Pole, VaultStepReferences } from "@/lib/domain/types";
import { getGradeEmoji, getRunReference } from "@/lib/domain/vaultLog";
import { formatPoleShortLabel, getPoleById } from "@/lib/domain/poleInventory";
import PolePicker from "@/components/vault/poles/PolePicker";

type JumpFormState = {
  run: string;
  grip: string;
  takeoff: string;
  grade: Jump["grade"];
  comment: string;
  poleId?: string;
};

type VaultNewSessionPanelProps = {
  readOnly: boolean;
  keys: string[];
  onKeysChange: (keys: string[]) => void;
  jumpForm: JumpFormState;
  onJumpFormChange: (form: JumpFormState) => void;
  jumps: Jump[];
  stepRefs: VaultStepReferences;
  poles: Pole[];
  recentPoleIds: string[];
  onAddJump: () => void;
  onRemoveJump: (jumpId: string) => void;
  onSaveSession: () => void;
};

const fieldClassName =
  "w-full rounded-xl border border-border bg-surface-muted p-3 text-foreground";

export default function VaultNewSessionPanel({
  readOnly,
  keys,
  onKeysChange,
  jumpForm,
  onJumpFormChange,
  jumps,
  stepRefs,
  poles,
  recentPoleIds,
  onAddJump,
  onRemoveJump,
  onSaveSession,
}: VaultNewSessionPanelProps) {
  return (
    <fieldset disabled={readOnly} className="m-0 min-w-0 space-y-4 border-0 p-0">
      <div className="space-y-4">
        <div className="rounded-xl border border-border-accent bg-surface-accent p-3">
          <h2 className="text-lg font-bold text-foreground">New Vault Session</h2>
        </div>

        <div className="space-y-3">
          <p className="font-medium text-foreground">Daily Keys</p>

          {keys.map((key, index) => (
            <input
              key={index}
              value={key}
              onChange={(event) => {
                const updated = [...keys];
                updated[index] = event.target.value;
                onKeysChange(updated);
              }}
              placeholder="Key"
              className={fieldClassName}
            />
          ))}

          {keys.length < 3 && (
            <button
              type="button"
              onClick={() => onKeysChange([...keys, ""])}
              className="w-full rounded-xl border border-border bg-surface p-2 text-sm text-foreground hover:bg-surface-muted"
            >
              + Add Key
            </button>
          )}
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-3 font-semibold text-foreground">Add Jump</p>

          <div className="space-y-3">
            <input
              value={jumpForm.run}
              onChange={(event) =>
                onJumpFormChange({ ...jumpForm, run: event.target.value })
              }
              placeholder="Run"
              className={fieldClassName}
            />

            <input
              value={jumpForm.grip}
              onChange={(event) =>
                onJumpFormChange({ ...jumpForm, grip: event.target.value })
              }
              placeholder="Grip"
              className={fieldClassName}
            />

            <input
              value={jumpForm.takeoff}
              onChange={(event) =>
                onJumpFormChange({ ...jumpForm, takeoff: event.target.value })
              }
              placeholder="Takeoff"
              className={fieldClassName}
            />

            <div className="grid grid-cols-3 gap-2">
              {(["green", "yellow", "red"] as const).map((grade) => {
                const selected = jumpForm.grade === grade;

                return (
                  <button
                    key={grade}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      onJumpFormChange({
                        ...jumpForm,
                        grade,
                      })
                    }
                    className={`rounded-xl border p-3 text-2xl transition ${
                      selected
                        ? "border-accent bg-surface ring-2 ring-accent"
                        : "border-border bg-surface hover:bg-surface-muted"
                    }`}
                  >
                    {getGradeEmoji(grade)}
                  </button>
                );
              })}
            </div>

            <input
              value={jumpForm.comment}
              onChange={(event) =>
                onJumpFormChange({ ...jumpForm, comment: event.target.value })
              }
              placeholder="Comment"
              className={fieldClassName}
            />

            {poles.length > 0 && (
              <PolePicker
                poles={poles}
                recentPoleIds={recentPoleIds}
                selectedPoleId={jumpForm.poleId}
                onSelect={(poleId) =>
                  onJumpFormChange({ ...jumpForm, poleId })
                }
              />
            )}

            <button
              type="button"
              onClick={onAddJump}
              className="w-full rounded-xl border border-border bg-surface-muted p-3 font-semibold text-foreground hover:bg-surface-accent"
            >
              + Add Jump
            </button>
          </div>
        </div>

        {jumps.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="bg-surface-muted p-3 font-semibold text-foreground">
              Current Session ({jumps.length} jumps)
            </div>

            <div className="divide-y divide-border">
              {jumps.map((jump) => {
                const reference = getRunReference(jump.run, stepRefs);
                const pole = getPoleById(poles, jump.poleId);

                return (
                  <div key={jump.id} className="bg-surface p-3 text-foreground">
                    <div className="flex justify-between">
                      <span>{getGradeEmoji(jump.grade)}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveJump(jump.id)}
                        className="text-sm text-red-500 [data-theme=dark]:text-red-400"
                      >
                        Delete
                      </button>
                    </div>

                    <p>Run: {jump.run}</p>
                    {reference && (
                      <p className="text-sm text-muted">Ref: {reference}</p>
                    )}
                    <p>Grip: {jump.grip}</p>
                    <p>Takeoff: {jump.takeoff}</p>
                    {pole && (
                      <p className="text-sm text-muted">
                        Pole: {formatPoleShortLabel(pole)}
                      </p>
                    )}
                    {jump.comment && <p className="text-muted">{jump.comment}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onSaveSession}
          disabled={jumps.length === 0}
          className="w-full rounded-xl bg-accent p-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save Vault Session
        </button>
      </div>
    </fieldset>
  );
}
