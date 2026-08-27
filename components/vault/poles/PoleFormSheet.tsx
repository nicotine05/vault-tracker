"use client";

import type { PoleFormValues } from "@/lib/domain/poleInventory";
import { isPoleFormValid } from "@/lib/domain/poleInventory";
import {
  fieldClassName,
  primaryButtonClassName,
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

export default function PoleFormSheet({
  title,
  values,
  onChange,
  onSubmit,
  onClose,
  submitLabel = "Save Pole",
}: PoleFormSheetProps) {
  const valid = isPoleFormValid(values);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <p className="text-lg font-bold text-foreground">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted transition hover:text-foreground"
          >
            Close
          </button>
        </div>

        <fieldset className="m-0 space-y-3 border-0 p-0">
          <input
            value={values.brand}
            onChange={(event) =>
              onChange({ ...values, brand: event.target.value })
            }
            placeholder="Brand (e.g. ESSX)"
            className={fieldClassName}
          />
          <input
            value={values.model}
            onChange={(event) =>
              onChange({ ...values, model: event.target.value })
            }
            placeholder="Model (e.g. Recoil)"
            className={fieldClassName}
          />
          <input
            value={values.length}
            onChange={(event) =>
              onChange({ ...values, length: event.target.value })
            }
            placeholder="Length (e.g. 14')"
            className={fieldClassName}
          />
          <input
            value={values.weightRating}
            onChange={(event) =>
              onChange({ ...values, weightRating: event.target.value })
            }
            placeholder="Weight rating (e.g. 170)"
            inputMode="numeric"
            className={fieldClassName}
          />
          <input
            value={values.flex}
            onChange={(event) =>
              onChange({ ...values, flex: event.target.value })
            }
            placeholder="Flex (optional, e.g. 18.0)"
            className={fieldClassName}
          />
          <textarea
            value={values.notes}
            onChange={(event) =>
              onChange({ ...values, notes: event.target.value })
            }
            placeholder="Notes (optional)"
            rows={3}
            className={fieldClassName}
          />

          <label className="flex items-center gap-2 rounded-xl border border-border bg-surface-muted px-3 py-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={values.retired}
              onChange={(event) =>
                onChange({ ...values, retired: event.target.checked })
              }
              className="h-4 w-4 rounded border-border accent-accent"
            />
            Mark as retired
          </label>
        </fieldset>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            className={secondaryButtonClassName}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!valid}
            onClick={onSubmit}
            className={primaryButtonClassName}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
