"use client";

import Card from "@/components/Card";
import type { Jump, VaultSession, VaultStepReferences } from "@/lib/domain/types";
import {
  countJumpGrades,
  filterVaultSessionsByWeek,
  getGradeEmoji,
  getRunReference,
  getVaultWeekOptions,
} from "@/lib/domain/vaultLog";

type VaultSessionListProps = {
  sessions: VaultSession[];
  stepRefs: VaultStepReferences;
  weekFilter: string;
  onWeekFilterChange: (week: string) => void;
  expandedSessionId: string | null;
  onToggleExpanded: (sessionId: string | null) => void;
  onDeleteSession: (sessionId: string) => void;
  readOnly: boolean;
};

export default function VaultSessionList({
  sessions,
  stepRefs,
  weekFilter,
  onWeekFilterChange,
  expandedSessionId,
  onToggleExpanded,
  onDeleteSession,
  readOnly,
}: VaultSessionListProps) {
  if (sessions.length === 0) {
    return null;
  }

  const weekOptions = getVaultWeekOptions(sessions);
  const filteredSessions = filterVaultSessionsByWeek(sessions, weekFilter);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Vault Sessions</h2>

        <select
          value={weekFilter}
          onChange={(event) => onWeekFilterChange(event.target.value)}
          className="rounded-lg border border-border bg-surface-muted px-2 py-1 text-foreground"
        >
          <option value="all">All</option>
          {weekOptions.map((week) => (
            <option key={week} value={week}>
              {week}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filteredSessions.map((session) => {
          const grades = countJumpGrades(session.jumps);
          const expanded = expandedSessionId === session.id;

          return (
            <Card key={session.id}>
              <div
                onClick={() => onToggleExpanded(expanded ? null : session.id)}
                className="cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-foreground">{session.date}</p>
                    <p className="text-sm text-muted">
                      {session.jumps.length} jumps
                    </p>
                  </div>

                  <div className="text-right">
                    <p>🟢 {grades.green}</p>
                    <p>🟡 {grades.yellow}</p>
                    <p>🔴 {grades.red}</p>
                  </div>
                </div>

                {session.keys.length > 0 && (
                  <div className="mt-2 text-sm text-muted">
                    🎯 {session.keys.join(" • ")}
                  </div>
                )}
              </div>

              {expanded && (
                <div className="mt-4 border-t border-border pt-4">
                  <div className="space-y-2">
                    {session.jumps.map((jump) => (
                      <JumpDetail
                        key={jump.id}
                        jump={jump}
                        stepRefs={stepRefs}
                      />
                    ))}
                  </div>

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => onDeleteSession(session.id)}
                      className="mt-4 w-full rounded-xl border border-red-300 p-2 text-red-500 [data-theme=dark]:border-red-400/60 [data-theme=dark]:text-red-400"
                    >
                      Delete Session
                    </button>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function JumpDetail({
  jump,
  stepRefs,
}: {
  jump: Jump;
  stepRefs: VaultStepReferences;
}) {
  const reference = getRunReference(jump.run, stepRefs);

  return (
    <div className="rounded-lg border border-border bg-surface-muted p-3 text-foreground">
      <div className="flex flex-wrap gap-2">
        <span>{getGradeEmoji(jump.grade)}</span>
        <span>{jump.run}</span>
        {reference && (
          <span className="text-xs text-accent-text">({reference})</span>
        )}
        <span>{jump.grip}</span>
        <span>{jump.takeoff}</span>
      </div>

      {jump.comment && (
        <p className="mt-1 text-sm text-muted">{jump.comment}</p>
      )}
    </div>
  );
}
