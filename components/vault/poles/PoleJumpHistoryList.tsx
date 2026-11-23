"use client";

import type { PoleJumpHistoryEntry } from "@/lib/domain/vaultLog";
import { getGradeEmoji } from "@/lib/domain/vaultLog";

type PoleJumpHistoryListProps = {
  entries: PoleJumpHistoryEntry[];
};

export default function PoleJumpHistoryList({
  entries,
}: PoleJumpHistoryListProps) {
  if (entries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-surface-muted/50 px-4 py-6 text-center text-sm text-muted">
        No jumps logged on this pole yet.
      </p>
    );
  }

  return (
    <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
      {entries.map((entry) => (
        <article
          key={`${entry.sessionId}-${entry.jumpId}`}
          className="rounded-xl border border-border bg-surface-muted/40 p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">{entry.date}</p>
            <span className="text-base" aria-hidden="true">
              {getGradeEmoji(entry.grade)}
            </span>
          </div>

          <dl className="mt-2 space-y-1 text-sm">
            <HistoryRow label="Run" value={entry.run || "—"} />
            <HistoryRow label="Grip" value={entry.grip || "—"} />
            <HistoryRow label="Takeoff" value={entry.takeoff || "—"} />
          </dl>

          {entry.comment.trim() !== "" && (
            <p className="mt-2 text-sm text-muted">{entry.comment}</p>
          )}
        </article>
      ))}
    </div>
  );
}

function HistoryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
