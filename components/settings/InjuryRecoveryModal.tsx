"use client";

import { program } from "@/lib/data";
import { getPhaseNameForWeek } from "@/lib/domain/programWeek";
import { getPhaseStartWeek } from "@/lib/domain/programCycle";
import type { InjuryRecoveryOption } from "@/lib/hooks/useInjuryState";

type InjuryRecoveryModalProps = {
  currentWeek: number;
  onSelect: (option: InjuryRecoveryOption) => void;
  onCancel: () => void;
};

const recoveryOptions: {
  id: InjuryRecoveryOption;
  title: string;
  description: (currentWeek: number) => string;
}[] = [
  {
    id: "resume",
    title: "Resume Program",
    description: (currentWeek) =>
      `Continue exactly where you left off at Week ${currentWeek}.`,
  },
  {
    id: "restart-phase",
    title: "Restart Current Phase",
    description: (currentWeek) => {
      const phaseStart = getPhaseStartWeek(currentWeek);
      const phaseName = getPhaseNameForWeek(currentWeek);
      return `Restart ${phaseName} from Week ${phaseStart}. All history is kept.`;
    },
  },
  {
    id: "restart-program",
    title: "Start Entire Program Over",
    description: () =>
      `Run another ${program.totalWeeks}-week cycle from Week 1. PRs, logs, and history stay intact.`,
  },
];

export default function InjuryRecoveryModal({
  currentWeek,
  onSelect,
  onCancel,
}: InjuryRecoveryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="injury-recovery-title"
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-xl"
      >
        <p id="injury-recovery-title" className="text-lg font-bold text-foreground">
          Mark As Recovered
        </p>
        <p className="mt-1 text-sm text-muted">
          Choose how to return to training. Your PRs, logs, and history are
          always preserved.
        </p>

        <div className="mt-4 space-y-2">
          {recoveryOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className="w-full rounded-xl border border-border bg-surface-muted p-4 text-left transition hover:bg-surface-accent"
            >
              <p className="font-semibold text-foreground">{option.title}</p>
              <p className="mt-1 text-sm text-muted">
                {option.description(currentWeek)}
              </p>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="mt-4 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
