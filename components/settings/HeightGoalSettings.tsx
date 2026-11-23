"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import VaultHeightInput from "@/components/vault/VaultHeightInput";
import { useAuth } from "@/components/AuthProvider";
import { useVaultHeightGoal } from "@/lib/hooks/useVaultHeightGoal";

export default function HeightGoalSettings() {
  const { isCoachReadOnly } = useAuth();
  const { goalHeight, saveGoalHeight } = useVaultHeightGoal();
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(goalHeight);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setDraft(goalHeight);
  }, [goalHeight]);

  const dirty = draft !== goalHeight;

  return (
    <Card>
      <button
        type="button"
        onClick={() => {
          setExpanded((current) => !current);
          setDraft(goalHeight);
          setMessage(null);
        }}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold text-foreground">Height Goal</p>
            <span className="text-muted">{expanded ? "▾" : "▸"}</span>
          </div>
          {!expanded && (
            <p className="mt-1 text-sm text-muted">
              Home screen goal · {goalHeight}
            </p>
          )}
        </div>
      </button>

      {expanded && (
        <fieldset
          disabled={isCoachReadOnly}
          className="mt-4 space-y-3 border-0 p-0"
        >
          <p className="text-sm text-muted">
            Sets the target height used for goal progress on Home and Progress.
          </p>

          <div className="rounded-xl border border-border bg-surface-muted p-3">
            <p className="mb-2 text-sm font-medium text-foreground">
              Goal height
            </p>
            <VaultHeightInput
              value={draft}
              onChange={(value) => {
                setDraft(value);
                setMessage(null);
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              saveGoalHeight(draft);
              setMessage("Height goal saved.");
            }}
            disabled={!dirty}
            className="w-full rounded-xl bg-accent p-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save height goal
          </button>

          {message && (
            <p className="text-center text-xs text-muted">{message}</p>
          )}
        </fieldset>
      )}
    </Card>
  );
}
