"use client";

import type { PoleFilters } from "@/lib/domain/poleInventory";
import {
  getUniquePoleBrandIds,
  getUniquePoleLengths,
  getUniquePoleWeights,
} from "@/lib/domain/poleInventory";
import type { Pole } from "@/lib/domain/types";
import { getBrandName, POLE_BRANDS } from "@/lib/poleCatalog";
import PoleBrandAccent from "@/components/vault/poles/PoleBrandAccent";
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
  const brandIds = getUniquePoleBrandIds(poles);
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
          value={filters.brandId}
          options={brandIds.map((brandId) => ({
            value: brandId,
            label: getBrandName(brandId),
          }))}
          onChange={(brandId) => onChange({ ...filters, brandId })}
        />
        <FilterSelect
          label="Length"
          value={filters.length}
          options={lengths.map((length) => ({ value: length, label: length }))}
          onChange={(length) => onChange({ ...filters, length })}
        />
        <FilterSelect
          label="Weight"
          value={filters.weightRating}
          options={weights.map((weight) => ({ value: weight, label: weight }))}
          onChange={(weightRating) => onChange({ ...filters, weightRating })}
        />
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {POLE_BRANDS.map((brand) => (
          <button
            key={brand.id}
            type="button"
            onClick={() =>
              onChange({
                ...filters,
                brandId: filters.brandId === brand.id ? "" : brand.id,
              })
            }
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
              filters.brandId === brand.id
                ? "border-accent bg-accent-soft text-accent-text"
                : "border-border bg-surface text-muted hover:bg-surface-accent"
            }`}
          >
            <PoleBrandAccent brandId={brand.id} className="h-2 w-2" />
            {brand.name}
          </button>
        ))}
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
  options: Array<{ value: string; label: string }>;
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
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
