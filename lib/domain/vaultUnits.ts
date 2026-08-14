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

  const match = clean.match(/(\d+(?:\.\d+)?)ft\s*(\d+(?:\.\d+)?)in/i);
  if (match) {
    return {
      feet: Number(match[1] || "0"),
      inches: Number(match[2] || "0"),
    };
  }

  const ftOnlyMatch = clean.match(/(\d+(?:\.\d+)?)ft/i);
  if (ftOnlyMatch) {
    return {
      feet: Number(ftOnlyMatch[1] || "0"),
      inches: 0,
    };
  }

  return null;
}

export function formatFeetInches(totalInches: number): string {
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);

  if (inches === 0) return `${feet}ft`;
  return `${feet}ft ${inches}in`;
}

export function metersToFeetInches(meters: number): string {
  const totalInches = meters * 39.3701;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);

  if (inches === 0) return `${feet}ft`;
  return `${feet}ft ${inches}in`;
}

export function normalizeVaultPR(value: string): string {
  const parsed = parseVaultHeight(value);
  if (!parsed) return value.trim();

  const totalInches = parsed.feet * 12 + parsed.inches;
  return formatFeetInches(totalInches);
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
