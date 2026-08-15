"use client";

import type { KeyboardEvent } from "react";
import {
  composeVaultHeight,
  splitVaultHeightParts,
} from "@/lib/domain/vaultUnits";

type VaultHeightInputProps = {
  value: string;
  onChange: (value: string) => void;
  onCommit?: () => void;
};

function sanitizeFeet(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 2);
}

function sanitizeInches(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 1);
}

export default function VaultHeightInput({
  value,
  onChange,
  onCommit,
}: VaultHeightInputProps) {
  const { feet, inches } = splitVaultHeightParts(value);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      onCommit?.();
    }
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        inputMode="numeric"
        maxLength={2}
        value={feet}
        onChange={(event) =>
          onChange(composeVaultHeight(sanitizeFeet(event.target.value), inches))
        }
        onKeyDown={handleKeyDown}
        placeholder="00"
        aria-label="Feet"
        className="w-9 rounded border border-border bg-surface-muted px-1 py-1 text-center text-foreground"
      />

      <span className="text-sm text-muted">ft</span>

      <input
        type="text"
        inputMode="numeric"
        maxLength={1}
        value={inches}
        onChange={(event) =>
          onChange(
            composeVaultHeight(feet, sanitizeInches(event.target.value))
          )
        }
        onKeyDown={handleKeyDown}
        placeholder="0"
        aria-label="Inches"
        className="w-7 rounded border border-border bg-surface-muted px-1 py-1 text-center text-foreground"
      />

      <span className="text-sm text-muted">in</span>
    </div>
  );
}
