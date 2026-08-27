import type { Pole, PoleBag } from "@/lib/domain/types";
import {
  normalizeProgressionLength,
  snapWeightToProgression,
} from "@/lib/domain/poleProgression";
import {
  formatPoleDisplayName,
  getBrandName,
  getDefaultModelIdForBrand,
  getModelName,
  getModelsForBrand,
  isValidBrandModelPair,
  resolveBrandId,
  resolveModelId,
} from "@/lib/poleCatalog";

export const ALL_POLES_BAG_ID = "__all_poles__";
export const ALL_POLES_BAG_NAME = "All Poles";
export const MAX_RECENT_POLES = 5;

export type PoleFormValues = {
  brandId: string;
  modelId: string;
  lengthFeet: string;
  lengthInches: string;
  weightRating: string;
  flex: string;
  notes: string;
};

export type PoleFilters = {
  search: string;
  brandId: string;
  length: string;
  weightRating: string;
};

export const EMPTY_POLE_FILTERS: PoleFilters = {
  search: "",
  brandId: "",
  length: "",
  weightRating: "",
};

export function emptyPoleForm(): PoleFormValues {
  return {
    brandId: "",
    modelId: "",
    lengthFeet: "",
    lengthInches: "",
    weightRating: "",
    flex: "",
    notes: "",
  };
}

