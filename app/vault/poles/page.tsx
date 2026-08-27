"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import PoleBagSection from "@/components/vault/poles/PoleBagSection";
import PoleCellDetailSheet from "@/components/vault/poles/PoleCellDetailSheet";
import PoleDetailSheet from "@/components/vault/poles/PoleDetailSheet";
import PoleEmptyState from "@/components/vault/poles/PoleEmptyState";
import PoleFormSheet from "@/components/vault/poles/PoleFormSheet";
import PoleInventoryTabs, {
  type PoleInventoryTab,
} from "@/components/vault/poles/PoleInventoryTabs";
import PoleInventoryView from "@/components/vault/poles/PoleInventoryView";
import PoleProgressionGrid from "@/components/vault/poles/PoleProgressionGrid";
import PoleSourceToggle from "@/components/vault/poles/PoleSourceToggle";
import {
  EMPTY_POLE_FILTERS,
  emptyPoleForm,
  getOwnedPoles,
  isRetiredPole,
  isWishlistPole,
  poleToFormValues,
  type PoleSourceFilter,
} from "@/lib/domain/poleInventory";
import {
  buildProgressionGrid,
  gridHasVisibleEntries,
  type ProgressionCellContents,
} from "@/lib/domain/poleProgression";
import type { Pole } from "@/lib/domain/types";
import { usePoleInventoryState } from "@/lib/hooks/usePoleInventoryState";
import { fieldClassNameSm } from "@/lib/ui/componentStyles";

type SheetMode =
  | { type: "add" }
  | { type: "edit"; poleId: string }
  | { type: "detail"; pole: Pole }
  | {
      type: "cell";
      contents: ProgressionCellContents;
      length: string;
      weight: number;
    };

