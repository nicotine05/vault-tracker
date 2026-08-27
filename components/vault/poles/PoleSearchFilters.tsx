"use client";

import type { PoleFilters } from "@/lib/domain/poleInventory";
import {
  getUniquePoleBrands,
  getUniquePoleLengths,
  getUniquePoleWeights,
} from "@/lib/domain/poleInventory";
import type { Pole } from "@/lib/domain/types";
import { fieldClassNameSm } from "@/lib/ui/componentStyles";

type PoleSearchFiltersProps = {
  poles: Pole[];
  filters: PoleFilters;
  onChange: (filters: PoleFilters) => void;
};

export default function PoleSearchFilters({
  poles,
  filters,
  onChange,
}: PoleSearchFiltersProps) {
  const brands = getUniquePoleBrands(poles);
  const lengths = getUniquePoleLengths(poles);
  const weights = getUniquePoleWeights(poles);

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-surface-muted p-3">
      <input
        value={filters.search}
        onChange={(event) =>
          onChange({ ...filters, search: event.target.value })
        }
        placeholder="Search poles..."
        className={fieldClassNameSm}
      />

      <div className="grid grid-cols-3 gap-2">
        <FilterSelect
          label="Brand"
          value={filters.brand}
          options={brands}
          onChange={(brand) => onChange({ ...filters, brand })}
        />
        <FilterSelect
          label="Length"
          value={filters.length}
          options={lengths}
          onChange={(length) => onChange({ ...filters, length })}
        />
        <FilterSelect
          label="Weight"
          value={filters.weightRating}
          options={weights}
          onChange={(weightRating) => onChange({ ...filters, weightRating })}
        />
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-border bg-surface px-2 py-2 text-xs text-foreground"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