export function sanitizePoleFormDigits(value: string, maxLength: number): string {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

export function parsePoleLengthFormValues(
  values: Pick<PoleFormValues, "lengthFeet" | "lengthInches">
): string | null {
  const feet = values.lengthFeet.trim();
  const inches = values.lengthInches.trim();

  if (!/^\d{1,2}$/.test(feet) || !/^\d$/.test(inches)) {
    return null;
  }

  return parsePoleLengthInput(`${feet}'${inches}`);
}

export function parsePoleWeightFormValue(weightRating: string): number | null {
  const digits = weightRating.trim();

  if (!/^\d{1,3}$/.test(digits)) {
    return null;
  }

  return parsePoleWeightInput(digits);
}

export function splitPoleLengthForForm(length: string): {
  lengthFeet: string;
  lengthInches: string;
} {
  const normalized = normalizeProgressionLength(length);
  const match = normalized.match(/^(\d+)'(\d+)$/);

  if (!match) {
    return { lengthFeet: "", lengthInches: "" };
  }

  return {
    lengthFeet: match[1],
    lengthInches: match[2],
  };
}

export function parsePoleLengthInput(length: string): string | null {
  const trimmed = length.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = normalizeProgressionLength(trimmed);
  if (!/^\d+'\d+$/.test(normalized)) {
    return null;
  }

  return normalized;
}

export function parsePoleWeightInput(weightRating: string): number | null {
  const compact = weightRating.trim().toLowerCase().replace(/\s+/g, "");
  const match = compact.match(/^(\d{1,3})(?:lbs?)?$/);

  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed);
}

export function formatPoleLengthInput(length: string): string {
  const normalized = normalizeProgressionLength(length);
  const match = normalized.match(/^(\d+)'(\d+)$/);

  if (match) {
    return `${match[1]}ft ${match[2]}in`;
  }

  return length;
}

export function formatPoleWeightInput(weightRating: number): string {
  return `${weightRating}lbs`;
}

function normalizePoleLengthFromForm(values: PoleFormValues): string {
  return parsePoleLengthFormValues(values) ?? "";
}

function normalizePoleWeightFromForm(weightRating: string): number {
  const parsed = parsePoleWeightFormValue(weightRating);
  if (parsed !== null) {
    return parsed;
  }

  const fallback = Number(weightRating);
  return snapWeightToProgression(fallback) ?? fallback;
}

export function createPole(values: PoleFormValues): Pole {
  return {
    id: crypto.randomUUID(),
    brandId: values.brandId,
    modelId: values.modelId,
    length: normalizePoleLengthFromForm(values),
    weightRating: normalizePoleWeightFromForm(values.weightRating),
    flex: values.flex.trim() || undefined,
    notes: values.notes.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
}

export function createPoleBag(name: string): PoleBag {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    poleIds: [],
  };
}

export function poleToFormValues(pole: Pole): PoleFormValues {
  const { lengthFeet, lengthInches } = splitPoleLengthForForm(pole.length);

  return {
    brandId: pole.brandId,
    modelId: pole.modelId,
    lengthFeet,
    lengthInches,
    weightRating: String(pole.weightRating),
    flex: pole.flex ?? "",
    notes: pole.notes ?? "",
  };
}

export function applyPoleFormValues(pole: Pole, values: PoleFormValues): Pole {
  return {
    ...pole,
    brandId: values.brandId,
    modelId: values.modelId,
    length: normalizePoleLengthFromForm(values),
    weightRating: normalizePoleWeightFromForm(values.weightRating),
    flex: values.flex.trim() || undefined,
    notes: values.notes.trim() || undefined,
  };
}

export function formatPoleShortLabel(pole: Pole): string {
  return `${formatPoleLengthDisplay(pole.length)} ${pole.weightRating}`;
}

export function formatPoleTitle(pole: Pole): string {
  return formatPoleBrandLabel(pole);
}

export function formatPoleBrandLabel(pole: Pole): string {
  return formatPoleDisplayName(pole.brandId, pole.modelId);
}

export function formatPolePickerLabel(pole: Pole): string {
  return `${getBrandName(pole.brandId)} ${formatPoleShortLabel(pole)}`;
}

export function formatPoleLengthDisplay(length: string): string {
  return formatPoleLengthInput(length);
}

export function formatPoleWeightDisplay(weightRating: number): string {
  return formatPoleWeightInput(weightRating);
}

export function formatPoleSearchText(pole: Pole): string {
  return [
    getBrandName(pole.brandId),
    getModelName(pole.modelId),
    pole.length,
    String(pole.weightRating),
    pole.flex ?? "",
    pole.notes ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

export function migrateLegacyPoleRecord(
  value: Record<string, unknown>
): Pole | null {
  if (!isString(value.id) || !isString(value.createdAt) || !isString(value.length)) {
    return null;
  }

  const weightRating = Number(value.weightRating);
  if (!Number.isFinite(weightRating)) {
    return null;
  }

  let brandId = isString(value.brandId) ? value.brandId : "";
  let modelId = isString(value.modelId) ? value.modelId : "";

  brandId = resolveBrandId(isString(value.brand) ? value.brand : brandId);
  modelId = resolveModelId(
    brandId,
    modelId || (isString(value.model) ? value.model : undefined)
  );

  return {
    id: value.id,
    brandId,
    modelId,
    length: normalizeProgressionLength(value.length),
    weightRating,
    flex: isString(value.flex) ? value.flex : undefined,
    notes: isString(value.notes) ? value.notes : undefined,
    createdAt: value.createdAt,
  };
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function getVirtualAllPolesBag(poles: Pole[]): PoleBag {
  return {
    id: ALL_POLES_BAG_ID,
    name: ALL_POLES_BAG_NAME,
    poleIds: poles.map((pole) => pole.id),
  };
}

export function buildPoleLookup(poles: Pole[]): Map<string, Pole> {
  return new Map(poles.map((pole) => [pole.id, pole]));
}

export function getPoleById(
  poles: Pole[],
  poleId: string | undefined
): Pole | null {
  if (!poleId) {
    return null;
  }

  return poles.find((pole) => pole.id === poleId) ?? null;
}

export function updateRecentPoleIds(
  current: string[],
  poleId: string
): string[] {
  const filtered = current.filter((id) => id !== poleId);
  return [poleId, ...filtered].slice(0, MAX_RECENT_POLES);
}

export function filterPoles(poles: Pole[], filters: PoleFilters): Pole[] {
  return poles.filter((pole) => {
    if (filters.search.trim()) {
      const query = filters.search.trim().toLowerCase();
      if (!formatPoleSearchText(pole).includes(query)) {
        return false;
      }
    }

    if (filters.brandId && pole.brandId !== filters.brandId) {
      return false;
    }

    if (filters.length && pole.length !== filters.length) {
      return false;
    }

    if (
      filters.weightRating &&
      String(pole.weightRating) !== filters.weightRating
    ) {
      return false;
    }

    return true;
  });
}

export function getUniquePoleBrandIds(poles: Pole[]): string[] {
  return [...new Set(poles.map((pole) => pole.brandId).filter(Boolean))].sort(
    (left, right) => getBrandName(left).localeCompare(getBrandName(right))
  );
}

export function getUniquePoleLengths(poles: Pole[]): string[] {
  return [...new Set(poles.map((pole) => pole.length).filter(Boolean))].sort();
}

export function getUniquePoleWeights(poles: Pole[]): string[] {
  return [
    ...new Set(poles.map((pole) => String(pole.weightRating))),
  ].sort((left, right) => Number(left) - Number(right));
}

export function pruneBagPoleIds(
  bag: PoleBag,
  validPoleIds: Set<string>
): PoleBag {
  return {
    ...bag,
    poleIds: bag.poleIds.filter((poleId) => validPoleIds.has(poleId)),
  };
}

export function sortPolesForDisplay(poles: Pole[]): Pole[] {
  return [...poles].sort((left, right) => {
    const brandCompare = getBrandName(left.brandId).localeCompare(
      getBrandName(right.brandId)
    );
    if (brandCompare !== 0) {
      return brandCompare;
    }

    const lengthCompare = left.length.localeCompare(right.length);
    if (lengthCompare !== 0) {
      return lengthCompare;
    }

    return left.weightRating - right.weightRating;
  });
}

export function isPoleFormValid(values: PoleFormValues): boolean {
  return (
    values.brandId !== "" &&
    values.modelId !== "" &&
    isValidBrandModelPair(values.brandId, values.modelId) &&
    parsePoleLengthFormValues(values) !== null &&
    parsePoleWeightFormValue(values.weightRating) !== null
  );
}

export function withBrandSelection(
  values: PoleFormValues,
  brandId: string
): PoleFormValues {
  return {
    ...values,
    brandId,
    modelId: getDefaultModelIdForBrand(brandId),
  };
}

export { getModelsForBrand };
