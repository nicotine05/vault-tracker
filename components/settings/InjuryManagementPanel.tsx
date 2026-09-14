"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import InjuryRecoveryModal from "@/components/settings/InjuryRecoveryModal";
import { useAuth } from "@/components/AuthProvider";
import {
  getBodyAreaLabel,
  getRestrictionLabels,
  getRestrictionsForBodyArea,
  INJURY_BODY_AREAS,
  type InjuryBodyArea,
} from "@/lib/domain/injuryManagement";
import { useInjuryState } from "@/lib/hooks/useInjuryState";
import { useProgramState } from "@/lib/hooks/useProgramState";
import {
  fieldClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/lib/ui/componentStyles";

const statusButtonClass = (selected: boolean) =>
  `w-full rounded-xl border p-4 text-left transition ${
    selected
      ? "border-accent bg-accent-soft ring-2 ring-accent"
      : "border-border bg-surface-muted hover:bg-surface-accent"
  }`;

export default function InjuryManagementPanel() {
  const { isCoachReadOnly } = useAuth();
  const { currentWeek } = useProgramState();
  const {
    profile,
    isActive,
    setManagingInjury,
    setNormalTraining,
    saveNotes,
    recoverFromInjury,
  } = useInjuryState();

  const [selectedArea, setSelectedArea] = useState<InjuryBodyArea | "">(
    profile.bodyArea ?? ""
  );
  const [notes, setNotes] = useState(profile.notes ?? "");
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  useEffect(() => {
    setSelectedArea(profile.bodyArea ?? "");
    setNotes(profile.notes ?? "");
  }, [profile]);

  const restrictions =
    selectedArea !== ""
      ? getRestrictionsForBodyArea(selectedArea)
      : profile.bodyArea
        ? getRestrictionsForBodyArea(profile.bodyArea)
        : [];

  function handleEnableInjuryMode() {
    if (!selectedArea || isCoachReadOnly) {
      return;
    }

    setManagingInjury(selectedArea, notes);
  }

  function handleSaveNotes() {
    if (isCoachReadOnly) {
      return;
    }

    saveNotes(notes);
  }

  return (
    <div className="space-y-4">
      <Card title="Current Status">
        <div className="space-y-2">
          <button
            type="button"
            disabled={isCoachReadOnly}
            onClick={() => setNormalTraining()}
            className={statusButtonClass(!isActive)}
          >
            <p className="font-semibold text-foreground">Normal Training</p>
            <p className="mt-1 text-sm text-muted">
              Default state with no training modifications.
            </p>
          </button>

          {isActive ? (
            <div className="rounded-xl border border-accent bg-accent-soft p-4">
              <p className="font-semibold text-foreground">Managing Injury</p>
              <p className="mt-1 text-sm text-muted">
                Program stays active while generated workouts are adjusted.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface-muted p-4">
              <p className="font-semibold text-foreground">Managing Injury</p>
              <p className="mt-1 text-sm text-muted">
                Select an injured area below, then enable injury mode.
              </p>
            </div>
          )}
        </div>

        {isActive && profile.bodyArea && (
          <div className="mt-4 rounded-xl border border-border bg-surface-muted p-4 text-sm">
            <p className="font-semibold text-foreground">Status: Managing Injury</p>
            {profile.startedAt && (
              <p className="mt-1 text-muted">Started: {profile.startedAt}</p>
            )}
            <p className="mt-1 text-muted">
              Injured Area: {getBodyAreaLabel(profile.bodyArea)}
            </p>
            <p className="mt-2 text-xs text-muted">
              Regenerate upcoming schedules to apply injury adjustments.
            </p>
          </div>
        )}
      </Card>

      <Card title="Injury Setup">
        <p className="-mt-1 mb-3 text-sm text-muted">
          Choose the affected area. This helps adjust future workout generation.
        </p>

        <div className="space-y-2">
          {INJURY_BODY_AREAS.map((area) => {
            const isSelected =
              selectedArea === area.id ||
              (isActive && profile.bodyArea === area.id);

            return (
              <button
                key={area.id}
                type="button"
                disabled={isCoachReadOnly}
                onClick={() => setSelectedArea(area.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  isSelected
                    ? "border-accent bg-accent-soft ring-1 ring-accent"
                    : "border-border bg-surface-muted hover:bg-surface-accent"
                }`}
              >
                <span className="font-medium text-foreground">{area.label}</span>
              </button>
            );
          })}
        </div>

        {!isActive && selectedArea && !isCoachReadOnly && (
          <button
            type="button"
            onClick={handleEnableInjuryMode}
            className={`mt-4 w-full ${primaryButtonClassName}`}
          >
            Enable Injury Mode
          </button>
        )}
      </Card>

      {restrictions.length > 0 && (
        <Card title="Training Restrictions">
          <p className="-mt-1 mb-3 text-sm text-muted">
            Future generated workouts will reduce or avoid these categories. Your
            program plan stays intact underneath.
          </p>
          <ul className="space-y-2">
            {getRestrictionLabels(restrictions).map((label) => (
              <li
                key={label}
                className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground"
              >
                {label}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">
            Still allowed: upper body strength, core, mobility, and
            rehab-compatible sessions where appropriate.
          </p>
        </Card>
      )}

      <Card title="Injury Notes">
        <p className="-mt-1 mb-3 text-sm text-muted">
          Optional notes for your own reference.
        </p>
        <textarea
          value={notes}
          disabled={isCoachReadOnly}
          onChange={(event) => setNotes(event.target.value)}
          onBlur={handleSaveNotes}
          placeholder='Example: "Grade 1 hamstring strain"'
          rows={4}
          className={`${fieldClassName} resize-none`}
        />
      </Card>

      {isActive && !isCoachReadOnly && (
        <button
          type="button"
          onClick={() => setShowRecoveryModal(true)}
          className={`w-full ${secondaryButtonClassName}`}
        >
          Mark As Recovered
        </button>
      )}

      {showRecoveryModal && (
        <InjuryRecoveryModal
          currentWeek={currentWeek}
          onSelect={(option) => {
            recoverFromInjury(option);
            setShowRecoveryModal(false);
          }}
          onCancel={() => setShowRecoveryModal(false)}
        />
      )}
    </div>
  );
}
