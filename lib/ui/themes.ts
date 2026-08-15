export const THEME_STORAGE_KEY = "vault-theme";

export const themeIds = [
  "slate",
  "arctic",
  "ember",
  "dark",
] as const;

export type ThemeId = (typeof themeIds)[number];

export type ThemeOption = {
  id: ThemeId;
  name: string;
  swatches: [string, string, string];
};

export const themeOptions: ThemeOption[] = [
  {
    id: "slate",
    name: "Classic Slate",
    swatches: ["#f1f5f9", "#7c3aed", "#ffffff"],
  },
  {
    id: "arctic",
    name: "Arctic",
    swatches: ["#f4f8fb", "#0284c7", "#e0f2fe"],
  },
  {
    id: "ember",
    name: "Ember",
    swatches: ["#fafafa", "#dc2626", "#fef2f2"],
  },
  {
    id: "dark",
    name: "Dark Mode",
    swatches: ["#000000", "#0a84ff", "#1c1c1e"],
  },
];

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return themeIds.includes(value as ThemeId);
}

export function getThemeStorageKey(userId?: string | null): string {
  return userId ? `${THEME_STORAGE_KEY}:${userId}` : THEME_STORAGE_KEY;
}
