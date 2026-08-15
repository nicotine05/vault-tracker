"use client";

import Card from "@/components/Card";
import type { PRFieldDefinition } from "@/lib/domain/prLog";
import { fieldClassName, primaryButtonClassName } from "@/lib/ui/componentStyles";

type PRInputFormProps = {
  readOnly: boolean;
  fields: PRFieldDefinition[];
  inputs: Record<string, string>;
  onInputChange: (inputKey: string, value: string) => void;
  onSave: () => void;
  saveButtonClassName?: string;
};

export default function PRInputForm({
  readOnly,
  fields,
  inputs,
  onInputChange,
  onSave,
  saveButtonClassName,
}: PRInputFormProps) {
  return (
    <Card>
      <fieldset
        disabled={readOnly}
        className="m-0 min-w-0 space-y-4 border-0 p-0"
      >
        {fields.map((field) => (
          <div key={field.inputKey}>
            <label className="mb-1 block text-sm font-medium">
              {field.label}
            </label>
            <input
              type="number"
              step={field.compare === "lower" ? "0.01" : "1"}
              value={inputs[field.inputKey] ?? ""}
              onChange={(event) =>
                onInputChange(field.inputKey, event.target.value)
              }
              placeholder={field.placeholder}
              className={fieldClassName}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={onSave}
          className={`${primaryButtonClassName} disabled:cursor-not-allowed disabled:opacity-50${saveButtonClassName ? ` ${saveButtonClassName}` : ""}`}
        >
          Update PRs
        </button>
      </fieldset>
    </Card>
  );
}
