"use client";

import type { Pole } from "@/lib/domain/types";
import {
  formatPoleLengthRangeDisplay,
  formatPoleTitle,
  formatPoleWeightRangeDisplay,
  formatWishlistModelLabel,
  isRetiredPole,
  isWishlistPole,
} from "@/lib/domain/poleInventory";
import { PoleBrandStripe } from "@/components/vault/poles/PoleBrandAccent";

type PoleCondensedRowProps = {
  pole: Pole;
  onPress: (pole: Pole) => void;
};

export default function PoleCondensedRow({ pole, onPress }: PoleCondensedRowProps) {
  const wishlist = isWishlistPole(pole);
  const retired = isRetiredPole(pole);

  return (
    <button
      type="button"
      onClick={() => onPress(pole)}
      className={`relative flex w-full items-center gap-3 border-b border-border/60 py-2.5 pl-3 pr-2 text-left transition ${
        retired
          ? "bg-surface-muted/50 opacity-60 hover:bg-surface-muted/70"
          : wishlist
            ? "border-l-2 border-l-amber-400/80 bg-amber-500/5 hover:bg-amber-500/10 [data-theme=dark]:border-l-amber-300/70 [data-theme=dark]:bg-amber-500/10"
            : "bg-surface hover:bg-surface-muted"
      }`}
    >
      {pole.brandId && !retired ? (
        <PoleBrandStripe brandId={pole.brandId} className="w-1" />
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-border"
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={`truncate text-sm font-bold ${
              retired ? "text-muted" : "text-foreground"
            }`}
          >
            {formatPoleTitle(pole)}
          </p>
          {retired && (
            <span className="shrink-0 rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
              Retired
            </span>
          )}
          {wishlist && !retired && (
            <span className="shrink-0 rounded-full border border-accent/30 bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-text">
              Wishlist
            </span>
          )}
        </div>
        {wishlist && !retired && (
          <p className="truncate text-xs text-muted">
            {formatWishlistModelLabel(pole)}
          </p>
        )}
      </div>

      <p
        className={`w-16 shrink-0 text-center text-sm ${
          retired ? "text-muted" : "text-foreground"
        }`}
      >
        {formatPoleLengthRangeDisplay(pole)}
      </p>

      <p
        className={`w-16 shrink-0 text-center text-sm ${
          retired ? "text-muted" : "text-foreground"
        }`}
      >
        {formatPoleWeightRangeDisplay(pole)}
      </p>

      <p
        className={`w-10 shrink-0 text-right text-sm ${
          retired ? "text-muted" : "text-foreground"
        }`}
      >
        {pole.flex ?? "—"}
      </p>
    </button>
  );
}
