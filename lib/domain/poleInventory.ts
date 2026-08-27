import type { Pole, PoleBag, PoleKind } from "@/lib/domain/types";
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

export type PoleSourceFilter = "inventory" | "wishlist" | "both";

export type PoleFormValues = {
  kind: PoleKind;
  brandId: string;
  modelId: string;
  brandIds: string[];
  modelIds: string[];
  lengthFeet: string;
  lengthInches: string;
  lengthMaxFeet: string;
  lengthMaxInches: string;
  weightRating: string;
  weightMax: string;
  flex: string;
  notes: string;
  needsReplace: boolean;
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

export function emptyPoleForm(kind: PoleKind = "owned"): PoleFormValues {
  return {
    kind,
    brandId: "",
    modelId: "",
    brandIds: [],
    modelIds: [],
    lengthFeet: "",
    lengthInches: "",
    lengthMaxFeet: "",
    lengthMaxInches: "",
    weightRating: "",
    weightMax: "",
    flex: "",
    notes: "",
    needsReplace: false,
  };
}

export function isOwnedPole(pole: Pole): boolean {
  return pole.kind !== "wishlist";
}

export function isWishlistPole(pole: Pole): boolean {
  return pole.kind === "wishlist";
}

export function isRetiredPole(pole: Pole): boolean {
  return pole.retired === true;
}

export function isNeedsReplacePole(pole: Pole): boolean {
  return pole.needsReplace === true && isActiveOwnedPole(pole);
}

export function isActiveOwnedPole(pole: Pole): boolean {
  return isOwnedPole(pole) && !isRetiredPole(pole);
}

export function getPoleDisplayTier(pole: Pole): number {
  if (isRetiredPole(pole)) {
    return 2;
  }

  if (isWishlistPole(pole)) {
    return 1;
  }

  return 0;
}

export function filterPolesBySource(
  poles: Pole[],
  source: PoleSourceFilter
): Pole[] {
  switch (source) {
    case "inventory":
      return poles.filter(isOwnedPole);
    case "wishlist":
      return poles.filter(isWishlistPole);
    default:
      return poles;
  }
}

export function getOwnedPoles(poles: Pole[]): Pole[] {
  return poles.filter(isActiveOwnedPole);
}

export function sanitizePoleFormDigits(value: string, maxLength: number): string {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

export function parsePoleLengthFormValues(
  values: Pick<
    PoleFormValues,
    "lengthFeet" | "lengthInches" | "lengthMaxFeet" | "lengthMaxInches"
  >,
  part: "min" | "max" = "min"
): string | null {
  const feet =
    part === "min" ? values.lengthFeet.trim() : values.lengthMaxFeet.trim();
  const inches =
    part === "min"
      ? values.lengthInches.trim()
      : values.lengthMaxInches.trim();

  if (!feet && !inches) {
    return null;
  }

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
  return parsePoleLengthFormValues(values, "min") ?? "";
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
  if (values.kind === "wishlist") {
    return createWishlistPole(values);
  }

  return createOwnedPole(values);
}

function createOwnedPole(values: PoleFormValues): Pole {
  return {
    id: crypto.randomUUID(),
    kind: "owned",
    brandId: values.brandId,
    modelId: values.modelId,
    length: normalizePoleLengthFromForm(values),
    weightRating: normalizePoleWeightFromForm(values.weightRating),
    flex: values.flex.trim() || undefined,
    notes: values.notes.trim() || undefined,
    needsReplace: values.needsReplace ? true : undefined,
    createdAt: new Date().toISOString(),
  };
}

function createWishlistPole(values: PoleFormValues): Pole {
  const length = parsePoleLengthFormValues(values, "min") ?? "";
  const lengthMax = parsePoleLengthFormValues(values, "max") ?? undefined;
  const weightRating = parsePoleWeightFormValue(values.weightRating) ?? 0;
  const weightMaxParsed = values.weightMax.trim()
    ? parsePoleWeightFormValue(values.weightMax)
    : null;
  const brandIds = [...values.brandIds];
  const modelIds = [...values.modelIds];

  return {
    id: crypto.randomUUID(),
    kind: "wishlist",
    brandId: brandIds[0] ?? "",
    modelId: modelIds[0] ?? "",
    brandIds: brandIds.length > 0 ? brandIds : undefined,
    modelIds: modelIds.length > 0 ? modelIds : undefined,
    length,
    lengthMax: lengthMax && lengthMax !== length ? lengthMax : undefined,
    weightRating,
    weightMax:
      weightMaxParsed !== null &&
      weightMaxParsed !== weightRating &&
      weightMaxParsed > 0
        ? weightMaxParsed
        : undefined,
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
  const maxParts = pole.lengthMax
    ? splitPoleLengthForForm(pole.lengthMax)
    : { lengthFeet: "", lengthInches: "" };

  return {
    kind: pole.kind ?? "owned",
    brandId: pole.brandId,
    modelId: pole.modelId,
    brandIds: pole.brandIds ?? (pole.brandId ? [pole.brandId] : []),
    modelIds: pole.modelIds ?? (pole.modelId ? [pole.modelId] : []),
    lengthFeet,
    lengthInches,
    lengthMaxFeet: maxParts.lengthFeet,
    lengthMaxInches: maxParts.lengthInches,
    weightRating: pole.weightRating > 0 ? String(pole.weightRating) : "",
    weightMax: pole.weightMax ? String(pole.weightMax) : "",
    flex: pole.flex ?? "",
    notes: pole.notes ?? "",
    needsReplace: pole.needsReplace === true,
  };
}

export function applyPoleFormValues(pole: Pole, values: PoleFormValues): Pole {
  if (values.kind === "wishlist") {
    return {
      ...createWishlistPole(values),
      id: pole.id,
      createdAt: pole.createdAt,
    };
  }

  return {
    ...pole,
    kind: "owned",
    brandId: values.brandId,
    modelId: values.modelId,
    brandIds: undefined,
    modelIds: undefined,
    length: normalizePoleLengthFromForm(values),
    lengthMax: undefined,
    weightRating: normalizePoleWeightFromForm(values.weightRating),
    weightMax: undefined,
    flex: values.flex.trim() || undefined,
    notes: values.notes.trim() || undefined,
    needsReplace: values.needsReplace ? true : undefined,
  };
}

export function formatPoleShortLabel(pole: Pole): string {
  if (isWishlistPole(pole)) {
    return `${formatPoleLengthRangeDisplay(pole)} · ${formatPoleWeightRangeDisplay(pole)}`;
  }

  return `${formatPoleLengthDisplay(pole.length)} ${pole.weightRating}`;
}

export function formatPoleTitle(pole: Pole): string {
  if (isWishlistPole(pole)) {
    return formatWishlistBrandLabel(pole);
  }

  return formatPoleBrandLabel(pole);
}

export function formatWishlistBrandLabel(pole: Pole): string {
  const brandIds =
    pole.brandIds && pole.brandIds.length > 0
      ? pole.brandIds
      : pole.brandId
        ? [pole.brandId]
        : [];

  if (brandIds.length === 0) {
    return "Any brand";
  }

  return brandIds.map((brandId) => getBrandName(brandId)).join(", ");
}

export function formatWishlistModelLabel(pole: Pole): string {
  const modelIds =
    pole.modelIds && pole.modelIds.length > 0
      ? pole.modelIds
      : pole.modelId
        ? [pole.modelId]
        : [];

  if (modelIds.length === 0) {
    return "Any model";
  }

  return modelIds.map((modelId) => getModelName(modelId)).join(", ");
}

export function formatPoleLengthRangeDisplay(pole: Pole): string {
  const min = pole.length ? formatPoleLengthDisplay(pole.length) : null;
  const max = pole.lengthMax ? formatPoleLengthDisplay(pole.lengthMax) : null;

  if (min && max && min !== max) {
    return `${min}–${max}`;
  }

  if (min) {
    return min;
  }

  if (max) {
    return max;
  }

  return "—";
}

export function formatPoleWeightRangeDisplay(pole: Pole): string {
  const min = pole.weightRating;
  const max = pole.weightMax;

  if (min > 0 && max && max !== min) {
    return `${min}–${max} lbs`;
  }

  if (min > 0) {
    return formatPoleWeightDisplay(min);
  }

  if (max && max > 0) {
    return `${max} lbs`;
  }

  return "—";
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
  const brandText = isWishlistPole(pole)
    ? formatWishlistBrandLabel(pole)
    : getBrandName(pole.brandId);
  const modelText = isWishlistPole(pole)
    ? formatWishlistModelLabel(pole)
    : getModelName(pole.modelId);

  return [
    brandText,
    modelText,
    pole.length,
    pole.lengthMax ?? "",
    String(pole.weightRating),
    pole.weightMax ? String(pole.weightMax) : "",
    pole.flex ?? "",
    pole.notes ?? "",
    isWishlistPole(pole) ? "wishlist" : "",
    isRetiredPole(pole) ? "retired" : "",
    isNeedsReplacePole(pole) ? "replace needs replaced" : "",
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
    kind:
      value.kind === "wishlist" || value.status === "wishlist"
        ? "wishlist"
        : "owned",
    brandId,
    modelId,
    brandIds: Array.isArray(value.brandIds)
      ? value.brandIds.filter(isString)
      : undefined,
    modelIds: Array.isArray(value.modelIds)
      ? value.modelIds.filter(isString)
      : undefined,
    length: normalizeProgressionLength(value.length),
    lengthMax: isString(value.lengthMax)
      ? normalizeProgressionLength(value.lengthMax)
      : undefined,
    weightRating,
    weightMax:
      typeof value.weightMax === "number" && Number.isFinite(value.weightMax)
        ? value.weightMax
        : undefined,
    flex: isString(value.flex) ? value.flex : undefined,
    notes: isString(value.notes) ? value.notes : undefined,
    retired: value.retired === true ? true : undefined,
    needsReplace:
      value.needsReplace === true || value.status === "replace"
        ? true
        : undefined,
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
    const tierCompare = getPoleDisplayTier(left) - getPoleDisplayTier(right);
    if (tierCompare !== 0) {
      return tierCompare;
    }

    const brandCompare = formatPoleTitle(left).localeCompare(
      formatPoleTitle(right)
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

export function setPoleRetired(pole: Pole, retired: boolean): Pole {
  if (isWishlistPole(pole)) {
    return pole;
  }

  return {
    ...pole,
    retired: retired ? true : undefined,
  };
}

export function isPoleFormValid(values: PoleFormValues): boolean {
  if (values.kind === "wishlist") {
    return isWishlistFormValid(values);
  }

  return (
    values.brandId !== "" &&
    values.modelId !== "" &&
    isValidBrandModelPair(values.brandId, values.modelId) &&
    parsePoleLengthFormValues(values, "min") !== null &&
    parsePoleWeightFormValue(values.weightRating) !== null
  );
}

export function isWishlistFormValid(values: PoleFormValues): boolean {
  const hasLength = parsePoleLengthFormValues(values, "min") !== null;
  const hasWeight = parsePoleWeightFormValue(values.weightRating) !== null;

  if (!hasLength && !hasWeight) {
    return false;
  }

  const maxLength = parsePoleLengthFormValues(values, "max");
  if (values.lengthMaxFeet.trim() || values.lengthMaxInches.trim()) {
    if (maxLength === null) {
      return false;
    }
  }

  if (values.weightMax.trim() && parsePoleWeightFormValue(values.weightMax) === null) {
    return false;
  }

  return true;
}

export function toggleWishlistBrandSelection(
  values: PoleFormValues,
  brandId: string
): PoleFormValues {
  const selected = values.brandIds.includes(brandId);
  const brandIds = selected
    ? values.brandIds.filter((id) => id !== brandId)
    : [...values.brandIds, brandId];
  const allowedModelIds = new Set(
    brandIds.flatMap((id) => getModelsForBrand(id).map((model) => model.id))
  );
  const modelIds = values.modelIds.filter((id) => allowedModelIds.has(id));

  return {
    ...values,
    brandIds,
    modelIds,
    brandId: brandIds[0] ?? "",
    modelId: modelIds[0] ?? "",
  };
}

export function toggleWishlistModelSelection(
  values: PoleFormValues,
  modelId: string
): PoleFormValues {
  const selected = values.modelIds.includes(modelId);
  const modelIds = selected
    ? values.modelIds.filter((id) => id !== modelId)
    : [...values.modelIds, modelId];

  return {
    ...values,
    modelIds,
    modelId: modelIds[0] ?? "",
  };
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

export function withPoleFormKind(
  values: PoleFormValues,
  kind: PoleKind
): PoleFormValues {
  if (kind === values.kind) {
    return values;
  }

  return emptyPoleForm(kind);
}

export { getModelsForBrand };
