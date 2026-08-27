"use client";

import type { Pole } from "@/lib/domain/types";
import {
  formatPoleShortLabel,
  formatPoleTitle,
} from "@/lib/domain/poleInventory";
import { secondaryButtonClassName } from "@/lib/ui/componentStyles";

type PoleCardProps = {
  pole: Pole;
  onViewDetails: (pole: Pole) => void;
};

export default function PoleCard({ pole, onViewDetails }: PoleCardProps) {
  const retired = Boolean(pole.retired);

  return (
    <div
      className={`rounded-2xl border border-border-accent bg-gradient-to-br from-surface via-surface-muted to-surface-accent p-4 shadow-sm ${
        retired ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-bold text-foreground">
            {formatPoleShortLabel(pole)}
          </p>
          <p className="mt-0.5 text-sm text-muted">{formatPoleTitle(pole)}</p>
          {pole.flex && (
            <p className="mt-2 text-sm text-foreground">Flex {pole.flex}</p>
          )}
          {retired && (
            <span className="mt-2 inline-block rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
              Retired
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onViewDetails(pole)}
        className={`${secondaryButtonClassName} mt-4 py-2 text-sm`}
      >
        View Details
      </button>
    </div>
  );
}
