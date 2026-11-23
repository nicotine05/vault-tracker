"use client";

import type { Jump, Pole, VaultStepReferences } from "@/lib/domain/types";
import {
  getGradeEmoji,
  getJumpOutcomeLabel,
  getRunReference,
  type JumpFormState,
} from "@/lib/domain/vaultLog";
import { formatPolePickerLabel, getPoleById } from "@/lib/domain/poleInventory";
import PolePicker from "@/components/vault/poles/PolePicker";
import PoleBrandAccent from "@/components/vault/poles/PoleBrandAccent";

type VaultNewSessionPanelProps = {
  readOnly: boolean;
  competitionMode: boolean;
  onCompetitionModeChange: (enabled: boolean) => void;
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
  onClearSession: () => void;
  canClearSession: boolean;
  onSaveSession: () => void;
};

const fieldClassName =
  "w-full rounded-xl border border-border bg-surface-muted p-3 text-foreground";

export default function VaultNewSessionPanel({
  readOnly,
  competitionMode,
  onCompetitionModeChange,
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
  onClearSession,
  canClearSession,
  onSaveSession,
}: VaultNewSessionPanelProps) {
  const canAddJump = competitionMode ? Boolean(jumpForm.result) : true;

  return (
    <fieldset disabled={readOnly} className="m-0 min-w-0 space-y-4 border-0 p-0">
      <div className="space-y-4">
        <div
          className={`rounded-xl border p-3 ${
            competitionMode
              ? "border-amber-400/70 bg-amber-500/15"
              : "border-border-accent bg-surface-accent"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {competitionMode ? "New Competition Log" : "New Vault Session"}
              </h2>
              {competitionMode && (
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-amber-800 [data-theme-mode=dark]:text-amber-200">
                  Competition mode
                </p>
              )}
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <span className="text-muted">Competition</span>
              <input
                type="checkbox"
                checked={competitionMode}
                onChange={(event) =>
                  onCompetitionModeChange(event.target.checked)
                }
                className="h-4 w-4 accent-[var(--accent)]"
              />
            </label>
          </div>
        </div>

        {!competitionMode && (
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
        )}

        <div className="border-t border-border pt-4">
          <p className="mb-3 font-semibold text-foreground">Add Jump</p>

          <div className="space-y-3">
            {competitionMode && (
              <input
                value={jumpForm.standards}
                onChange={(event) =>
                  onJumpFormChange({
                    ...jumpForm,
                    standards: event.target.value,
                  })
                }
                placeholder="Standards"
                className={fieldClassName}
              />
            )}

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

            {competitionMode ? (
              <div className="grid grid-cols-2 gap-2">
                {(["make", "miss"] as const).map((result) => {
                  const selected = jumpForm.result === result;

                  return (
                    <button
                      key={result}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        onJumpFormChange({
                          ...jumpForm,
                          result,
                        })
                      }
                      className={`rounded-xl border p-3 text-sm font-semibold uppercase tracking-wide transition ${
                        selected
                          ? result === "make"
                            ? "border-emerald-500 bg-emerald-500/15 text-emerald-800 ring-2 ring-emerald-500 [data-theme-mode=dark]:text-emerald-200"
                            : "border-red-500 bg-red-500/15 text-red-800 ring-2 ring-red-500 [data-theme-mode=dark]:text-red-200"
                          : "border-border bg-surface text-foreground hover:bg-surface-muted"
                      }`}
                    >
                      {result}
                    </button>
                  );
                })}
              </div>
            ) : (
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
            )}

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
              disabled={!canAddJump}
              className="w-full rounded-xl border border-border bg-surface-muted p-3 font-semibold text-foreground hover:bg-surface-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              + Add Jump
            </button>
          </div>
        </div>

        {jumps.length > 0 && (
          <div
            className={`overflow-hidden rounded-xl border ${
              competitionMode
                ? "border-amber-400/70"
                : "border-border"
            }`}
          >
            <div
              className={`p-3 font-semibold text-foreground ${
                competitionMode
                  ? "bg-amber-500/20"
                  : "bg-surface-muted"
              }`}
            >
              {competitionMode ? "Current Competition Log" : "Current Session"}{" "}
              ({jumps.length} jumps)
            </div>

            <div className="divide-y divide-border">
              {jumps.map((jump) => {
                const reference = getRunReference(jump.run, stepRefs);
                const pole = getPoleById(poles, jump.poleId);

                return (
                  <div
                    key={jump.id}
                    className={`p-3 text-foreground ${
                      competitionMode
                        ? "bg-amber-500/5"
                        : "bg-surface"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {getJumpOutcomeLabel(jump)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveJump(jump.id)}
                        className="text-sm text-red-500 [data-theme-mode=dark]:text-red-400"
                      >
                        Delete
                      </button>
                    </div>

                    {jump.standards && <p>Standards: {jump.standards}</p>}
                    <p>Run: {jump.run}</p>
                    {reference && (
                      <p className="text-sm text-muted">Ref: {reference}</p>
                    )}
                    <p>Grip: {jump.grip}</p>
                    <p>Takeoff: {jump.takeoff}</p>
                    {pole && (
                      <p className="flex items-center gap-1.5 text-sm text-muted">
                        <PoleBrandAccent
                          brandId={pole.brandId}
                          className="h-2 w-2"
                        />
                        Pole: {formatPolePickerLabel(pole)}
                      </p>
                    )}
                    {jump.comment && (
                      <p className="text-muted">{jump.comment}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <button
            type="button"
            onClick={onClearSession}
            disabled={!canClearSession}
            className="w-full rounded-xl border border-border bg-surface p-3 font-semibold text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={onSaveSession}
            disabled={jumps.length === 0}
            className={`w-full rounded-xl p-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 ${
              competitionMode
                ? "bg-amber-600 hover:bg-amber-500"
                : "bg-accent"
            }`}
          >
            {competitionMode ? "Save Competition Log" : "Save Vault Session"}
          </button>
        </div>
      </div>
    </fieldset>
  );
}
