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
  { id: "essx", name: "ESSX", color: "#3B82F6" },
  { id: "ucs-spirit", name: "UCS Spirit", color: "#8B5CF6" },
  { id: "gill", name: "Gill", color: "#EF4444" },
  { id: "pacer", name: "Pacer", color: "#22C55E" },
  { id: "altius", name: "Altius", color: "#F97316" },
  { id: "sky-pole", name: "Sky Pole", color: "#06B6D4" },
  { id: "nordic", name: "Nordic", color: "#EAB308" },
  { id: "other", name: "Other", color: "#9CA3AF" },
];

export const POLE_MODELS: PoleModel[] = [
  { id: "essx-recoil", brandId: "essx", name: "Recoil" },
  { id: "essx-recoil-pro", brandId: "essx", name: "Recoil Pro" },
  { id: "essx-recoil-advanced", brandId: "essx", name: "Recoil Advanced" },
  { id: "ucs-spirit-spirit", brandId: "ucs-spirit", name: "Spirit" },
  { id: "ucs-spirit-spirit-elite", brandId: "ucs-spirit", name: "Spirit Elite" },
  { id: "ucs-spirit-spirit-carbon", brandId: "ucs-spirit", name: "Spirit Carbon" },
  { id: "gill-fx", brandId: "gill", name: "FX" },
  { id: "gill-agx", brandId: "gill", name: "AGX" },
  { id: "gill-mystic", brandId: "gill", name: "Mystic" },
  { id: "pacer-carbon-fx", brandId: "pacer", name: "Carbon FX" },
  { id: "pacer-fxc", brandId: "pacer", name: "FXC" },
  { id: "pacer-one-piece", brandId: "pacer", name: "One Piece" },
  { id: "altius-carbon", brandId: "altius", name: "Carbon" },
  { id: "altius-fibersport", brandId: "altius", name: "FiberSport" },
  { id: "sky-pole-carbon", brandId: "sky-pole", name: "Carbon" },
  { id: "sky-pole-fiberglass", brandId: "sky-pole", name: "Fiberglass" },
  { id: "nordic-carbon", brandId: "nordic", name: "Carbon" },
  { id: "nordic-fiberglass", brandId: "nordic", name: "Fiberglass" },
  { id: "other-custom-model", brandId: "other", name: "Custom Model" },
];

export const DEFAULT_BRAND_ID = "other";
export const DEFAULT_MODEL_ID = "other-custom-model";

const brandById = new Map(POLE_BRANDS.map((brand) => [brand.id, brand]));
const modelById = new Map(POLE_MODELS.map((model) => [model.id, model]));

export function getPoleBrand(brandId: string): PoleBrand {
  return brandById.get(brandId) ?? brandById.get(DEFAULT_BRAND_ID)!;
}

export function getPoleModel(modelId: string): PoleModel {
  return modelById.get(modelId) ?? modelById.get(DEFAULT_MODEL_ID)!;
}

export function getModelsForBrand(brandId: string): PoleModel[] {
  return POLE_MODELS.filter((model) => model.brandId === brandId);
}

export function getBrandName(brandId: string): string {
  return getPoleBrand(brandId).name;
}

export function getModelName(modelId: string): string {
  return getPoleModel(modelId).name;
}

export function getBrandModelName(brandId: string, modelId: string): string {
  return `${getBrandName(brandId)} ${getModelName(modelId)}`;
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

  for (const brand of POLE_BRANDS) {
    if (
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
  if (normalized.includes("gill")) return "gill";
  if (normalized.includes("pacer")) return "pacer";
  if (normalized.includes("altius")) return "altius";
  if (normalized.includes("sky")) return "sky-pole";
  if (normalized.includes("nordic")) return "nordic";

  return DEFAULT_BRAND_ID;
}

export function resolveModelId(
  brandId: string,
  value: string | undefined
): string {
  const normalized = normalizeCatalogText(value ?? "");
  const models = getModelsForBrand(brandId);

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

  return models[0]?.id ?? DEFAULT_MODEL_ID;
}

export function isValidBrandModelPair(
  brandId: string,
  modelId: string
): boolean {
  const model = modelById.get(modelId);
  return Boolean(model && model.brandId === brandId);
}

export function getDefaultModelIdForBrand(brandId: string): string {
  return getModelsForBrand(brandId)[0]?.id ?? DEFAULT_MODEL_ID;
}
