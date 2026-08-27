"use client";

import type { PoleFormValues } from "@/lib/domain/poleInventory";
import {
  getModelsForBrand,
  isPoleFormValid,
  sanitizePoleFormDigits,
  toggleWishlistBrandSelection,
  toggleWishlistModelSelection,
  withBrandSelection,
  withPoleFormKind,
} from "@/lib/domain/poleInventory";
import { POLE_BRANDS } from "@/lib/poleCatalog";
import {
  primaryButtonClassNameSm,
  secondaryButtonClassName,
  segmentedIdleClassName,
  segmentedSelectedClassName,
} from "@/lib/ui/componentStyles";

type PoleFormSheetProps = {
  title: string;
  values: PoleFormValues;
  onChange: (values: PoleFormValues) => void;
  onSubmit: () => void;
  onClose: () => void;
  submitLabel?: string;
  isEditing?: boolean;
};

const compactFieldClassName =
  "rounded-lg border border-border bg-surface-muted px-2.5 py-2 text-sm text-foreground";

const compactLabelClassName =
  "mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-muted";

const unitLabelClassName = "shrink-0 text-sm text-muted";

export default function PoleFormSheet({
  title,
  values,
  onChange,
  onSubmit,
  onClose,
  submitLabel = "Save Pole",
  isEditing = false,
}: PoleFormSheetProps) {
  const valid = isPoleFormValid(values);
  const isWishlist = values.kind === "wishlist";
  const models = values.brandId ? getModelsForBrand(values.brandId) : [];
  const wishlistModels = values.brandIds.flatMap((brandId) =>
    getModelsForBrand(brandId)
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[min(78dvh,calc(100dvh-5.5rem))] w-full max-w-md flex-col rounded-t-2xl border border-border bg-surface shadow-xl sm:max-h-[85vh] sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
          <p className="text-base font-bold text-foreground">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted transition hover:text-foreground"
          >
            Close
          </button>
        </div>

        <fieldset className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <div
            role="group"
            aria-label="Pole type"
            className="mb-3 grid grid-cols-2 gap-1 rounded-xl border border-border bg-surface-muted p-1"
          >
            {(["owned", "wishlist"] as const).map((kind) => {
              const selected = values.kind === kind;

              return (
                <button
                  key={kind}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange(withPoleFormKind(values, kind))}
                  className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${
                    selected ? segmentedSelectedClassName : segmentedIdleClassName
                  }`}
                >
                  {kind === "owned" ? "Owned Pole" : "Wishlist"}
                </button>
              );
            })}
          </div>

          {isWishlist ? (
            <WishlistFields
              values={values}
              onChange={onChange}
              wishlistModels={wishlistModels}
            />
          ) : (
            <OwnedFields
              values={values}
              onChange={onChange}
              models={models}
              isEditing={isEditing}
            />
          )}

          <label className="mt-3 block">
            <span className={compactLabelClassName}>Notes (optional)</span>
            <textarea
              value={values.notes}
              onChange={(event) =>
                onChange({ ...values, notes: event.target.value })
              }
              rows={2}
              placeholder={isWishlist ? "Budget, seller, priority..." : "Notes"}
              className={`${compactFieldClassName} w-full resize-none`}
            />
          </label>
        </fieldset>

        <div className="shrink-0 border-t border-border bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`${secondaryButtonClassName} py-2 text-sm`}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!valid}
              onClick={onSubmit}
              className={primaryButtonClassNameSm}
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OwnedFields({
  values,
  onChange,
  models,
  isEditing,
}: {
  values: PoleFormValues;
  onChange: (values: PoleFormValues) => void;
  models: ReturnType<typeof getModelsForBrand>;
  isEditing: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="block">
        <span className={compactLabelClassName}>Brand</span>
        <select
          value={values.brandId}
          onChange={(event) =>
            onChange(withBrandSelection(values, event.target.value))
          }
          className={`${compactFieldClassName} w-full`}
        >
          <option value="">Select</option>
          {POLE_BRANDS.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={compactLabelClassName}>Model</span>
        <select
          value={values.modelId}
          disabled={!values.brandId}
          onChange={(event) =>
            onChange({ ...values, modelId: event.target.value })
          }
          className={`${compactFieldClassName} w-full`}
        >
          <option value="">Select</option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </label>

      <LengthInputs
        label="Length"
        feet={values.lengthFeet}
        inches={values.lengthInches}
        onFeetChange={(lengthFeet) => onChange({ ...values, lengthFeet })}
        onInchesChange={(lengthInches) => onChange({ ...values, lengthInches })}
      />

      <WeightInput
        label="Weight"
        value={values.weightRating}
        onChange={(weightRating) => onChange({ ...values, weightRating })}
      />

      <label className="col-span-2 block">
        <span className={compactLabelClassName}>Flex (optional)</span>
        <input
          value={values.flex}
          onChange={(event) =>
            onChange({ ...values, flex: event.target.value })
          }
          placeholder="18.0"
          className={`${compactFieldClassName} w-full`}
        />
      </label>

      {isEditing && (
        <label className="col-span-2 flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface-muted px-3 py-2.5">
          <input
            type="checkbox"
            checked={values.needsReplace}
            onChange={(event) =>
              onChange({ ...values, needsReplace: event.target.checked })
            }
            className="rounded border-border"
          />
          <span className="text-sm text-foreground">Needs replaced</span>
        </label>
      )}
    </div>
  );
}

function WishlistFields({
  values,
  onChange,
  wishlistModels,
}: {
  values: PoleFormValues;
  onChange: (values: PoleFormValues) => void;
  wishlistModels: ReturnType<typeof getModelsForBrand>;
}) {
  return (
    <div className="space-y-3">
      <div>
        <span className={compactLabelClassName}>Brands (optional)</span>
        <p className="mb-2 text-xs text-muted">
          Leave unselected for any brand. Select one or more to narrow options.
        </p>
        <div className="flex flex-wrap gap-2">
          {POLE_BRANDS.map((brand) => {
            const selected = values.brandIds.includes(brand.id);

            return (
              <button
                key={brand.id}
                type="button"
                onClick={() =>
                  onChange(toggleWishlistBrandSelection(values, brand.id))
                }
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  selected
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface-muted text-foreground hover:bg-surface-accent"
                }`}
              >
                {brand.name}
              </button>
            );
          })}
        </div>
      </div>

      {wishlistModels.length > 0 && (
        <div>
          <span className={compactLabelClassName}>Models (optional)</span>
          <p className="mb-2 text-xs text-muted">
            Leave unselected for any model within chosen brands.
          </p>
          <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-border bg-surface-muted/50 p-2">
            {wishlistModels.map((model) => {
              const selected = values.modelIds.includes(model.id);

              return (
                <label
                  key={model.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-surface-accent"
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      onChange(toggleWishlistModelSelection(values, model.id))
                    }
                    className="rounded border-border"
                  />
                  <span className="text-foreground">{model.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <span className={compactLabelClassName}>Length range</span>
        <p className="mb-2 text-xs text-muted">
          Enter a single length or a min–max range (e.g. 13&apos;6 to 14&apos;0).
        </p>
        <div className="space-y-2">
          <LengthInputs
            label="From"
            feet={values.lengthFeet}
            inches={values.lengthInches}
            onFeetChange={(lengthFeet) => onChange({ ...values, lengthFeet })}
            onInchesChange={(lengthInches) =>
              onChange({ ...values, lengthInches })
            }
          />
          <LengthInputs
            label="To (optional)"
            feet={values.lengthMaxFeet}
            inches={values.lengthMaxInches}
            onFeetChange={(lengthMaxFeet) =>
              onChange({ ...values, lengthMaxFeet })
            }
            onInchesChange={(lengthMaxInches) =>
              onChange({ ...values, lengthMaxInches })
            }
          />
        </div>
      </div>

      <div>
        <span className={compactLabelClassName}>Weight range</span>
        <p className="mb-2 text-xs text-muted">
          Enter a single weight or a range (e.g. 170–175 lbs).
        </p>
        <div className="grid grid-cols-2 gap-2">
          <WeightInput
            label="From"
            value={values.weightRating}
            onChange={(weightRating) => onChange({ ...values, weightRating })}
          />
          <WeightInput
            label="To (optional)"
            value={values.weightMax}
            onChange={(weightMax) => onChange({ ...values, weightMax })}
          />
        </div>
      </div>

      <label className="block">
        <span className={compactLabelClassName}>Flex (optional)</span>
        <input
          value={values.flex}
          onChange={(event) =>
            onChange({ ...values, flex: event.target.value })
          }
          placeholder="Approx flex"
          className={`${compactFieldClassName} w-full`}
        />
      </label>
    </div>
  );
}

function LengthInputs({
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
    <div className="block">
      <span className={compactLabelClassName}>{label}</span>
      <div className="flex items-center gap-2">
        <input
          value={feet}
          onChange={(event) =>
            onFeetChange(sanitizePoleFormDigits(event.target.value, 2))
          }
          inputMode="numeric"
          maxLength={2}
          placeholder="--"
          aria-label={`${label} length feet`}
          className={`${compactFieldClassName} w-14 text-center tabular-nums`}
        />
        <span className={unitLabelClassName}>ft</span>
        <input
          value={inches}
          onChange={(event) =>
            onInchesChange(sanitizePoleFormDigits(event.target.value, 1))
          }
          inputMode="numeric"
          maxLength={1}
          placeholder="-"
          aria-label={`${label} length inches`}
          className={`${compactFieldClassName} w-10 text-center tabular-nums`}
        />
        <span className={unitLabelClassName}>in</span>
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
      <span className={compactLabelClassName}>{label}</span>
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(event) =>
            onChange(sanitizePoleFormDigits(event.target.value, 3))
          }
          inputMode="numeric"
          maxLength={3}
          placeholder="---"
          aria-label={`${label} weight`}
          className={`${compactFieldClassName} w-16 text-center tabular-nums`}
        />
        <span className={unitLabelClassName}>lbs</span>
      </div>
    </label>
  );
}
