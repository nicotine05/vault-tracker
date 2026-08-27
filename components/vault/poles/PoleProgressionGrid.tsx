"use client";

import { Fragment } from "react";
import type { Pole } from "@/lib/domain/types";
import {
  buildProgressionGrid,
  getPrimaryCellBrandColor,
  getProgressionCellKey,
  PROGRESSION_LENGTHS,
  PROGRESSION_WEIGHTS,
} from "@/lib/domain/poleProgression";

type PoleProgressionGridProps = {
  poles: Pole[];
  onSelectCell: (poles: Pole[]) => void;
};

export default function PoleProgressionGrid({
  poles,
  onSelectCell,
}: PoleProgressionGridProps) {
  const grid = buildProgressionGrid(poles);
  const rows = [...PROGRESSION_WEIGHTS];
  const columns = [...PROGRESSION_LENGTHS];

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
                const cellPoles = key ? grid.get(key) ?? [] : [];

                return (
                  <ProgressionCell
                    key={`${length}-${weight}`}
                    poles={cellPoles}
                    onSelect={() => {
                      if (cellPoles.length > 0) {
                        onSelectCell(cellPoles);
                      }
                    }}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgressionCell({
  poles,
  onSelect,
}: {
  poles: Pole[];
  onSelect: () => void;
}) {
  const populated = poles.length > 0;
  const brandColor = getPrimaryCellBrandColor(poles);

  return (
    <button
      type="button"
      disabled={!populated}
      onClick={onSelect}
      className={`relative min-h-[44px] border-b border-r border-border/40 p-1 transition ${
        populated
          ? "hover:brightness-95 [data-theme=dark]:hover:brightness-110"
          : "bg-surface-muted/30"
      }`}
      style={
        populated && brandColor
          ? { backgroundColor: `${brandColor}18` }
          : undefined
      }
    >
      {populated && (
        <div className="flex h-full flex-col items-center justify-center gap-0.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: brandColor ?? undefined }}
          />
          {poles.length > 1 && (
            <span className="text-[10px] font-bold text-foreground">
              {poles.length}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
