"use client";

import type { PoleFormValues } from "@/lib/domain/poleInventory";
import {
  getModelsForBrand,
  isPoleFormValid,
  sanitizePoleFormDigits,
  withBrandSelection,
} from "@/lib/domain/poleInventory";
import { POLE_BRANDS } from "@/lib/poleCatalog";
import {
  primaryButtonClassNameSm,
  secondaryButtonClassName,
} from "@/lib/ui/componentStyles";

type PoleFormSheetProps = {
  title: string;
  values: PoleFormValues;
  onChange: (values: PoleFormValues) => void;
  onSubmit: () => void;
  onClose: () => void;
  submitLabel?: string;
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
}: PoleFormSheetProps) {
  const valid = isPoleFormValid(values);
  const models = values.brandId ? getModelsForBrand(values.brandId) : [];

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

            <div className="col-span-2 block">
              <span className={compactLabelClassName}>Length</span>
              <div className="flex items-center gap-2">
                <input
                  value={values.lengthFeet}
                  onChange={(event) =>
                    onChange({
                      ...values,
                      lengthFeet: sanitizePoleFormDigits(
                        event.target.value,
                        2
                      ),
                    })
                  }
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="--"
                  aria-label="Length feet"
                  className={`${compactFieldClassName} w-14 text-center tabular-nums`}
                />
                <span className={unitLabelClassName}>ft</span>
                <input
                  value={values.lengthInches}
                  onChange={(event) =>
                    onChange({
                      ...values,
                      lengthInches: sanitizePoleFormDigits(
                        event.target.value,
                        1
                      ),
                    })
                  }
                  inputMode="numeric"
                  maxLength={1}
                  placeholder="-"
                  aria-label="Length inches"
                  className={`${compactFieldClassName} w-10 text-center tabular-nums`}
                />
                <span className={unitLabelClassName}>in</span>
              </div>
            </div>

            <div className="col-span-2 block">
              <span className={compactLabelClassName}>Weight</span>
              <div className="flex items-center gap-2">
                <input
                  value={values.weightRating}
                  onChange={(event) =>
                    onChange({
                      ...values,
                      weightRating: sanitizePoleFormDigits(
                        event.target.value,
                        3
                      ),
                    })
                  }
                  inputMode="numeric"
                  maxLength={3}
                  placeholder="---"
                  aria-label="Weight rating"
                  className={`${compactFieldClassName} w-16 text-center tabular-nums`}
                />
                <span className={unitLabelClassName}>lbs</span>
              </div>
            </div>

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
          </div>
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
