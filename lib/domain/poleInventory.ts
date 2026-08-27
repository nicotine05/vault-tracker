import type { Pole, PoleBag } from "@/lib/domain/types";
import {
  normalizeProgressionLength,
  snapWeightToProgression,
} from "@/lib/domain/poleProgression";
import {
  getBrandName,
  getModelIdForCarbonChoice,
  getModelName,
  resolveBrandId,
  resolveModelId,
} from "@/lib/poleCatalog";

export const ALL_POLES_BAG_ID = "__all_poles__";
export const ALL_POLES_BAG_NAME = "All Poles";
export const MAX_RECENT_POLES = 5;

export type PoleFormValues = {
  brandId: string;
  length: string;
  weightRating: string;
  flex: string;
  carbonFiber: boolean;
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
    length: "",
    weightRating: "",
    flex: "",
    carbonFiber: false,
    notes: "",
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
  const match = compact.match(/^(\d+(?:\.\d+)?)(?:lbs?)?$/);

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

function normalizePoleLength(length: string): string {
  return parsePoleLengthInput(length) ?? normalizeProgressionLength(length);
}

function normalizePoleWeight(weightRating: string): number {
  const parsed = parsePoleWeightInput(weightRating);
  if (parsed !== null) {
    return parsed;
  }

  const fallback = Number(weightRating);
  return snapWeightToProgression(fallback) ?? fallback;
}

function inferCarbonFiber(modelId: string, explicit?: boolean): boolean {
  if (explicit !== undefined) {
    return explicit;
  }

  return modelId.toLowerCase().includes("carbon");
}

function resolveStoredModelId(
  brandId: string,
  carbonFiber: boolean,
  existingModelId?: string
): string {
  if (existingModelId) {
    const inferredCarbon = existingModelId.toLowerCase().includes("carbon");
    if (inferredCarbon === carbonFiber) {
      return existingModelId;
    }
  }

  return getModelIdForCarbonChoice(brandId, carbonFiber);
}

export function createPole(values: PoleFormValues): Pole {
  const modelId = getModelIdForCarbonChoice(values.brandId, values.carbonFiber);

  return {
    id: crypto.randomUUID(),
    brandId: values.brandId,
    modelId,
    length: normalizePoleLength(values.length),
    weightRating: normalizePoleWeight(values.weightRating),
    flex: values.flex.trim() || undefined,
    carbonFiber: values.carbonFiber,
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
  return {
    brandId: pole.brandId,
    length: formatPoleLengthInput(pole.length),
    weightRating: formatPoleWeightInput(pole.weightRating),
    flex: pole.flex ?? "",
    carbonFiber: Boolean(pole.carbonFiber),
    notes: pole.notes ?? "",
  };
}

export function applyPoleFormValues(pole: Pole, values: PoleFormValues): Pole {
  return {
    ...pole,
    brandId: values.brandId,
    modelId: resolveStoredModelId(
      values.brandId,
      values.carbonFiber,
      pole.modelId
    ),
    length: normalizePoleLength(values.length),
    weightRating: normalizePoleWeight(values.weightRating),
    flex: values.flex.trim() || undefined,
    carbonFiber: values.carbonFiber,
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
  const brand = getBrandName(pole.brandId);
  const material = pole.carbonFiber ? "Carbon" : "Composite";

  if (brand.toLowerCase().includes("pacer")) {
    return `Pacer ${material}`;
  }

  if (pole.carbonFiber) {
    return `${brand} Carbon`;
  }

  return brand;
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
    pole.carbonFiber ? "carbon fiber" : "composite",
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

  if (!brandId) {
    brandId = resolveBrandId(isString(value.brand) ? value.brand : brandId);
  }

  if (!modelId) {
    modelId = resolveModelId(
      brandId,
      isString(value.model) ? value.model : modelId
    );
  }

  const explicitCarbon =
    typeof value.carbonFiber === "boolean" ? value.carbonFiber : undefined;

  const carbonFiber = inferCarbonFiber(modelId, explicitCarbon);

  return {
    id: value.id,
    brandId,
    modelId: getModelIdForCarbonChoice(brandId, carbonFiber),
    length: normalizeProgressionLength(value.length),
    weightRating,
    flex: isString(value.flex) ? value.flex : undefined,
    carbonFiber,
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
    parsePoleLengthInput(values.length) !== null &&
    parsePoleWeightInput(values.weightRating) !== null
  );
}

export function withBrandSelection(
  values: PoleFormValues,
  brandId: string
): PoleFormValues {
  return {
    ...values,
    brandId,
  };
}
