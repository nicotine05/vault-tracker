"use client";

import { program } from "@/lib/data";
import { getPhaseBadgeClass } from "@/lib/ui/phaseStyles";
import {
  navButtonClassName,
  programWeekHeaderActiveClassName,
  programWeekHeaderInactiveClassName,
  programWeekHeaderPlanningClassName,
  secondaryButtonClassName,
  statusBadgeActiveClassName,
  statusBadgeFutureClassName,
} from "@/lib/ui/componentStyles";

type ProgramWeekHeaderProps = {
  planningWeek: number;
  currentWeek: number;
  phaseName: string;
  isPlanning?: boolean;
  maxWeek: number;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onReturnToActiveWeek?: () => void;
};

export default function ProgramWeekHeader({
  planningWeek,
  currentWeek,
  phaseName,
  isPlanning = false,
  maxWeek,
  onPreviousWeek,
  onNextWeek,
  onReturnToActiveWeek,
}: ProgramWeekHeaderProps) {
  const isActiveWeek = planningWeek === currentWeek;
  const isFutureWeek = planningWeek > currentWeek;
  const isPastWeek = planningWeek < currentWeek;
  const showReturnToActiveWeek = !isActiveWeek;

  const headerClassName = !isActiveWeek
    ? programWeekHeaderInactiveClassName
    : isPlanning
      ? programWeekHeaderPlanningClassName
      : programWeekHeaderActiveClassName;

  return (
    <div className={`rounded-2xl border p-4 shadow-sm transition-colors ${headerClassName}`}>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPreviousWeek}
          disabled={planningWeek <= 1}
          aria-label="Previous week"
          className={navButtonClassName}
        >
          ←
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p
            className={`text-xl font-bold ${
              isActiveWeek ? "text-foreground" : "text-muted"
            }`}
          >
            Week {planningWeek}
          </p>
          <span
            className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${
              isActiveWeek
                ? getPhaseBadgeClass(phaseName)
                : "border border-border bg-surface/80 text-muted [data-theme=dark]:bg-surface/40"
            }`}
          >
            {phaseName}
          </span>

          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
            {isActiveWeek && (
              <span className={statusBadgeActiveClassName}>Active week</span>
            )}
            {isFutureWeek && (
              <span className={statusBadgeFutureClassName}>Future week</span>
            )}
            {isPastWeek && (
              <span className="rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-muted">
                Past week
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onNextWeek}
          disabled={planningWeek >= maxWeek}
          aria-label="Next week"
          className={navButtonClassName}
        >
          →
        </button>
      </div>

      {isPlanning && (
        <p className="mt-3 text-center text-sm text-muted">
          Pick your sessions, then generate your schedule.
        </p>
      )}

      {showReturnToActiveWeek && onReturnToActiveWeek && (
        <button
          type="button"
          onClick={onReturnToActiveWeek}
          className={`mt-3 ${secondaryButtonClassName}`}
        >
          Back to active week (Week {currentWeek})
        </button>
      )}

      {currentWeek >= program.totalWeeks && isActiveWeek && (
        <p className="mt-3 text-center text-xs text-muted">
          Final week of the program.
        </p>
      )}
    </div>
  );
}
