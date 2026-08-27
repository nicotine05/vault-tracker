export interface PoleBrand {
  id: string;
  name: string;
  color: string;
}

export interface PoleModel {
  id: string;
  brandId: string;
  name: string;
}

export const POLE_BRANDS: PoleBrand[] = [
  { id: "altius", name: "Altius", color: "#F97316" },
  { id: "pacer", name: "Pacer", color: "#22C55E" },
  { id: "ucs-spirit", name: "UCS Spirit", color: "#8B5CF6" },
  { id: "essx", name: "ESSX", color: "#3B82F6" },
  { id: "skypole", name: "Skypole", color: "#06B6D4" },
];

export const POLE_MODELS: PoleModel[] = [
  { id: "altius-carbon", brandId: "altius", name: "Carbon" },
  { id: "altius-other", brandId: "altius", name: "Other" },

  { id: "pacer-carbon", brandId: "pacer", name: "Pacer Carbon" },
  { id: "pacer-fx", brandId: "pacer", name: "Pacer FX" },
  { id: "pacer-one", brandId: "pacer", name: "Pacer One" },
  { id: "pacer-composite", brandId: "pacer", name: "Pacer Composite" },
  { id: "pacer-spirit", brandId: "pacer", name: "Pacer Spirit" },
  { id: "pacer-fiberglass", brandId: "pacer", name: "Pacer Fiberglass" },
  { id: "pacer-other", brandId: "pacer", name: "Other" },

  { id: "ucs-spirit-spirit", brandId: "ucs-spirit", name: "Spirit" },
  {
    id: "ucs-spirit-spirit-carbon",
    brandId: "ucs-spirit",
    name: "Spirit Carbon",
  },
  { id: "ucs-spirit-spirit-elite", brandId: "ucs-spirit", name: "Spirit Elite" },
  {
    id: "ucs-spirit-spirit-competition",
    brandId: "ucs-spirit",
    name: "Spirit Competition",
  },
  {
    id: "ucs-spirit-fiberglass-spirit",
    brandId: "ucs-spirit",
    name: "Fiberglass Spirit",
  },
  { id: "ucs-spirit-other", brandId: "ucs-spirit", name: "Other" },

  {
    id: "essx-recoil-advance",
    brandId: "essx",
    name: "ESSX Recoil Advance",
  },
  { id: "essx-recoil", brandId: "essx", name: "ESSX Recoil" },
  { id: "essx-landing-pad", brandId: "essx", name: "ESSX Landing Pad" },
  { id: "essx-hybrid", brandId: "essx", name: "ESSX Hybrid" },
  { id: "essx-fiberglass", brandId: "essx", name: "ESSX Fiberglass" },
  { id: "essx-other", brandId: "essx", name: "Other" },

  { id: "skypole-other", brandId: "skypole", name: "Other" },
];

export const DEFAULT_BRAND_ID = "altius";
export const DEFAULT_MODEL_ID = "altius-other";

const LEGACY_BRAND_ID_MAP: Record<string, string> = {
  "sky-pole": "skypole",
  gill: "altius",
  nordic: "altius",
  other: "altius",
};

const LEGACY_MODEL_ID_MAP: Record<string, string> = {
  "essx-recoil-advanced": "essx-recoil-advance",
  "essx-recoil-pro": "essx-recoil",
  "pacer-carbon-fx": "pacer-carbon",
  "pacer-fxc": "pacer-fx",
  "pacer-one-piece": "pacer-one",
  "altius-fibersport": "altius-other",
  "sky-pole-carbon": "skypole-other",
  "sky-pole-fiberglass": "skypole-other",
  "nordic-carbon": "altius-other",
  "nordic-fiberglass": "altius-other",
  "gill-fx": "altius-other",
  "gill-agx": "altius-other",
  "gill-mystic": "altius-other",
  "other-custom-model": "altius-other",
};

const brandById = new Map(POLE_BRANDS.map((brand) => [brand.id, brand]));
const modelById = new Map(POLE_MODELS.map((model) => [model.id, model]));

export function getPoleBrand(brandId: string): PoleBrand {
  const resolvedId = LEGACY_BRAND_ID_MAP[brandId] ?? brandId;
  return brandById.get(resolvedId) ?? brandById.get(DEFAULT_BRAND_ID)!;
}

