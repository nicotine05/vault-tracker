"use client";

import type { Pole, PoleBag } from "@/lib/domain/types";
import {
  ALL_POLES_BAG_ID,
  formatPoleShortLabel,
  formatPoleTitle,
  getPoleById,
  getVirtualAllPolesBag,
} from "@/lib/domain/poleInventory";
import {
  fieldClassNameSm,
  primaryButtonClassNameSm,
  secondaryButtonClassName,
} from "@/lib/ui/componentStyles";
import { useMemo, useState } from "react";

type PoleBagSectionProps = {
  poles: Pole[];
  bags: PoleBag[];
  readOnly: boolean;
  onAddBag: (name: string) => void;
  onDeleteBag: (bagId: string) => void;
  onAddPoleToBag: (bagId: string, poleId: string) => void;
  onRemovePoleFromBag: (bagId: string, poleId: string) => void;
};

export default function PoleBagSection({
  poles,
  bags,
  readOnly,
  onAddBag,
  onDeleteBag,
  onAddPoleToBag,
  onRemovePoleFromBag,
}: PoleBagSectionProps) {
  const [expandedBagId, setExpandedBagId] = useState<string | null>(null);
  const [addingToBagId, setAddingToBagId] = useState<string | null>(null);
  const [pickerQuery, setPickerQuery] = useState("");
  const [newBagName, setNewBagName] = useState("");
  const [showNewBagForm, setShowNewBagForm] = useState(false);

  const allBags = useMemo(
    () => [getVirtualAllPolesBag(poles), ...bags],
    [poles, bags]
  );

  function handleCreateBag() {
    const trimmed = newBagName.trim();
    if (!trimmed) {
      return;
    }

    onAddBag(trimmed);
    setNewBagName("");
    setShowNewBagForm(false);
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">Pole Bags</h2>
        {!readOnly && (
          <button
            type="button"
            onClick={() => setShowNewBagForm((current) => !current)}
            className="rounded-xl border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-surface-muted"
          >
            + New Bag
          </button>
        )}
      </div>

      {showNewBagForm && !readOnly && (
        <div className="rounded-2xl border border-border bg-surface-muted p-3">
          <input
            value={newBagName}
            onChange={(event) => setNewBagName(event.target.value)}
            placeholder="Bag name (e.g. Competition Bag)"
            className={fieldClassNameSm}
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setShowNewBagForm(false);
                setNewBagName("");
              }}
              className={secondaryButtonClassName}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateBag}
              className={primaryButtonClassNameSm}
            >
              Create Bag
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {allBags.map((bag) => {
          const expanded = expandedBagId === bag.id;
          const isDefaultBag = bag.id === ALL_POLES_BAG_ID;
          const bagPoles = bag.poleIds
            .map((poleId) => getPoleById(poles, poleId))
            .filter((pole): pole is Pole => pole !== null);

          return (
            <div
              key={bag.id}
              className="overflow-hidden rounded-2xl border border-border-accent bg-surface shadow-sm"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedBagId(expanded ? null : bag.id)
                }
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
              >
                <div>
                  <p className="font-semibold text-foreground">{bag.name}</p>
                  <p className="text-sm text-muted">
                    {bagPoles.length} pole{bagPoles.length === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="text-muted">{expanded ? "▾" : "▸"}</span>
              </button>

              {expanded && (
                <div className="border-t border-border px-4 pb-4 pt-3">
                  {bagPoles.length === 0 ? (
                    <p className="text-sm text-muted">No poles in this bag yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {bagPoles.map((pole) => (
                        <div
                          key={pole.id}
                          className={`flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-muted px-3 py-2 ${
                            pole.retired ? "opacity-60" : ""
                          }`}
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              {formatPoleShortLabel(pole)}
                            </p>
                            <p className="text-xs text-muted">
                              {formatPoleTitle(pole)}
                            </p>
                          </div>
                          {!readOnly && !isDefaultBag && (
                            <button
                              type="button"
                              onClick={() =>
                                onRemovePoleFromBag(bag.id, pole.id)
                              }
                              className="text-xs text-red-500 [data-theme=dark]:text-red-400"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {!readOnly && !isDefaultBag && (
                    <div className="mt-3">
                      {addingToBagId === bag.id ? (
                        <BagPolePicker
                          poles={poles.filter(
                            (pole) => !bag.poleIds.includes(pole.id)
                          )}
                          query={pickerQuery}
                          onQueryChange={setPickerQuery}
                          onSelect={(poleId) => {
                            onAddPoleToBag(bag.id, poleId);
                            setAddingToBagId(null);
                            setPickerQuery("");
                          }}
                          onCancel={() => {
                            setAddingToBagId(null);
                            setPickerQuery("");
                          }}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAddingToBagId(bag.id)}
                          className={secondaryButtonClassName}
                        >
                          + Add Pole To Bag
                        </button>
                      )}
                    </div>
                  )}

                  {!readOnly && !isDefaultBag && (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(`Delete "${bag.name}"? Poles will stay in your inventory.`)
                        ) {
                          onDeleteBag(bag.id);
                          setExpandedBagId(null);
                        }
                      }}
                      className="mt-3 w-full rounded-xl border border-red-300 p-2 text-sm text-red-500 [data-theme=dark]:border-red-400/60 [data-theme=dark]:text-red-400"
                    >
                      Delete Bag
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function BagPolePicker({
  poles,
  query,
  onQueryChange,
  onSelect,
  onCancel,
}: {
  poles: Pole[];
  query: string;
  onQueryChange: (query: string) => void;
  onSelect: (poleId: string) => void;
  onCancel: () => void;
}) {
  const filtered = poles.filter((pole) => {
    if (!query.trim()) {
      return true;
    }

    const haystack = [
      pole.brand,
      pole.model,
      pole.length,
      String(pole.weightRating),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search poles..."
        className={fieldClassNameSm}
        autoFocus
      />
      <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-2 py-2 text-sm text-muted">No matching poles.</p>
        ) : (
          filtered.map((pole) => (
            <button
              key={pole.id}
              type="button"
              onClick={() => onSelect(pole.id)}
              className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition hover:bg-surface-muted"
            >
              <span className="font-medium text-foreground">
                {formatPoleShortLabel(pole)}
              </span>
              <span className="text-xs text-muted">{pole.brand}</span>
            </button>
          ))
        )}
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="mt-2 w-full rounded-lg border border-border px-3 py-1.5 text-sm text-muted"
      >
        Cancel
      </button>
    </div>
  );
}
