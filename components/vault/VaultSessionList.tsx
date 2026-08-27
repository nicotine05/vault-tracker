"use client";

import Card from "@/components/Card";
import type { Jump, Pole, VaultSession, VaultStepReferences } from "@/lib/domain/types";
import {
  countJumpGrades,
  filterVaultSessionsByWeek,
  getGradeEmoji,
  getRunReference,
  getVaultWeekOptions,
} from "@/lib/domain/vaultLog";
import {
  formatPolePickerLabel,
  formatPoleShortLabel,
  formatPoleTitle,
  getPoleById,
} from "@/lib/domain/poleInventory";
import PoleBrandAccent from "@/components/vault/poles/PoleBrandAccent";

type VaultSessionListProps = {
  sessions: VaultSession[];
  stepRefs: VaultStepReferences;
  poles: Pole[];
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
  poles,
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
                        poles={poles}
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
  poles,
}: {
  jump: Jump;
  stepRefs: VaultStepReferences;
  poles: Pole[];
}) {
  const reference = getRunReference(jump.run, stepRefs);
  const pole = getPoleById(poles, jump.poleId);
  const poleDisplay = pole
    ? formatPolePickerLabel(pole)
    : jump.poleLabel;

  return (
    <div className="rounded-lg border border-border bg-surface-muted p-3 text-foreground">
      <div className="flex flex-wrap items-center gap-2">
        <span>{getGradeEmoji(jump.grade)}</span>
        <span>{jump.run}</span>
        {reference && (
          <span className="text-xs text-accent-text">({reference})</span>
        )}
        <span>{jump.grip}</span>
        <span>{jump.takeoff}</span>
        {poleDisplay && (
          <span className="flex items-center gap-1 text-xs text-muted">
            {pole && <PoleBrandAccent brandId={pole.brandId} className="h-2 w-2" />}
            {poleDisplay}
          </span>
        )}
      </div>

      {jump.comment && (
        <p className="mt-1 text-sm text-muted">{jump.comment}</p>
      )}

      {(pole || jump.poleLabel) && (
        <div className="mt-3 rounded-lg border border-border/60 bg-surface px-3 py-2 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Pole Used
          </p>
          {pole ? (
            <>
              <p className="mt-1 flex items-center gap-2 font-medium text-foreground">
                <PoleBrandAccent brandId={pole.brandId} />
                {formatPoleTitle(pole)}
              </p>
              <p className="text-muted">{formatPoleShortLabel(pole)}</p>
              {pole.flex && <p className="text-muted">Flex {pole.flex}</p>}
            </>
          ) : (
            <p className="mt-1 font-medium text-foreground">{jump.poleLabel}</p>
          )}
        </div>
      )}
    </div>
  );
}
