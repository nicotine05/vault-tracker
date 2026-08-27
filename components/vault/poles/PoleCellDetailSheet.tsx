"use client";

import type { Pole } from "@/lib/domain/types";
import {
  formatPoleLengthRangeDisplay,
  formatPoleShortLabel,
  formatPoleTitle,
  formatPoleWeightRangeDisplay,
  formatWishlistModelLabel,
  isWishlistPole,
} from "@/lib/domain/poleInventory";
import type { ProgressionCellContents } from "@/lib/domain/poleProgression";
import PoleBrandAccent from "@/components/vault/poles/PoleBrandAccent";
import { secondaryButtonClassName, todayBadgeClassName } from "@/lib/ui/componentStyles";

type PoleCellDetailSheetProps = {
  contents: ProgressionCellContents;
  length: string;
  weight: number;
  onViewPole: (pole: Pole) => void;
  onClose: () => void;
};

export default function PoleCellDetailSheet({
  contents,
  length,
  weight,
  onViewPole,
  onClose,
}: PoleCellDetailSheetProps) {
  const totalCount = contents.owned.length + contents.wishlist.length;

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
              {length} · {weight} lbs
            </p>
            <p className="text-sm text-muted">
              {totalCount} item{totalCount === 1 ? "" : "s"} in this slot
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

        <div className="space-y-4">
          {contents.owned.length > 0 && (
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Owned
              </p>
              <div className="space-y-2">
                {contents.owned.map((pole) => (
                  <CellPoleCard key={pole.id} pole={pole} onViewPole={onViewPole} />
                ))}
              </div>
            </section>
          )}

          {contents.wishlist.length > 0 && (
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Wishlist
              </p>
              <div className="space-y-2">
                {contents.wishlist.map((pole) => (
                  <CellPoleCard key={pole.id} pole={pole} onViewPole={onViewPole} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function CellPoleCard({
  pole,
  onViewPole,
}: {
  pole: Pole;
  onViewPole: (pole: Pole) => void;
}) {
  const wishlist = isWishlistPole(pole);

  return (
    <div
      className={`rounded-xl border p-3 ${
        wishlist
          ? "border-amber-300/60 bg-amber-500/5 [data-theme=dark]:border-amber-400/40 [data-theme=dark]:bg-amber-500/10"
          : "border-border bg-surface-muted"
      }`}
    >
      <div className="flex items-start gap-2">
        {pole.brandId ? (
          <PoleBrandAccent brandId={pole.brandId} />
        ) : (
          <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-border" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground">{formatPoleTitle(pole)}</p>
            {wishlist && (
              <span className={`${todayBadgeClassName} normal-case`}>Wishlist</span>
            )}
          </div>
          <p className="text-sm text-muted">
            {wishlist
              ? `${formatPoleLengthRangeDisplay(pole)} · ${formatPoleWeightRangeDisplay(pole)}`
              : formatPoleShortLabel(pole)}
          </p>
          {wishlist && (
            <p className="mt-0.5 text-xs text-muted">
              {formatWishlistModelLabel(pole)}
            </p>
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
  );
}
