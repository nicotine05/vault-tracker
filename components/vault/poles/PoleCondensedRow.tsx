"use client";

import type { Pole } from "@/lib/domain/types";
import {
  formatPoleLengthRangeDisplay,
  formatPoleTitle,
  formatPoleWeightRangeDisplay,
  formatWishlistModelLabel,
  isWishlistPole,
} from "@/lib/domain/poleInventory";
import { PoleBrandStripe } from "@/components/vault/poles/PoleBrandAccent";
import { todayBadgeClassName } from "@/lib/ui/componentStyles";

type PoleCondensedRowProps = {
  pole: Pole;
  onPress: (pole: Pole) => void;
};

export default function PoleCondensedRow({ pole, onPress }: PoleCondensedRowProps) {
  const wishlist = isWishlistPole(pole);

  return (
    <button
      type="button"
      onClick={() => onPress(pole)}
      className={`relative flex w-full items-center gap-3 border-b border-border/60 py-2.5 pl-3 pr-2 text-left transition hover:bg-surface-muted ${
        wishlist
          ? "border-l-2 border-l-amber-400/80 bg-amber-500/5 [data-theme=dark]:border-l-amber-300/70 [data-theme=dark]:bg-amber-500/10"
          : "bg-surface"
      }`}
    >
      {pole.brandId ? (
        <PoleBrandStripe brandId={pole.brandId} className="w-1" />
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-border"
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold text-foreground">
            {formatPoleTitle(pole)}
          </p>
          {wishlist && (
            <span className={`${todayBadgeClassName} shrink-0 normal-case`}>
              Wishlist
            </span>
          )}
        </div>
        {wishlist && (
          <p className="truncate text-xs text-muted">
            {formatWishlistModelLabel(pole)}
          </p>
        )}
      </div>

      <p className="w-16 shrink-0 text-center text-sm text-foreground">
        {formatPoleLengthRangeDisplay(pole)}
      </p>

      <p className="w-16 shrink-0 text-center text-sm text-foreground">
        {formatPoleWeightRangeDisplay(pole)}
      </p>

      <p className="w-10 shrink-0 text-right text-sm text-foreground">
        {pole.flex ?? "—"}
      </p>
    </button>
  );
}
