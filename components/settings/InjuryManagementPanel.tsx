"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import { useAuth } from "@/components/AuthProvider";
import { program } from "@/lib/data";
import {
  EMPTY_INJURY_RESTRICTIONS,
  getProgramStatusDescription,
  getProgramStatusLabel,
  INJURY_RESTRICTION_OPTIONS,
  type InjuryRestrictions,
} from "@/lib/domain/injuryManagement";
import { getPhaseStartWeek } from "@/lib/domain/programCycle";
import { getPhaseNameForWeek } from "@/lib/domain/programWeek";
import { useInjuryState } from "@/lib/hooks/useInjuryState";
import { useProgramState } from "@/lib/hooks/useProgramState";
import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/lib/ui/componentStyles";

export default function InjuryManagementPanel() {
  const { isCoachReadOnly } = useAuth();
  const { currentWeek } = useProgramState();
  const {
    profile,
    pause,
    modify,
    updateRestrictions,
    resume,
    restartPhase,
    restartProgram,
  } = useInjuryState();

  const [draftRestrictions, setDraftRestrictions] = useState<InjuryRestrictions>(
    profile.restrictions
  );
  const [showModifyOptions, setShowModifyOptions] = useState(
    profile.status === "modified"
  );
  const [confirmingRestart, setConfirmingRestart] = useState<
    "phase" | "program" | null
  >(null);

  useEffect(() => {
    setDraftRestrictions(profile.restrictions);
    setShowModifyOptions(profile.status === "modified");
  }, [profile]);

  const phaseName = getPhaseNameForWeek(currentWeek);
  const phaseStart = getPhaseStartWeek(currentWeek);
  const canResume = profile.status === "paused" || profile.status === "modified";
  const savedRestrictions =
    profile.status === "modified"
      ? profile.restrictions
      : EMPTY_INJURY_RESTRICTIONS;
  const restrictionsDirty =
    draftRestrictions.avoidLowerBody !== savedRestrictions.avoidLowerBody ||
    draftRestrictions.avoidUpperBody !== savedRestrictions.avoidUpperBody ||
    draftRestrictions.avoidSprinting !== savedRestrictions.avoidSprinting ||
    draftRestrictions.avoidVaulting !== savedRestrictions.avoidVaulting;

  function handleModifyProgram() {
    if (isCoachReadOnly) {
      return;
    }

    setShowModifyOptions(true);
  }

  function handleRestrictionChange(
    key: keyof InjuryRestrictions,
    checked: boolean
  ) {
    if (isCoachReadOnly) {
      return;
    }

    setDraftRestrictions((current) => ({
      ...current,
      [key]: checked,
    }));
  }

  function handleSaveRestrictions() {
    if (isCoachReadOnly || !restrictionsDirty) {
      return;
    }

    if (profile.status === "modified") {
      updateRestrictions(draftRestrictions);
      return;
    }

    modify(draftRestrictions);
  }

  function handleRestartPhase() {
    if (isCoachReadOnly) {
      return;
    }

    if (confirmingRestart === "phase") {
      restartPhase();
      setConfirmingRestart(null);
      return;
    }

    setConfirmingRestart("phase");
  }

  function handleRestartProgram() {
    if (isCoachReadOnly) {
      return;
    }

    if (confirmingRestart === "program") {
      restartProgram();
      setConfirmingRestart(null);
      return;
    }

    setConfirmingRestart("program");
  }

  return (
    <div className="space-y-4">
      <Card title="Current Program Status">
        <div className="rounded-xl border border-border bg-surface-muted p-4">
          <p className="text-lg font-semibold text-foreground">
            {getProgramStatusLabel(profile.status)}
          </p>
          <p className="mt-1 text-sm text-muted">
            {getProgramStatusDescription(profile.status)}
          </p>
          {profile.updatedAt && profile.status !== "active" && (
            <p className="mt-2 text-xs text-muted">Updated {profile.updatedAt}</p>
          )}
        </div>
      </Card>

      <Card title="Program Controls">
        <div className="space-y-3">
          {profile.status === "active" && (
            <>
              <button
                type="button"
                disabled={isCoachReadOnly}
                onClick={() => pause()}
                className={`w-full ${secondaryButtonClassName}`}
              >
                Pause Program
              </button>

              <button
                type="button"
                disabled={isCoachReadOnly}
                onClick={handleModifyProgram}
                className={`w-full ${secondaryButtonClassName}`}
              >
                Modify Program
              </button>
            </>
          )}

          {showModifyOptions && (
            <div className="rounded-xl border border-border bg-surface-muted p-4">
              <p className="mb-3 text-sm font-semibold text-foreground">
                Training Restrictions
              </p>
              <div className="space-y-2">
                {INJURY_RESTRICTION_OPTIONS.map((option) => (
                  <label
                    key={option.key}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground"
                  >
                    <input
                      type="checkbox"
                      checked={draftRestrictions[option.key]}
                      disabled={isCoachReadOnly}
                      onChange={(event) =>
                        handleRestrictionChange(option.key, event.target.checked)
                      }
                      className="h-4 w-4 rounded border-border accent-accent"
                    />
                    {option.label}
                  </label>
                ))}
              </div>

              {!isCoachReadOnly && (
                <button
                  type="button"
                  onClick={handleSaveRestrictions}
                  disabled={!restrictionsDirty}
                  className={`mt-4 w-full ${primaryButtonClassName} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  Save Restrictions
                </button>
              )}
            </div>
          )}

          {canResume && (
            <button
              type="button"
              disabled={isCoachReadOnly}
              onClick={() => resume()}
              className={`w-full ${primaryButtonClassName}`}
            >
              Resume Program
            </button>
          )}
        </div>

        <p className="mt-3 text-xs text-muted">
          Pausing freezes week progression. Modifying filters future generated
          workouts. All logs, PRs, and history are kept.
        </p>
      </Card>

      <Card title="Restart Program">
        <p className="-mt-1 mb-3 text-sm text-muted">
          Restart resets training progression only. All historical data stays
          intact.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            disabled={isCoachReadOnly}
            onClick={handleRestartPhase}
            className={`w-full ${
              confirmingRestart === "phase"
                ? primaryButtonClassName
                : secondaryButtonClassName
            }`}
          >
            {confirmingRestart === "phase"
              ? "Confirm?"
              : "Restart Current Phase"}
          </button>
          <p className="text-xs text-muted">
            Example: {phaseName} Week {currentWeek} becomes {phaseName} Week{" "}
            {phaseStart}.
          </p>

          <button
            type="button"
            disabled={isCoachReadOnly}
            onClick={handleRestartProgram}
            className={`w-full ${
              confirmingRestart === "program"
                ? primaryButtonClassName
                : secondaryButtonClassName
            }`}
          >
            {confirmingRestart === "program"
              ? "Confirm?"
              : "Restart Entire Program"}
          </button>
          <p className="text-xs text-muted">
            Returns to Week 1, Phase 1 of the {program.totalWeeks}-week program.
          </p>
        </div>
      </Card>
    </div>
  );
}
