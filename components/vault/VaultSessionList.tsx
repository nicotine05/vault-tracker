"use client";

import Card from "@/components/Card";
import type { Jump, Pole, VaultSession, VaultStepReferences } from "@/lib/domain/types";
import {
  countJumpGrades,
  countJumpResults,
  filterCompetitionVaultSessions,
  filterVaultSessionsByWeek,
  getCompetitionJumpTintClass,
  getCompetitionOutcomeTagClass,
  getHighestMakeBarHeight,
  getJumpOutcomeLabel,
  getRunReference,
  getVaultRecentFilterLabel,
  getVaultWeekOptions,
  isCompetitionSession,
  VAULT_SESSION_RECENT_FILTER,
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
  competitionOnly: boolean;
  onCompetitionOnlyChange: (value: boolean) => void;
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
  competitionOnly,
  onCompetitionOnlyChange,
  expandedSessionId,
  onToggleExpanded,
  onDeleteSession,
  readOnly,
}: VaultSessionListProps) {
  const scopedSessions = competitionOnly
    ? filterCompetitionVaultSessions(sessions)
    : sessions;
  const weekOptions = getVaultWeekOptions(scopedSessions);
  const filteredSessions = filterVaultSessionsByWeek(
    scopedSessions,
    weekFilter
  );
  const recentFilterLabel = getVaultRecentFilterLabel(scopedSessions);
  const isFiltered =
    (weekFilter !== "all" || competitionOnly) &&
    filteredSessions.length < sessions.length;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">Vault Sessions</h2>
        {sessions.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <span className="text-muted">Competition only</span>
              <input
                type="checkbox"
                checked={competitionOnly}
                onChange={(event) =>
                  onCompetitionOnlyChange(event.target.checked)
                }
                className="h-4 w-4 accent-[var(--accent)]"
              />
            </label>
            <select
              value={weekFilter}
              onChange={(event) => onWeekFilterChange(event.target.value)}
              className="rounded-lg border border-border bg-surface-muted px-2 py-1 text-foreground"
            >
              <option value={VAULT_SESSION_RECENT_FILTER}>
                {recentFilterLabel}
              </option>
              {weekOptions.map((week) => (
                <option key={week} value={week}>
                  {week}
                </option>
              ))}
              <option value="all">All</option>
            </select>
          </div>
        )}
      </div>

      {sessions.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-surface-muted/50 px-4 py-8 text-center text-sm text-muted">
          No vault sessions logged yet.
        </p>
      ) : (
        <>
          {isFiltered && (
            <p className="mb-3 text-sm text-muted">
              Showing {filteredSessions.length} of {sessions.length} sessions.
              {competitionOnly
                ? " Competition only."
                : " Choose a week to see older logs."}
            </p>
          )}

          {filteredSessions.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-surface-muted/50 px-4 py-8 text-center text-sm text-muted">
              {competitionOnly
                ? "No competition sessions in this view. Try another week, All, or turn off Competition only."
                : "No sessions in this view. Try another week or All."}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((session) => {
                const competition = isCompetitionSession(session);
                const grades = countJumpGrades(session.jumps);
                const results = countJumpResults(session.jumps);
                const highestMake = competition
                  ? getHighestMakeBarHeight(session.jumps)
                  : null;
                const expanded = expandedSessionId === session.id;

                return (
                  <Card
                    key={session.id}
                    className={
                      competition
                        ? "border-amber-400/70 from-amber-500/15 via-amber-500/5 to-surface"
                        : ""
                    }
                  >
                    <div
                      onClick={() =>
                        onToggleExpanded(expanded ? null : session.id)
                      }
                      className="cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-foreground">
                              {session.date}
                            </p>
                            {competition && (
                              <span className="rounded-full border border-amber-400/60 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 [data-theme-mode=dark]:text-amber-200">
                                Competition
                              </span>
                            )}
                          </div>
                          {competition && session.title && (
                            <p className="mt-0.5 font-medium text-foreground">
                              {session.title}
                            </p>
                          )}
                          <p className="text-sm text-muted">
                            {session.jumps.length} jumps
                          </p>
                          {highestMake && (
                            <p className="text-base font-bold tracking-tight text-foreground">
                              {highestMake}
                            </p>
                          )}
                        </div>

                        <div className="text-right text-sm">
                          {competition ? (
                            <>
                              <p className="font-medium text-emerald-700 [data-theme-mode=dark]:text-emerald-300">
                                Make {results.make}
                              </p>
                              <p className="font-medium text-red-700 [data-theme-mode=dark]:text-red-300">
                                Miss {results.miss}
                              </p>
                              <p className="font-medium text-muted">
                                Warmup {results.warmup}
                              </p>
                            </>
                          ) : (
                            <>
                              <p>🟢 {grades.green}</p>
                              <p>🟡 {grades.yellow}</p>
                              <p>🔴 {grades.red}</p>
                            </>
                          )}
                        </div>
                      </div>

                      {!competition && session.keys.length > 0 && (
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
                              competition={competition}
                            />
                          ))}
                        </div>

                        {!readOnly && (
                          <button
                            type="button"
                            onClick={() => onDeleteSession(session.id)}
                            className="mt-4 w-full rounded-xl border border-red-300 p-2 text-red-500 [data-theme-mode=dark]:border-red-400/60 [data-theme-mode=dark]:text-red-400"
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
          )}
        </>
      )}
    </div>
  );
}

function JumpDetail({
  jump,
  stepRefs,
  poles,
  competition,
}: {
  jump: Jump;
  stepRefs: VaultStepReferences;
  poles: Pole[];
  competition: boolean;
}) {
  const reference = getRunReference(jump.run, stepRefs);
  const pole = getPoleById(poles, jump.poleId);
  const poleDisplay = pole ? formatPolePickerLabel(pole) : jump.poleLabel;

  return (
    <div
      className={`rounded-lg border p-3 text-foreground ${
        competition
          ? getCompetitionJumpTintClass(jump.result)
          : "border-border bg-surface-muted"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {competition ? (
          <span className={getCompetitionOutcomeTagClass(jump.result)}>
            {getJumpOutcomeLabel(jump)}
          </span>
        ) : (
          <span>{getJumpOutcomeLabel(jump)}</span>
        )}
        {jump.barHeight && (
          <span className="text-lg font-bold tracking-tight text-foreground">
            {jump.barHeight}
          </span>
        )}
        {jump.standards && (
          <span className="text-sm text-muted">Std {jump.standards}</span>
        )}
        <span>{jump.run}</span>
        {reference && (
          <span className="text-xs text-accent-text">({reference})</span>
        )}
        <span>{jump.grip}</span>
        <span>{jump.takeoff}</span>
        {poleDisplay && (
          <span className="flex items-center gap-1 text-xs text-muted">
            {pole && (
              <PoleBrandAccent brandId={pole.brandId} className="h-2 w-2" />
            )}
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
