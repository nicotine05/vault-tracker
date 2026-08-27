"use client";

import type { Pole } from "@/lib/domain/types";
import {
  formatPolePickerLabel,
  formatPoleSearchText,
  formatPoleShortLabel,
  formatPoleTitle,
  getPoleById,
  sortPolesForDisplay,
} from "@/lib/domain/poleInventory";
import PoleBrandAccent from "@/components/vault/poles/PoleBrandAccent";
import { fieldClassNameSm } from "@/lib/ui/componentStyles";
import { useMemo, useState } from "react";

type PolePickerProps = {
  poles: Pole[];
  recentPoleIds: string[];
  selectedPoleId?: string;
  onSelect: (poleId: string | undefined) => void;
  compact?: boolean;
};

export default function PolePicker({
  poles,
  recentPoleIds,
  selectedPoleId,
  onSelect,
  compact = false,
}: PolePickerProps) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");

  const selectedPole = getPoleById(poles, selectedPoleId);
  const recentPoles = useMemo(
    () =>
      recentPoleIds
        .map((poleId) => getPoleById(poles, poleId))
        .filter((pole): pole is Pole => pole !== null),
    [recentPoleIds, poles]
  );

  const filteredPoles = useMemo(() => {
    const sorted = sortPolesForDisplay(poles);

    if (!query.trim()) {
      return sorted;
    }

    const normalized = query.trim().toLowerCase();
    return sorted.filter((pole) =>
      formatPoleSearchText(pole).includes(normalized)
    );
  }, [poles, query]);

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className={`w-full rounded-xl border border-border bg-surface-muted text-left transition hover:bg-surface-accent ${
          compact ? "px-3 py-2 text-sm" : "p-3"
        }`}
      >
        <span className="block text-xs font-medium uppercase tracking-wide text-muted">
          Pole Used (optional)
        </span>
        <span className="mt-1 flex items-center gap-2 font-medium text-foreground">
          {selectedPole && (
            <PoleBrandAccent brandId={selectedPole.brandId} />
          )}
          {selectedPole
            ? formatPolePickerLabel(selectedPole)
            : "Tap to select a pole"}
        </span>
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Select Pole</p>
        <button
          type="button"
          onClick={() => {
            setExpanded(false);
            setQuery("");
          }}
          className="text-xs text-muted transition hover:text-foreground"
        >
          Done
        </button>
      </div>

      {recentPoles.length > 0 && (
        <div className="mb-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Recently Used
          </p>
          <div className="flex flex-wrap gap-2">
            {recentPoles.map((pole) => {
              const selected = selectedPoleId === pole.id;

              return (
                <button
                  key={pole.id}
                  type="button"
                  onClick={() => onSelect(pole.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
                    selected
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-surface-muted text-foreground hover:bg-surface-accent"
                  }`}
                >
                  <PoleBrandAccent brandId={pole.brandId} />
                  {formatPoleShortLabel(pole)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search poles..."
        className={fieldClassNameSm}
      />

      <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
        <button
          type="button"
          onClick={() => onSelect(undefined)}
          className={`flex w-full rounded-lg px-2 py-2 text-left text-sm transition hover:bg-surface-muted ${
            !selectedPoleId ? "bg-surface-accent font-medium" : ""
          }`}
        >
          No pole selected
        </button>

        {filteredPoles.map((pole) => {
          const selected = selectedPoleId === pole.id;

          return (
            <button
              key={pole.id}
              type="button"
              onClick={() => onSelect(pole.id)}
              className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition hover:bg-surface-muted ${
                selected ? "bg-surface-accent font-medium" : ""
              }`}
            >
              <span className="flex items-center gap-2 text-foreground">
                <PoleBrandAccent brandId={pole.brandId} />
                <span>
                  <span className="block">{formatPolePickerLabel(pole)}</span>
                  <span className="text-xs text-muted">
                    {formatPoleTitle(pole)}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
