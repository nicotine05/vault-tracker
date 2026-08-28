"use client";

import { Fragment, useMemo, type CSSProperties } from "react";
import type { Pole } from "@/lib/domain/types";
import type { PoleSourceFilter } from "@/lib/domain/poleInventory";
import {
  buildProgressionGrid,
  computeProgressionAxesFromPoles,
  getCellBrandColors,
  getPrimaryCellBrandColor,
  getProgressionCellKey,
  type ProgressionCellContents,
} from "@/lib/domain/poleProgression";

type PoleProgressionGridProps = {
  poles: Pole[];
  sourceFilter: PoleSourceFilter;
  onSelectCell: (
    contents: ProgressionCellContents,
    length: string,
    weight: number
  ) => void;
};

export default function PoleProgressionGrid({
  poles,
  sourceFilter,
  onSelectCell,
}: PoleProgressionGridProps) {
  const showOwned = sourceFilter === "inventory" || sourceFilter === "both";
  const showWishlist = sourceFilter === "wishlist" || sourceFilter === "both";

  const axes = useMemo(
    () =>
      computeProgressionAxesFromPoles(poles, {
        includeOwned: showOwned,
        includeWishlist: showWishlist,
      }),
    [poles, showOwned, showWishlist]
  );

  const grid = useMemo(
    () => buildProgressionGrid(poles, axes),
    [poles, axes]
  );

  const rows = axes.weights;
  const columns = axes.lengths;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
      <div className="min-w-max">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `56px repeat(${columns.length}, minmax(48px, 1fr))`,
          }}
        >
          <div className="sticky left-0 z-20 border-b border-r border-border/60 bg-surface-muted px-2 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted">
            Wt
          </div>
          {columns.map((length) => (
            <div
              key={length}
              className="border-b border-border/60 bg-surface-muted px-1 py-2 text-center text-[10px] font-semibold text-foreground"
            >
              {length}
            </div>
          ))}

          {rows.map((weight) => (
            <Fragment key={weight}>
              <div className="sticky left-0 z-10 flex items-center border-r border-border/60 bg-surface px-2 py-2 text-xs font-semibold text-foreground">
                {weight}
              </div>
              {columns.map((length) => {
                const key = getProgressionCellKey(length, weight);
                const cell = key
                  ? (grid.get(key) ?? { owned: [], wishlist: [] })
                  : { owned: [], wishlist: [] };
                const visibleOwned = showOwned ? cell.owned : [];
                const visibleWishlist = showWishlist ? cell.wishlist : [];
                const populated =
                  visibleOwned.length > 0 || visibleWishlist.length > 0;

                return (
                  <ProgressionCell
                    key={`${length}-${weight}`}
                    owned={visibleOwned}
                    wishlist={visibleWishlist}
                    populated={populated}
                    onSelect={() => {
                      if (populated) {
                        onSelectCell(
                          { owned: visibleOwned, wishlist: visibleWishlist },
                          length,
                          weight
                        );
                      }
                    }}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/60 px-3 py-2 text-[10px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent/70" />
          Single owned
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MultiOwnedLegend />
          Multiple owned
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-flex h-3 w-3 items-center justify-center rounded-full border-2 border-dashed border-amber-500 text-[8px] font-bold text-amber-600 [data-theme=dark]:border-amber-300 [data-theme=dark]:text-amber-300">
            ★
          </span>
          Wishlist
        </span>
        <span className="text-muted/80">Tap a cell to view all poles</span>
      </div>
    </div>
  );
}

function ProgressionCell({
  owned,
  wishlist,
  populated,
  onSelect,
}: {
  owned: Pole[];
  wishlist: Pole[];
  populated: boolean;
  onSelect: () => void;
}) {
  const ownedMultiple = owned.length > 1;
  const wishlistMultiple = wishlist.length > 1;
  const mixedCell = owned.length > 0 && wishlist.length > 0;
  const hasMultiple = ownedMultiple || wishlistMultiple || mixedCell;
  const singleOwnedOnly = owned.length === 1 && wishlist.length === 0;
  const brandColor = getPrimaryCellBrandColor(owned.length > 0 ? owned : wishlist);

  let backgroundStyle: CSSProperties | undefined;
  if (populated && singleOwnedOnly && brandColor) {
    backgroundStyle = { backgroundColor: `${brandColor}14` };
  }

  return (
    <button
      type="button"
      disabled={!populated}
      onClick={onSelect}
      aria-label={
        populated
          ? `${owned.length + wishlist.length} pole${owned.length + wishlist.length === 1 ? "" : "s"} in this slot`
          : undefined
      }
      className={`relative min-h-[44px] border-b border-r border-border/40 p-1 transition ${
        populated
          ? hasMultiple
            ? "bg-accent-soft/35 ring-1 ring-inset ring-accent/25 hover:bg-accent-soft/50 [data-theme=dark]:bg-accent-soft/20 [data-theme=dark]:ring-accent/30"
            : "hover:brightness-95 [data-theme=dark]:hover:brightness-110"
          : "bg-surface-muted/30"
      }`}
      style={backgroundStyle}
    >
      {populated && (
        <div className="flex h-full flex-col items-center justify-center gap-0.5">
          {owned.length > 0 && (
            <OwnedCellMarker poles={owned} multiple={ownedMultiple} />
          )}
          {wishlist.length > 0 && (
            <WishlistCellMarker count={wishlist.length} multiple={wishlistMultiple} />
          )}
        </div>
      )}
    </button>
  );
}

function OwnedCellMarker({
  poles,
  multiple,
}: {
  poles: Pole[];
  multiple: boolean;
}) {
  if (!multiple) {
    const color = getPrimaryCellBrandColor(poles);

    return (
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color ?? undefined }}
      />
    );
  }

  const colors = getCellBrandColors(poles);
  const displayColors =
    colors.length > 0 ? colors : [getPrimaryCellBrandColor(poles) ?? "#94a3b8"];

  return <StackedBrandDots colors={displayColors} totalCount={poles.length} />;
}

function WishlistCellMarker({
  count,
  multiple,
}: {
  count: number;
  multiple: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border-2 border-dashed border-amber-500 font-bold leading-none text-amber-600 [data-theme=dark]:border-amber-300 [data-theme=dark]:text-amber-300 ${
        multiple ? "h-3.5 w-3.5 text-[9px]" : "h-3 w-3 text-[8px]"
      }`}
    >
      {multiple ? count : "★"}
    </span>
  );
}

function StackedBrandDots({
  colors,
  totalCount,
  compact = false,
}: {
  colors: string[];
  totalCount: number;
  compact?: boolean;
}) {
  const visible = colors.slice(0, 3);
  const dotSize = compact ? "h-2 w-2" : "h-2.5 w-2.5";
  const width = compact ? 14 + visible.length * 4 : 16 + visible.length * 5;

  return (
    <span
      className="relative inline-flex items-center"
      style={{ width: `${width}px`, height: compact ? "10px" : "12px" }}
    >
      {visible.map((color, index) => (
        <span
          key={`${color}-${index}`}
          className={`absolute ${dotSize} rounded-full ring-1 ring-surface`}
          style={{
            backgroundColor: color,
            left: `${index * (compact ? 4 : 5)}px`,
            zIndex: visible.length - index,
          }}
        />
      ))}
      {totalCount > visible.length && (
        <span
          className={`absolute font-bold text-accent-text ${compact ? "-right-0.5 -top-1 text-[7px]" : "-right-1 -top-1.5 text-[8px]"}`}
        >
          +{totalCount - visible.length}
        </span>
      )}
    </span>
  );
}

function MultiOwnedLegend() {
  return (
    <span className="relative inline-flex h-2.5 w-5 items-center">
      <span
        className="absolute left-0 h-2 w-2 rounded-full ring-1 ring-surface"
        style={{ backgroundColor: "#F97316" }}
      />
      <span
        className="absolute left-1.5 h-2 w-2 rounded-full ring-1 ring-surface"
        style={{ backgroundColor: "#22C55E" }}
      />
      <span
        className="absolute left-3 h-2 w-2 rounded-full ring-1 ring-surface"
        style={{ backgroundColor: "#8B5CF6" }}
      />
    </span>
  );
}
