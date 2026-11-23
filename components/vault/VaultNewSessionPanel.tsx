"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Jump, Pole, VaultStepReferences } from "@/lib/domain/types";
import {
  getCompetitionJumpTintClass,
  getCompetitionOutcomeTagClass,
  getGradeEmoji,
  getJumpOutcomeLabel,
  getRunReference,
  normalizeCompetitionPlace,
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
  onSaveSession: (details?: { title?: string; place?: number }) => void;
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
  const [namingCompetition, setNamingCompetition] = useState(false);
  const [competitionTitle, setCompetitionTitle] = useState("");
  const [competitionPlace, setCompetitionPlace] = useState("");
  const [modeChosen, setModeChosen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const titleInputId = useId();

  useEffect(() => {
    if (!namingCompetition) {
      return;
    }

    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  }, [namingCompetition]);

  useEffect(() => {
    if (jumps.length > 0 || canClearSession) {
      setModeChosen(true);
    }
  }, [jumps.length, canClearSession]);

  function chooseMode(competition: boolean) {
    if (modeChosen && competition === competitionMode) {
      return;
    }

    if (modeChosen) {
      onCompetitionModeChange(competition);
      return;
    }

    onCompetitionModeChange(competition);
    setModeChosen(true);
  }

  function handleClearSession() {
    if (canClearSession) {
      onClearSession();
    } else if (competitionMode) {
      onCompetitionModeChange(false);
    }
    setModeChosen(false);
  }

  function requestSave() {
    if (jumps.length === 0) {
      return;
    }

    if (competitionMode) {
      setCompetitionTitle("");
      setCompetitionPlace("");
      setNamingCompetition(true);
      return;
    }

    onSaveSession();
    setModeChosen(false);
  }

  function confirmCompetitionSave() {
    const title = competitionTitle.trim();
    if (!title) {
      titleInputRef.current?.focus();
      return;
    }

    setNamingCompetition(false);
    setCompetitionTitle("");
    setCompetitionPlace("");
    onSaveSession({
      title,
      place: normalizeCompetitionPlace(competitionPlace),
    });
    setModeChosen(false);
  }

  function cancelCompetitionSave() {
    setNamingCompetition(false);
    setCompetitionTitle("");
    setCompetitionPlace("");
  }

  return (
    <>
    <fieldset disabled={readOnly} className="m-0 min-w-0 space-y-4 border-0 p-0">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">New Vault Session</h2>
          <p className="mt-1 text-sm text-muted">
            {modeChosen
              ? competitionMode
                ? "Competition log"
                : "Practice session"
              : "Choose practice or competition to start."}
          </p>
        </div>

        <div
          role="group"
          aria-label="Session type"
          className="grid grid-cols-2 gap-2"
        >
          <button
            type="button"
            aria-pressed={modeChosen && !competitionMode}
            onClick={() => chooseMode(false)}
            className={`rounded-xl border px-4 py-3 text-center text-sm font-bold transition ${
              modeChosen && !competitionMode
                ? "border-accent bg-surface-accent text-foreground ring-2 ring-accent"
                : "border-border bg-surface text-foreground hover:bg-surface-muted"
            }`}
          >
            Practice
          </button>

          <button
            type="button"
            aria-pressed={modeChosen && competitionMode}
            onClick={() => chooseMode(true)}
            className={`rounded-xl border px-4 py-3 text-center text-sm font-bold transition ${
              modeChosen && competitionMode
                ? "border-amber-400 bg-amber-500/15 text-foreground ring-2 ring-amber-400"
                : "border-border bg-surface text-foreground hover:bg-surface-muted"
            }`}
          >
            Competition
          </button>
        </div>

        {modeChosen && (
          <>
        {!competitionMode && (
          <div className="space-y-3 border-t border-border pt-4">
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

        <div
          className={
            competitionMode ? "border-t border-border pt-4" : "pt-1"
          }
        >
          <p className="mb-3 font-semibold text-foreground">Add Jump</p>

          <div className="space-y-3">
            {competitionMode && (
              <>
                <input
                  value={jumpForm.barHeight}
                  onChange={(event) =>
                    onJumpFormChange({
                      ...jumpForm,
                      barHeight: event.target.value,
                    })
                  }
                  placeholder="Bar height"
                  className={fieldClassName}
                />
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
              </>
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
              <div className="space-y-2">
                <p className="text-xs text-muted">
                  Leave both unselected to log a warmup jump.
                </p>
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
                            result: selected ? undefined : result,
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
              className="w-full rounded-xl border border-border bg-surface-muted p-3 font-semibold text-foreground hover:bg-surface-accent"
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
                    className={`border-l-4 p-3 text-foreground ${
                      competitionMode
                        ? getCompetitionJumpTintClass(jump.result)
                        : "border-transparent bg-surface"
                    }`}
                  >
                    <div className="flex justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {competitionMode ? (
                          <span
                            className={getCompetitionOutcomeTagClass(
                              jump.result
                            )}
                          >
                            {getJumpOutcomeLabel(jump)}
                          </span>
                        ) : (
                          <span className="font-medium">
                            {getJumpOutcomeLabel(jump)}
                          </span>
                        )}
                        {jump.barHeight && (
                          <span className="text-lg font-bold tracking-tight text-foreground">
                            {jump.barHeight}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveJump(jump.id)}
                        className="text-sm text-red-500 [data-theme-mode=dark]:text-red-400"
                      >
                        Delete
                      </button>
                    </div>

                    {jump.standards && (
                      <p className="text-sm text-muted">
                        Standards: {jump.standards}
                      </p>
                    )}
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
            onClick={handleClearSession}
            className="w-full rounded-xl border border-border bg-surface p-3 font-semibold text-foreground hover:bg-surface-muted"
          >
            {canClearSession ? "Clear" : "Close"}
          </button>

          <button
            type="button"
            onClick={requestSave}
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
          </>
        )}
      </div>
    </fieldset>

    {namingCompetition && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.75rem))] pt-8">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleInputId}
          className="w-full max-w-sm rounded-2xl border border-amber-400/60 bg-surface p-5 shadow-xl"
        >
          <p id={titleInputId} className="text-lg font-bold text-foreground">
            Name this competition
          </p>
          <p className="mt-1 text-sm text-muted">
            Meet name, location, or anything that helps you find it later.
          </p>

          <form
            className="mt-4 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              confirmCompetitionSave();
            }}
          >
            <input
              ref={titleInputRef}
              value={competitionTitle}
              onChange={(event) => setCompetitionTitle(event.target.value)}
              placeholder="e.g. Conference Finals — Austin"
              className={fieldClassName}
              autoComplete="off"
            />

            <div>
              <label
                htmlFor="competition-place"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Place{" "}
                <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                id="competition-place"
                type="text"
                inputMode="numeric"
                value={competitionPlace}
                onChange={(event) =>
                  setCompetitionPlace(
                    event.target.value.replace(/\D/g, "").slice(0, 3)
                  )
                }
                placeholder="1, 2, 3…"
                className={fieldClassName}
                autoComplete="off"
              />
              <p className="mt-1.5 text-xs text-muted">
                1st–3rd show 🥇🥈🥉 on the session card.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={cancelCompetitionSave}
                className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={competitionTitle.trim() === ""}
                className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
}