export function getPoleModel(modelId: string): PoleModel {
  const resolvedId = LEGACY_MODEL_ID_MAP[modelId] ?? modelId;
  return modelById.get(resolvedId) ?? modelById.get(DEFAULT_MODEL_ID)!;
}

export function getModelsForBrand(brandId: string): PoleModel[] {
  const resolvedBrandId = LEGACY_BRAND_ID_MAP[brandId] ?? brandId;
  return POLE_MODELS.filter((model) => model.brandId === resolvedBrandId);
}

export function getBrandName(brandId: string): string {
  return getPoleBrand(brandId).name;
}

export function getModelName(modelId: string): string {
  return getPoleModel(modelId).name;
}

export function getBrandModelName(brandId: string, modelId: string): string {
  return formatPoleDisplayName(brandId, modelId);
}

export function formatPoleDisplayName(brandId: string, modelId: string): string {
  const brand = getBrandName(brandId);
  const model = getModelName(modelId);

  if (model === "Other") {
    return brand;
  }

  return model;
}

export function getBrandColor(brandId: string): string {
  return getPoleBrand(brandId).color;
}

function normalizeCatalogText(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

export function resolveBrandId(value: string | undefined): string {
  const normalized = normalizeCatalogText(value ?? "");
  if (!normalized) {
    return DEFAULT_BRAND_ID;
  }

  if (LEGACY_BRAND_ID_MAP[value ?? ""]) {
    return LEGACY_BRAND_ID_MAP[value ?? ""];
  }

  for (const brand of POLE_BRANDS) {
    if (
      brand.id === value ||
      brand.id === normalized.replace(/\s+/g, "-") ||
      normalizeCatalogText(brand.name) === normalized
    ) {
      return brand.id;
    }
  }

  if (normalized.includes("essx")) return "essx";
  if (normalized.includes("spirit") || normalized.includes("ucs")) {
    return "ucs-spirit";
  }
  if (normalized.includes("pacer")) return "pacer";
  if (normalized.includes("altius")) return "altius";
  if (normalized.includes("sky")) return "skypole";
  if (normalized.includes("gill") || normalized.includes("nordic")) {
    return "altius";
  }

  return DEFAULT_BRAND_ID;
}

export function resolveModelId(
  brandId: string,
  value: string | undefined
): string {
  const resolvedBrandId = resolveBrandId(brandId);
  const models = getModelsForBrand(resolvedBrandId);

  if (value) {
    const legacyMapped = LEGACY_MODEL_ID_MAP[value];
    if (legacyMapped) {
      const legacyModel = modelById.get(legacyMapped);
      if (legacyModel?.brandId === resolvedBrandId) {
        return legacyMapped;
      }
    }

    const directModel = modelById.get(value);
    if (directModel?.brandId === resolvedBrandId) {
      return directModel.id;
    }
  }

  const normalized = normalizeCatalogText(value ?? "");
  if (!normalized) {
    return models[0]?.id ?? DEFAULT_MODEL_ID;
  }

  for (const model of models) {
    if (normalizeCatalogText(model.name) === normalized) {
      return model.id;
    }
  }

  for (const model of models) {
    const modelNormalized = normalizeCatalogText(model.name);
    if (
      modelNormalized.includes(normalized) ||
      normalized.includes(modelNormalized)
    ) {
      return model.id;
    }
  }

  const slug = normalized.replace(/\s+/g, "-");
  for (const model of models) {
    if (model.id.includes(slug)) {
      return model.id;
    }
  }

  return (
    models.find((model) => model.name === "Other")?.id ??
    models[0]?.id ??
    DEFAULT_MODEL_ID
  );
}

export function isValidBrandModelPair(
  brandId: string,
  modelId: string
): boolean {
  const resolvedBrandId = resolveBrandId(brandId);
  const resolvedModelId = LEGACY_MODEL_ID_MAP[modelId] ?? modelId;
  const model = modelById.get(resolvedModelId);
  return Boolean(model && model.brandId === resolvedBrandId);
}

export function getDefaultModelIdForBrand(brandId: string): string {
  return getModelsForBrand(brandId)[0]?.id ?? DEFAULT_MODEL_ID;
}
