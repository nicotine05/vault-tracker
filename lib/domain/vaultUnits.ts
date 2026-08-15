export function parseVaultPRToMeters(
  value: string | undefined | null
): number | null {
  if (!value) return null;

  const clean = value.toString().trim().toLowerCase();
  if (!clean) return null;

  const match = clean.match(/(\d+(?:\.\d+)?)ft\s*(\d+(?:\.\d+)?)in/i);
  if (match) {
    const feet = Number(match[1] || "0");
    const inches = Number(match[2] || "0");
    return (feet * 12 + inches) * 0.0254;
  }

  const ftOnlyMatch = clean.match(/(\d+(?:\.\d+)?)ft/i);
  if (ftOnlyMatch) {
    const feet = Number(ftOnlyMatch[1] || "0");
    return feet * 0.3048;
  }

  return null;
}

export function parseVaultHeight(
  value: string
): { feet: number; inches: number } | null {
  const clean = value.trim().replace(/,/g, "").toLowerCase();
  if (!clean) return null;

  const match = clean.match(/(\d+)ft\s*(\d+)in/i);
  if (match) {
    return {
      feet: Number(match[1] || "0"),
      inches: Number(match[2] || "0"),
    };
  }

  const ftOnlyMatch = clean.match(/(\d+)ft/i);
  if (ftOnlyMatch) {
    return {
      feet: Number(ftOnlyMatch[1] || "0"),
      inches: 0,
    };
  }

  return null;
}

export function splitVaultHeightParts(value: string): {
  feet: string;
  inches: string;
} {
  const parsed = parseVaultHeight(value);
  if (!parsed) {
    return { feet: "", inches: "" };
  }

  return {
    feet: String(parsed.feet),
    inches: String(parsed.inches),
  };
}

export function formatVaultHeightCanonical(feet: number, inches: number): string {
  return `${feet}ft ${inches}in`;
}

export function composeVaultHeight(feet: string, inches: string): string {
  const feetTrimmed = feet.trim();
  if (!feetTrimmed) {
    return "";
  }

  const inchValue = inches.trim() === "" ? "0" : inches.trim();
  return formatVaultHeightCanonical(Number(feetTrimmed), Number(inchValue));
}

export function formatFeetInches(totalInches: number): string {
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);

  return formatVaultHeightCanonical(feet, inches);
}

export function metersToFeetInches(meters: number): string {
  const totalInches = meters * 39.3701;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);

  return formatVaultHeightCanonical(feet, inches);
}

export function normalizeVaultPR(value: string): string {
  const parsed = parseVaultHeight(value);
  if (!parsed) return value.trim();

  return formatVaultHeightCanonical(parsed.feet, parsed.inches);
}

export function highestVaultPRMeters(
  values: string[],
  fallbackMeters: number
): number {
  return values.reduce((max, candidate) => {
    const parsed = parseVaultPRToMeters(candidate);
    if (parsed === null) return max;
    return Math.max(max, parsed);
  }, fallbackMeters);
}
