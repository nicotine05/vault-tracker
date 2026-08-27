"use client";

import type { PoleSourceFilter } from "@/lib/domain/poleInventory";
import {
  segmentedIdleClassName,
  segmentedSelectedClassName,
} from "@/lib/ui/componentStyles";

type PoleSourceToggleProps = {
  value: PoleSourceFilter;
  onChange: (value: PoleSourceFilter) => void;
};

const OPTIONS: Array<{ id: PoleSourceFilter; label: string }> = [
  { id: "inventory", label: "Inventory" },
  { id: "wishlist", label: "Wishlist" },
  { id: "both", label: "Both" },
];

export default function PoleSourceToggle({
  value,
  onChange,
}: PoleSourceToggleProps) {
  return (
    <div
      role="group"
      aria-label="Show inventory, wishlist, or both"
      className="grid grid-cols-3 gap-1 rounded-2xl border border-border bg-surface-muted p-1"
    >
      {OPTIONS.map((option) => {
        const selected = value === option.id;

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
            className={`rounded-xl px-2 py-2 text-xs font-semibold transition sm:text-sm ${
              selected ? segmentedSelectedClassName : segmentedIdleClassName
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
