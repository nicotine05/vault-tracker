/** Normalize fancy feet/inch marks from mobile keyboards to ASCII. */
function normalizeHeightMarks(value: string): string {
  return value
    .toString()
    .trim()
    .toLowerCase()
    // Unicode fractions → ASCII; keep a space so 11¾ becomes 11 3/4.
    .replace(/\u00bc/g, " 1/4")
    .replace(/\u00bd/g, " 1/2")
    .replace(/\u00be/g, " 3/4")
    .replace(/\u2153/g, " 1/3")
    .replace(/\u2154/g, " 2/3")
    .replace(/\u215b/g, " 1/8")
    .replace(/\u215c/g, " 3/8")
    .replace(/\u215d/g, " 5/8")
    .replace(/\u215e/g, " 7/8")
    .replace(/[\u2018\u2019\u201B\u2032\u00B4`]/g, "'")
    .replace(/[\u201C\u201D\u2033]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Parse inch text: 6, 11, 11.75, 3/4, 11 3/4, 11-3/4. */
function parseInchesToken(raw: string | undefined | null): number | null {
  if (raw == null) {
    return 0;
  }

  const text = raw.trim().replace(/"/g, "").replace(/\s*in$/i, "").trim();
  if (text === "") {
    return 0;
  }

  const mixed = text.match(/^(\d+)\s*[- ]\s*(\d+)\s*\/\s*(\d+)$/);
  if (mixed) {
    const whole = Number(mixed[1]);
    const numerator = Number(mixed[2]);
    const denominator = Number(mixed[3]);
    if (
      !Number.isFinite(whole) ||
      !Number.isFinite(numerator) ||
      !Number.isFinite(denominator) ||
      denominator === 0
    ) {
      return null;
    }
    return whole + numerator / denominator;
  }

  const fractionOnly = text.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fractionOnly) {
    const numerator = Number(fractionOnly[1]);
    const denominator = Number(fractionOnly[2]);
    if (
      !Number.isFinite(numerator) ||
      !Number.isFinite(denominator) ||
      denominator === 0
    ) {
      return null;
    }
    return numerator / denominator;
  }

  const decimal = Number(text);
  if (!Number.isFinite(decimal)) {
    return null;
  }

  return decimal;
}

function feetInchesToMeters(feet: number, inches: number): number {
  return (feet * 12 + inches) * 0.0254;
}

export function parseVaultPRToMeters(
  value: string | undefined | null
): number | null {
  if (!value) return null;

  const clean = normalizeHeightMarks(value);
  if (!clean) return null;

  // Classic PR form: 12ft 6in / 12ft 11 3/4in / 12ft 11.75in
  const ftInMatch = clean.match(
    /^(\d+(?:\.\d+)?)\s*ft\s*(.*?)\s*in$/
  );
  if (ftInMatch) {
    const feet = Number(ftInMatch[1]);
    const inches = parseInchesToken(ftInMatch[2]);
    if (!Number.isFinite(feet) || inches === null) {
      return null;
    }
    return feetInchesToMeters(feet, inches);
  }

  const ftOnlyMatch = clean.match(/^(\d+(?:\.\d+)?)\s*ft$/);
  if (ftOnlyMatch) {
    const feet = Number(ftOnlyMatch[1]);
    if (!Number.isFinite(feet)) {
      return null;
    }
    return feet * 0.3048;
  }

  // Competition forms: 12' / 12'1 / 12'11 / 12'11 3/4 / 12'11-3/4 / 12'¾
  const apostropheMatch = clean.match(
    /^(\d+(?:\.\d+)?)\s*'\s*(.*?)\s*"?$/
  );
  if (apostropheMatch) {
    const feet = Number(apostropheMatch[1]);
    const inches = parseInchesToken(apostropheMatch[2]);
    if (!Number.isFinite(feet) || inches === null) {
      return null;
    }
    return feetInchesToMeters(feet, inches);
  }

  // 12-6 / 12 6 / 12 11 3/4 (feet then inches, no mark)
  const spacedMatch = clean.match(/^(\d+(?:\.\d+)?)\s*[- ]\s*(.+)$/);
  if (spacedMatch) {
    const feet = Number(spacedMatch[1]);
    const inches = parseInchesToken(spacedMatch[2]);
    if (
      !Number.isFinite(feet) ||
      inches === null ||
      inches < 0 ||
      inches >= 12
    ) {
      return null;
    }
    return feetInchesToMeters(feet, inches);
  }

  const plainFeetMatch = clean.match(/^(\d+(?:\.\d+)?)$/);
  if (plainFeetMatch) {
    return Number(plainFeetMatch[1]) * 0.3048;
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

  const inchesTrimmed = inches.trim();
  if (inchesTrimmed === "") {
    return `${Number(feetTrimmed)}ft 0in`;
  }

  return formatVaultHeightCanonical(Number(feetTrimmed), Number(inchesTrimmed));
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
