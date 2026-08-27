"use client";

import type { Pole } from "@/lib/domain/types";
import {
  formatPoleBrandLabel,
  formatPoleLengthDisplay,
  formatPoleShortLabel,
  formatPoleWeightDisplay,
} from "@/lib/domain/poleInventory";
import PoleBrandAccent from "@/components/vault/poles/PoleBrandAccent";
import { secondaryButtonClassName } from "@/lib/ui/componentStyles";

type PoleCellDetailSheetProps = {
  poles: Pole[];
  length: string;
  weight: number;
  onViewPole: (pole: Pole) => void;
  onClose: () => void;
};

export default function PoleCellDetailSheet({
  poles,
  length,
  weight,
  onViewPole,
  onClose,
}: PoleCellDetailSheetProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-foreground">
              {formatPoleLengthDisplay(length)} · {formatPoleWeightDisplay(weight)}
            </p>
            <p className="text-sm text-muted">
              {poles.length} pole{poles.length === 1 ? "" : "s"} in this slot
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted transition hover:text-foreground"
          >
            Close
          </button>
        </div>

        <div className="space-y-2">
          {poles.map((pole) => (
            <div
              key={pole.id}
              className="rounded-xl border border-border bg-surface-muted p-3"
            >
              <div className="flex items-start gap-2">
                <PoleBrandAccent brandId={pole.brandId} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">
                    {formatPoleBrandLabel(pole)}
                  </p>
                  <p className="text-sm text-muted">{formatPoleShortLabel(pole)}</p>
                  {pole.carbonFiber && (
                    <p className="mt-1 text-xs text-muted">Carbon fiber</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onViewPole(pole)}
                className={`${secondaryButtonClassName} mt-3 py-2 text-sm`}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
