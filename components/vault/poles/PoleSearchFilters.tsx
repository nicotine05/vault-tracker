"use client";

import type { RefObject } from "react";
import type { PoleFilters } from "@/lib/domain/poleInventory";
import {
  EMPTY_POLE_FILTERS,
  hasActivePoleFilters,
  sanitizePoleFormDigits,
} from "@/lib/domain/poleInventory";
import { POLE_BRANDS } from "@/lib/poleCatalog";
import { fieldClassNameSm } from "@/lib/ui/componentStyles";

type PoleSearchFiltersProps = {
  filters: PoleFilters;
  onChange: (filters: PoleFilters) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
};

const compactFieldClassName =
  "rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm text-foreground";

const compactLabelClassName =
  "mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted";

export default function PoleSearchFilters({
  filters,
  onChange,
  searchInputRef,
}: PoleSearchFiltersProps) {
  const active = hasActivePoleFilters(filters);

  return (
    <div className="mt-3 space-y-3 rounded-2xl border border-border bg-surface-muted/50 p-3">
      <label className="block">
        <span className={compactLabelClassName}>Search</span>
        <input
          ref={searchInputRef}
          value={filters.search}
          onChange={(event) =>
            onChange({ ...filters, search: event.target.value })
          }
          placeholder="Brand, model, notes..."
          className={`${fieldClassNameSm} py-2 text-sm`}
        />
      </label>

      <label className="block">
        <span className={compactLabelClassName}>Brand</span>
        <select
          value={filters.brandId}
          onChange={(event) =>
            onChange({ ...filters, brandId: event.target.value })
          }
          className={`${fieldClassNameSm} py-2 text-sm`}
        >
          <option value="">Any brand</option>
          {POLE_BRANDS.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </label>

      <div>
        <span className={compactLabelClassName}>Length range</span>
        <div className="grid grid-cols-2 gap-2">
          <LengthRangeInputs
            label="Min"
            feet={filters.lengthMinFeet}
            inches={filters.lengthMinInches}
            onFeetChange={(lengthMinFeet) =>
              onChange({ ...filters, lengthMinFeet })
            }
            onInchesChange={(lengthMinInches) =>
              onChange({ ...filters, lengthMinInches })
            }
          />
          <LengthRangeInputs
            label="Max"
            feet={filters.lengthMaxFeet}
            inches={filters.lengthMaxInches}
            onFeetChange={(lengthMaxFeet) =>
              onChange({ ...filters, lengthMaxFeet })
            }
            onInchesChange={(lengthMaxInches) =>
              onChange({ ...filters, lengthMaxInches })
            }
          />
        </div>
      </div>

      <div>
        <span className={compactLabelClassName}>Weight range (lbs)</span>
        <div className="grid grid-cols-2 gap-2">
          <WeightInput
            label="Min"
            value={filters.weightMin}
            onChange={(weightMin) => onChange({ ...filters, weightMin })}
          />
          <WeightInput
            label="Max"
            value={filters.weightMax}
            onChange={(weightMax) => onChange({ ...filters, weightMax })}
          />
        </div>
      </div>

      {active && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_POLE_FILTERS)}
          className="text-xs font-semibold text-accent-text transition hover:opacity-80"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function LengthRangeInputs({
  label,
  feet,
  inches,
  onFeetChange,
  onInchesChange,
}: {
  label: string;
  feet: string;
  inches: string;
  onFeetChange: (value: string) => void;
  onInchesChange: (value: string) => void;
}) {
  return (
    <div>
      <span className="mb-1 block text-xs text-muted">{label}</span>
      <div className="flex items-center gap-1">
        <input
          value={feet}
          onChange={(event) =>
            onFeetChange(sanitizePoleFormDigits(event.target.value, 2))
          }
          inputMode="numeric"
          maxLength={2}
          placeholder="--"
          aria-label={`${label} length feet`}
          className={`${compactFieldClassName} w-10 text-center tabular-nums`}
        />
        <span className="text-xs text-muted">ft</span>
        <input
          value={inches}
          onChange={(event) =>
            onInchesChange(sanitizePoleFormDigits(event.target.value, 1))
          }
          inputMode="numeric"
          maxLength={1}
          placeholder="-"
          aria-label={`${label} length inches`}
          className={`${compactFieldClassName} w-8 text-center tabular-nums`}
        />
        <span className="text-xs text-muted">in</span>
      </div>
    </div>
  );
}

function WeightInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted">{label}</span>
      <input
        value={value}
        onChange={(event) =>
          onChange(sanitizePoleFormDigits(event.target.value, 3))
        }
        inputMode="numeric"
        maxLength={3}
        placeholder="---"
        aria-label={`${label} weight`}
        className={`${compactFieldClassName} w-full text-center tabular-nums`}
      />
    </label>
  );
}