export default function PoleInventoryPage() {
  const { isCoachReadOnly } = useAuth();
  const {
    poles,
    bags,
    addPole,
    updatePole,
    deletePole,
    retirePole,
    unretirePole,
    addBag,
    deleteBag,
    addPoleToBag,
    removePoleFromBag,
  } = usePoleInventoryState();

  const [activeTab, setActiveTab] = useState<PoleInventoryTab>("inventory");
  const [sourceFilter, setSourceFilter] = useState<PoleSourceFilter>("both");
  const [filters, setFilters] = useState(EMPTY_POLE_FILTERS);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [sheetMode, setSheetMode] = useState<SheetMode | null>(null);
  const [formValues, setFormValues] = useState(emptyPoleForm());

  const ownedPoles = useMemo(() => getOwnedPoles(poles), [poles]);

  const progressionGrid = useMemo(() => buildProgressionGrid(poles), [poles]);
  const gridHasEntries = useMemo(
    () =>
      gridHasVisibleEntries(progressionGrid, {
        includeOwned:
          sourceFilter === "inventory" || sourceFilter === "both",
        includeWishlist:
          sourceFilter === "wishlist" || sourceFilter === "both",
      }),
    [progressionGrid, sourceFilter]
  );

  function toggleSearch() {
    setSearchOpen((current) => {
      const next = !current;
      if (next) {
        window.setTimeout(() => searchInputRef.current?.focus(), 0);
      } else {
        setFilters((currentFilters) => ({ ...currentFilters, search: "" }));
      }
      return next;
    });
  }

  function openAddPole() {
    setFormValues(
      emptyPoleForm(
        activeTab === "progression" && sourceFilter === "wishlist"
          ? "wishlist"
          : "owned"
      )
    );
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
    const label = isWishlistPole(pole)
      ? "this wishlist item"
      : `${pole.length} ${pole.weightRating}`;

    if (
      !confirm(
        `Delete ${label}? Historical logs will keep this pole reference.`
      )
    ) {
      return;
    }

    deletePole(pole.id);
    setSheetMode(null);
  }

  function handleRetirePole(pole: Pole) {
    if (
      !confirm(
        `Retire ${pole.length} ${pole.weightRating}? It will move to the bottom of your inventory and be removed from bags and the progression chart.`
      )
    ) {
      return;
    }

    retirePole(pole.id);
    setSheetMode(null);
  }

  function handleUnretirePole(pole: Pole) {
    unretirePole(pole.id);
    setSheetMode(null);
  }

  const showSourceToggle = activeTab === "progression";
  const hasAnyPoles = poles.length > 0;

  return (
    <main className="mx-auto max-w-md p-4 pb-20">
      <Link
        href="/vault"
        className="text-sm text-accent-text transition hover:opacity-80"
      >
        ← Vault
      </Link>

      <div className="mt-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">My Poles</h1>
        <div className="flex items-center gap-2">
          {hasAnyPoles && activeTab === "inventory" && (
            <button
              type="button"
              onClick={toggleSearch}
              aria-label={searchOpen ? "Close search" : "Search poles"}
              aria-pressed={searchOpen}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${
                searchOpen || filters.search.trim()
                  ? "border-accent bg-accent-soft text-accent-text"
                  : "border-border bg-surface-muted text-muted hover:bg-surface-accent hover:text-foreground"
              }`}
            >
              <SearchIcon className="h-3.5 w-3.5" />
            </button>
          )}
          {!isCoachReadOnly && (
            <button
              type="button"
              onClick={openAddPole}
              aria-label="Add pole"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-xl font-light text-white shadow-sm transition hover:opacity-90"
            >
              +
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        <PoleInventoryTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {showSourceToggle && hasAnyPoles && (
        <div className="mt-3">
          <PoleSourceToggle value={sourceFilter} onChange={setSourceFilter} />
        </div>
      )}

      {searchOpen && activeTab === "inventory" && hasAnyPoles && (
        <label className="mt-3 block">
          <span className="sr-only">Search poles</span>
          <input
            ref={searchInputRef}
            value={filters.search}
            onChange={(event) =>
              setFilters({ ...filters, search: event.target.value })
            }
            placeholder="Search poles"
            className={`${fieldClassNameSm} py-2 text-sm`}
          />
        </label>
      )}

      {!hasAnyPoles ? (
        <div className="mt-6">
          <PoleEmptyState
            onAddFirstPole={openAddPole}
            readOnly={isCoachReadOnly}
          />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {activeTab === "inventory" && (
            <PoleInventoryView
              poles={poles}
              filters={filters}
              onViewDetails={(pole) =>
                setSheetMode({ type: "detail", pole })
              }
            />
          )}

          {activeTab === "progression" && (
            <>
              {gridHasEntries ? (
                <PoleProgressionGrid
                  poles={poles}
                  sourceFilter={sourceFilter}
                  onSelectCell={(contents, length, weight) =>
                    setSheetMode({ type: "cell", contents, length, weight })
                  }
                />
              ) : (
                <FilteredEmptyState
                  sourceFilter={sourceFilter}
                  onAdd={openAddPole}
                  readOnly={isCoachReadOnly}
                  progression
                />
              )}
            </>
          )}

          {activeTab === "bags" && (
            <PoleBagSection
              poles={ownedPoles}
              bags={bags}
              readOnly={isCoachReadOnly}
              onAddBag={addBag}
              onDeleteBag={deleteBag}
              onAddPoleToBag={addPoleToBag}
              onRemovePoleFromBag={removePoleFromBag}
            />
          )}
        </div>
      )}

      {sheetMode?.type === "cell" && (
        <PoleCellDetailSheet
          contents={sheetMode.contents}
          length={sheetMode.length}
          weight={sheetMode.weight}
          onViewPole={(pole) => setSheetMode({ type: "detail", pole })}
          onClose={() => setSheetMode(null)}
        />
      )}

      {sheetMode?.type === "detail" && (
        <PoleDetailSheet
          pole={sheetMode.pole}
          readOnly={isCoachReadOnly}
          onEdit={() => openEditPole(sheetMode.pole)}
          onDelete={() => handleDeletePole(sheetMode.pole)}
          onRetire={
            !isWishlistPole(sheetMode.pole) && !isRetiredPole(sheetMode.pole)
              ? () => handleRetirePole(sheetMode.pole)
              : undefined
          }
          onUnretire={
            isRetiredPole(sheetMode.pole)
              ? () => handleUnretirePole(sheetMode.pole)
              : undefined
          }
          onClose={() => setSheetMode(null)}
        />
      )}

      {(sheetMode?.type === "add" || sheetMode?.type === "edit") && (
        <PoleFormSheet
          title={
            sheetMode.type === "add"
              ? formValues.kind === "wishlist"
                ? "Add to Wishlist"
                : "Add Pole"
              : formValues.kind === "wishlist"
                ? "Edit Wishlist Item"
                : "Edit Pole"
          }
          values={formValues}
          onChange={setFormValues}
          onSubmit={handleSubmitPole}
          onClose={() => setSheetMode(null)}
          submitLabel={
            sheetMode.type === "add"
              ? formValues.kind === "wishlist"
                ? "Add to Wishlist"
                : "Add Pole"
              : "Save Changes"
          }
          isEditing={sheetMode.type === "edit"}
        />
      )}
    </main>
  );
}

function FilteredEmptyState({
  sourceFilter,
  onAdd,
  readOnly,
  progression = false,
}: {
  sourceFilter: PoleSourceFilter;
  onAdd: () => void;
  readOnly: boolean;
  progression?: boolean;
}) {
  const message =
    sourceFilter === "wishlist"
      ? progression
        ? "Add wishlist items with length or weight ranges to see them on the progression grid."
        : "No wishlist items yet. Add poles you're considering buying."
      : sourceFilter === "inventory"
        ? progression
          ? "Owned poles need standard progression lengths and weights (e.g. 14'0 and 170) to appear on the grid."
          : "No owned poles in inventory."
        : progression
          ? "Add owned poles or wishlist items to populate the progression grid."
          : "Nothing to show with the current filter.";

  return (
    <div className="rounded-2xl border border-dashed border-border-accent bg-surface-muted/60 px-6 py-8 text-center">
      <p className="text-sm text-muted">{message}</p>
      {!readOnly && sourceFilter !== "inventory" && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-4 text-sm font-semibold text-accent-text transition hover:opacity-80"
        >
          Add to wishlist
        </button>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M8.75 3.5a5.25 5.25 0 1 0 3.71 8.96l3.03 3.03a.75.75 0 0 0 1.06-1.06l-3.03-3.03A5.25 5.25 0 0 0 8.75 3.5Zm-3.75 5.25a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0Z"
        fill="currentColor"
      />
    </svg>
  );
}
