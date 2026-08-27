"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import PoleBagSection from "@/components/vault/poles/PoleBagSection";
import PoleCard from "@/components/vault/poles/PoleCard";
import PoleDetailSheet from "@/components/vault/poles/PoleDetailSheet";
import PoleEmptyState from "@/components/vault/poles/PoleEmptyState";
import PoleFormSheet from "@/components/vault/poles/PoleFormSheet";
import PoleSearchFilters from "@/components/vault/poles/PoleSearchFilters";
import {
  EMPTY_POLE_FILTERS,
  emptyPoleForm,
  filterPoles,
  poleToFormValues,
} from "@/lib/domain/poleInventory";
import type { Pole } from "@/lib/domain/types";
import { usePoleInventoryState } from "@/lib/hooks/usePoleInventoryState";
import { primaryButtonClassName } from "@/lib/ui/componentStyles";

type SheetMode =
  | { type: "add" }
  | { type: "edit"; poleId: string }
  | { type: "detail"; pole: Pole };

export default function PoleInventoryPage() {
  const { isCoachReadOnly } = useAuth();
  const {
    poles,
    bags,
    addPole,
    updatePole,
    deletePole,
    addBag,
    deleteBag,
    addPoleToBag,
    removePoleFromBag,
  } = usePoleInventoryState();

  const [filters, setFilters] = useState(EMPTY_POLE_FILTERS);
  const [sheetMode, setSheetMode] = useState<SheetMode | null>(null);
  const [formValues, setFormValues] = useState(emptyPoleForm());

  const filteredPoles = useMemo(
    () => filterPoles(poles, filters),
    [poles, filters]
  );

  function openAddPole() {
    setFormValues(emptyPoleForm());
    setSheetMode({ type: "add" });
  }

  function openEditPole(pole: Pole) {
    setFormValues(poleToFormValues(pole));
    setSheetMode({ type: "edit", poleId: pole.id });
  }

  function handleSubmitPole() {
    if (sheetMode?.type === "add") {
      addPole(formValues);
      setSheetMode(null);
      return;
    }

    if (sheetMode?.type === "edit") {
      updatePole(sheetMode.poleId, formValues);
      setSheetMode(null);
    }
  }

  function handleDeletePole(pole: Pole) {
    if (!confirm(`Delete ${pole.length} ${pole.weightRating}? Historical logs will keep this pole reference.`)) {
      return;
    }

    deletePole(pole.id);
    setSheetMode(null);
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-20">
      <Link
        href="/vault"
        className="text-sm text-accent-text transition hover:opacity-80"
      >
        ← Vault
      </Link>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pole Inventory</h1>
          <p className="mt-1 text-sm text-muted">
            Your poles, bags, and quick references for practice and meets.
          </p>
        </div>
      </div>

      {!isCoachReadOnly && (
        <button
          type="button"
          onClick={openAddPole}
          className={`${primaryButtonClassName} mt-5`}
        >
          Add Pole
        </button>
      )}

      {poles.length === 0 ? (
        <div className="mt-6">
          <PoleEmptyState
            onAddFirstPole={openAddPole}
            readOnly={isCoachReadOnly}
          />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <PoleSearchFilters
            poles={poles}
            filters={filters}
            onChange={setFilters}
          />

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              {filteredPoles.length} Pole{filteredPoles.length === 1 ? "" : "s"}
            </h2>

            {filteredPoles.length === 0 ? (
              <p className="text-sm text-muted">
                No poles match your filters.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredPoles.map((pole) => (
                  <PoleCard
                    key={pole.id}
                    pole={pole}
                    onViewDetails={(selected) =>
                      setSheetMode({ type: "detail", pole: selected })
                    }
                  />
                ))}
              </div>
            )}
          </section>

          <PoleBagSection
            poles={poles}
            bags={bags}
            readOnly={isCoachReadOnly}
            onAddBag={addBag}
            onDeleteBag={deleteBag}
            onAddPoleToBag={addPoleToBag}
            onRemovePoleFromBag={removePoleFromBag}
          />
        </div>
      )}

      {sheetMode?.type === "detail" && (
        <PoleDetailSheet
          pole={sheetMode.pole}
          readOnly={isCoachReadOnly}
          onEdit={() => openEditPole(sheetMode.pole)}
          onDelete={() => handleDeletePole(sheetMode.pole)}
          onClose={() => setSheetMode(null)}
        />
      )}

      {(sheetMode?.type === "add" || sheetMode?.type === "edit") && (
        <PoleFormSheet
          title={sheetMode.type === "add" ? "Add Pole" : "Edit Pole"}
          values={formValues}
          onChange={setFormValues}
          onSubmit={handleSubmitPole}
          onClose={() => setSheetMode(null)}
          submitLabel={sheetMode.type === "add" ? "Add Pole" : "Save Changes"}
        />
      )}
    </main>
  );
}
