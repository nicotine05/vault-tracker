import type { Pole, PoleBag } from "@/lib/domain/types";
import {
  normalizeProgressionLength,
  snapWeightToProgression,
} from "@/lib/domain/poleProgression";
import {
  getBrandModelName,
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
  length: string;
  weightRating: string;
  flex: string;
  serialNumber: string;
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
    modelId: "",
    length: "",
    weightRating: "",
    flex: "",
    serialNumber: "",
    carbonFiber: false,
    notes: "",
  };
}

function normalizePoleLength(length: string): string {
  return normalizeProgressionLength(length);
}

function normalizePoleWeight(weightRating: string): number {
  const parsed = Number(weightRating);
  return snapWeightToProgression(parsed) ?? parsed;
}

function inferCarbonFiber(modelId: string, explicit?: boolean): boolean {
  if (explicit !== undefined) {
    return explicit;
  }

  return modelId.toLowerCase().includes("carbon");
}

export function createPole(values: PoleFormValues): Pole {
  return {
    id: crypto.randomUUID(),
    brandId: values.brandId,
    modelId: values.modelId,
    length: normalizePoleLength(values.length),
    weightRating: normalizePoleWeight(values.weightRating),
    flex: values.flex.trim() || undefined,
    serialNumber: values.serialNumber.trim() || undefined,
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
    modelId: pole.modelId,
    length: normalizeProgressionLength(pole.length),
    weightRating: String(pole.weightRating),
    flex: pole.flex ?? "",
    serialNumber: pole.serialNumber ?? "",
    carbonFiber: Boolean(pole.carbonFiber),
    notes: pole.notes ?? "",
  };
}

export function applyPoleFormValues(pole: Pole, values: PoleFormValues): Pole {
  return {
    ...pole,
    brandId: values.brandId,
    modelId: values.modelId,
    length: normalizePoleLength(values.length),
    weightRating: normalizePoleWeight(values.weightRating),
    flex: values.flex.trim() || undefined,
    serialNumber: values.serialNumber.trim() || undefined,
    carbonFiber: values.carbonFiber,
    notes: values.notes.trim() || undefined,
  };
}

export function formatPoleShortLabel(pole: Pole): string {
  return `${formatPoleLengthDisplay(pole.length)} ${pole.weightRating}`;
}

export function formatPoleTitle(pole: Pole): string {
  return getBrandModelName(pole.brandId, pole.modelId);
}

export function formatPoleBrandLabel(pole: Pole): string {
  const brand = getBrandName(pole.brandId);
  const model = getModelName(pole.modelId);

  if (model.toLowerCase().includes(brand.toLowerCase())) {
    return model;
  }

  return `${brand} ${model}`.trim();
}

export function formatPolePickerLabel(pole: Pole): string {
  return `${getBrandName(pole.brandId)} ${formatPoleShortLabel(pole)}`;
}

export function formatPoleLengthDisplay(length: string): string {
  return normalizeProgressionLength(length);
}

export function formatPoleWeightDisplay(weightRating: number): string {
  return `${weightRating}lbs`;
}

export function formatPoleSearchText(pole: Pole): string {
  return [
    getBrandName(pole.brandId),
    getModelName(pole.modelId),
    pole.serialNumber ?? "",
    pole.length,
    String(pole.weightRating),
    pole.flex ?? "",
    pole.notes ?? "",
    pole.carbonFiber ? "carbon fiber" : "",
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

  if (!brandId || !modelId || !isValidBrandModelPair(brandId, modelId)) {
    brandId = resolveBrandId(isString(value.brand) ? value.brand : brandId);
    modelId = resolveModelId(
      brandId,
      isString(value.model) ? value.model : modelId
    );
  }

  const explicitCarbon =
    typeof value.carbonFiber === "boolean" ? value.carbonFiber : undefined;

  return {
    id: value.id,
    brandId,
    modelId,
    length: normalizeProgressionLength(value.length),
    weightRating,
    flex: isString(value.flex) ? value.flex : undefined,
    serialNumber: isString(value.serialNumber) ? value.serialNumber : undefined,
    carbonFiber: inferCarbonFiber(modelId, explicitCarbon),
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
    values.length.trim() !== "" &&
    Number.isFinite(Number(values.weightRating)) &&
    Number(values.weightRating) > 0
  );
}

export function withBrandSelection(
  values: PoleFormValues,
  brandId: string
): PoleFormValues {
  const modelId = getDefaultModelIdForBrand(brandId);
  const model = getModelsForBrand(brandId).find((entry) => entry.id === modelId);

  return {
    ...values,
    brandId,
    modelId,
    carbonFiber: model?.name.toLowerCase().includes("carbon") ?? false,
  };
}

export { getModelsForBrand };
