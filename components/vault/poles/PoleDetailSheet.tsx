"use client";

import type { Pole } from "@/lib/domain/types";
import {
  formatPoleLengthRangeDisplay,
  formatPoleTitle,
  formatPoleWeightRangeDisplay,
  formatWishlistBrandLabel,
  formatWishlistModelLabel,
  isRetiredPole,
  isWishlistPole,
} from "@/lib/domain/poleInventory";
import { getBrandName, getModelName } from "@/lib/poleCatalog";
import PoleBrandAccent from "@/components/vault/poles/PoleBrandAccent";
import {
  destructiveOutlineButtonClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  todayBadgeClassName,
} from "@/lib/ui/componentStyles";

type PoleDetailSheetProps = {
  pole: Pole;
  readOnly: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRetire?: () => void;
  onUnretire?: () => void;
  onClose: () => void;
};

export default function PoleDetailSheet({
  pole,
  readOnly,
  onEdit,
  onDelete,
  onRetire,
  onUnretire,
  onClose,
}: PoleDetailSheetProps) {
  const wishlist = isWishlistPole(pole);
  const retired = isRetiredPole(pole);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-xl ${
          retired ? "opacity-95" : ""
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {pole.brandId && !retired && (
                <PoleBrandAccent brandId={pole.brandId} className="h-3 w-3" />
              )}
              <p
                className={`text-xl font-bold ${
                  retired ? "text-muted" : "text-foreground"
                }`}
              >
                {formatPoleTitle(pole)}
              </p>
              {retired && (
                <span className="rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Retired
                </span>
              )}
              {wishlist && (
                <span className={`${todayBadgeClassName} normal-case`}>Wishlist</span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted">
              {formatPoleLengthRangeDisplay(pole)} ·{" "}
              {formatPoleWeightRangeDisplay(pole)}
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

        <dl className="space-y-3 text-sm">
          {wishlist ? (
            <>
              <DetailRow label="Brands" value={formatWishlistBrandLabel(pole)} />
              <DetailRow label="Models" value={formatWishlistModelLabel(pole)} />
            </>
          ) : (
            <>
              <DetailRow label="Brand" value={getBrandName(pole.brandId)} />
              <DetailRow label="Model" value={getModelName(pole.modelId)} />
            </>
          )}
          <DetailRow label="Length" value={formatPoleLengthRangeDisplay(pole)} />
          <DetailRow label="Weight" value={formatPoleWeightRangeDisplay(pole)} />
          <DetailRow label="Flex" value={pole.flex || "—"} />
          {pole.notes && (
            <div>
              <dt className="text-muted">Notes</dt>
              <dd className="mt-1 text-foreground">{pole.notes}</dd>
            </div>
          )}
        </dl>

        {!readOnly && (
          <div className="mt-5 space-y-2">
            <button
              type="button"
              onClick={onEdit}
              className={primaryButtonClassName}
            >
              {wishlist ? "Edit Wishlist Item" : "Edit Pole"}
            </button>
            {!wishlist && !retired && onRetire && (
              <button
                type="button"
                onClick={onRetire}
                className={`${secondaryButtonClassName} py-2.5 text-sm`}
              >
                Retire Pole
              </button>
            )}
            {!wishlist && retired && onUnretire && (
              <button
                type="button"
                onClick={onUnretire}
                className={`${secondaryButtonClassName} py-2.5 text-sm`}
              >
                Restore to Inventory
              </button>
            )}
            <button
              type="button"
              onClick={onDelete}
              className={`${destructiveOutlineButtonClassName} w-full py-2.5 text-sm`}
            >
              {wishlist ? "Remove from Wishlist" : "Delete Pole"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-2">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
