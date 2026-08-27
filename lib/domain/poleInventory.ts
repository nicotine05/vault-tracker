import type { Pole, PoleBag } from "@/lib/domain/types";

export const ALL_POLES_BAG_ID = "__all_poles__";
export const ALL_POLES_BAG_NAME = "All Poles";
export const MAX_RECENT_POLES = 5;

export type PoleFormValues = {
  brand: string;
  model: string;
  length: string;
  weightRating: string;
  flex: string;
  notes: string;
  retired: boolean;
};

export type PoleFilters = {
  search: string;
  brand: string;
  length: string;
  weightRating: string;
};

export const EMPTY_POLE_FILTERS: PoleFilters = {
  search: "",
  brand: "",
  length: "",
  weightRating: "",
};

export function emptyPoleForm(): PoleFormValues {
  return {
    brand: "",
    model: "",
    length: "",
    weightRating: "",
    flex: "",
    notes: "",
    retired: false,
  };
}

export function createPole(values: PoleFormValues): Pole {
  return {
    id: crypto.randomUUID(),
    brand: values.brand.trim(),
    model: values.model.trim(),
    length: values.length.trim(),
    weightRating: Number(values.weightRating) || 0,
    flex: values.flex.trim() || undefined,
    notes: values.notes.trim() || undefined,
    retired: values.retired || undefined,
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
    brand: pole.brand,
    model: pole.model,
    length: pole.length,
    weightRating: String(pole.weightRating),
    flex: pole.flex ?? "",
    notes: pole.notes ?? "",
    retired: Boolean(pole.retired),
  };
}

export function applyPoleFormValues(pole: Pole, values: PoleFormValues): Pole {
  return {
    ...pole,
    brand: values.brand.trim(),
    model: values.model.trim(),
    length: values.length.trim(),
    weightRating: Number(values.weightRating) || 0,
    flex: values.flex.trim() || undefined,
    notes: values.notes.trim() || undefined,
    retired: values.retired || undefined,
  };
}

export function formatPoleShortLabel(pole: Pole): string {
  return `${pole.length} ${pole.weightRating}`;
}

export function formatPolePickerLabel(pole: Pole): string {
  if (pole.brand.trim()) {
    return `${pole.brand} ${pole.length} ${pole.weightRating}`;
  }

  return formatPoleShortLabel(pole);
}

export function formatPoleTitle(pole: Pole): string {
  const brandModel = [pole.brand, pole.model].filter(Boolean).join(" ");
  return brandModel || formatPoleShortLabel(pole);
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
      const haystack = [
        pole.brand,
        pole.model,
        pole.length,
        String(pole.weightRating),
        pole.flex ?? "",
        pole.notes ?? "",
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(query)) {
        return false;
      }
    }

    if (filters.brand && pole.brand !== filters.brand) {
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

export function getUniquePoleBrands(poles: Pole[]): string[] {
  return [...new Set(poles.map((pole) => pole.brand).filter(Boolean))].sort();
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
    if (Boolean(left.retired) !== Boolean(right.retired)) {
      return left.retired ? 1 : -1;
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
    values.brand.trim() !== "" &&
    values.length.trim() !== "" &&
    Number.isFinite(Number(values.weightRating)) &&
    Number(values.weightRating) > 0
  );
}
