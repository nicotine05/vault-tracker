"use client";

import type { Pole } from "@/lib/domain/types";
import {
  formatPoleBrandLabel,
  formatPoleLengthDisplay,
  formatPoleWeightDisplay,
} from "@/lib/domain/poleInventory";
import { PoleBrandStripe } from "@/components/vault/poles/PoleBrandAccent";

type PoleCondensedRowProps = {
  pole: Pole;
  onPress: (pole: Pole) => void;
};

export default function PoleCondensedRow({ pole, onPress }: PoleCondensedRowProps) {
  return (
    <button
      type="button"
      onClick={() => onPress(pole)}
      className="relative flex w-full items-center gap-3 border-b border-border/60 bg-surface py-2.5 pl-3 pr-2 text-left transition hover:bg-surface-muted"
    >
      <PoleBrandStripe brandId={pole.brandId} className="w-1" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">
          {formatPoleBrandLabel(pole)}
        </p>
        {pole.serialNumber && (
          <p className="truncate text-xs text-muted">{pole.serialNumber}</p>
        )}
      </div>

      <p className="w-12 shrink-0 text-center text-sm text-foreground">
        {formatPoleLengthDisplay(pole.length)}
      </p>

      <p className="w-14 shrink-0 text-center text-sm text-foreground">
        {formatPoleWeightDisplay(pole.weightRating)}
      </p>

      <p className="w-10 shrink-0 text-right text-sm text-foreground">
        {pole.flex ?? "—"}
      </p>
    </button>
  );
}
