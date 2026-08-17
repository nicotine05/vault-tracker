"use client";

type ScheduleWarningModalProps = {
  warnings: string[];
  onContinue: () => void;
  onCancel: () => void;
};

function formatWarningMessage(warning: string): string {
  if (warning === "Consecutive vault days") {
    return "Consecutive vault days detected.";
  }

  if (warning === "Three consecutive Red/Black days") {
    return "High fatigue week detected — 3 consecutive high-load days.";
  }

  if (warning === "Vault should occur before Speed on the same day.") {
    return "Vault is scheduled on the same day as speed work.";
  }

  return warning;
}

export default function ScheduleWarningModal({
  warnings,
  onContinue,
  onCancel,
}: ScheduleWarningModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-warning-title"
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-xl"
      >
        <p
          id="schedule-warning-title"
          className="text-lg font-bold text-foreground"
        >
          Schedule Warnings
        </p>

        <p className="mt-1 text-sm text-muted">
          Advisory only — you can still generate your schedule.
        </p>

        <ul className="mt-4 space-y-2">
          {warnings.map((warning) => (
            <li
              key={warning}
              className="rounded-lg border border-amber-200/80 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 [data-theme=dark]:border-amber-500/30 [data-theme=dark]:bg-amber-500/15 [data-theme=dark]:text-amber-200"
            >
              {formatWarningMessage(warning)}
            </li>
          ))}
        </ul>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
