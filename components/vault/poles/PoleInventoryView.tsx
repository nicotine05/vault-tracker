"use client";

import type { Pole } from "@/lib/domain/types";
import type { PoleFilters } from "@/lib/domain/poleInventory";
import { filterPoles, sortPolesForDisplay } from "@/lib/domain/poleInventory";
import PoleCondensedRow from "@/components/vault/poles/PoleCondensedRow";

type PoleInventoryViewProps = {
  poles: Pole[];
  filters: PoleFilters;
  onViewDetails: (pole: Pole) => void;
};

export default function PoleInventoryView({
  poles,
  filters,
  onViewDetails,
}: PoleInventoryViewProps) {
  const filteredPoles = sortPolesForDisplay(filterPoles(poles, filters));

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="grid grid-cols-[minmax(0,1fr)_3rem_3.5rem_2.5rem] gap-2 border-b border-border/60 bg-surface-muted px-3 py-2 pl-4 text-[10px] font-semibold uppercase tracking-wide text-muted">
        <span>Pole</span>
        <span className="text-center">Len</span>
        <span className="text-center">Wt</span>
        <span className="text-right">Flex</span>
      </div>

      {filteredPoles.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted">
          No poles match your search.
        </p>
      ) : (
        filteredPoles.map((pole) => (
          <PoleCondensedRow
            key={pole.id}
            pole={pole}
            onPress={onViewDetails}
          />
        ))
      )}
    </div>
  );
}
