import { isWishlistPole } from "@/lib/domain/poleInventory";
import {
  mergeOwnedPoles,
  normalizePoleRecords,
  splitUnknownPoleRecords,
} from "@/lib/domain/sharedPoleStorage";
import type { Pole } from "@/lib/domain/types";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import type { SyncBlob } from "@/lib/server/types";
import {
  readStoreSnapshot,
  withStore,
  type CoachSharedSyncRecord,
  type VaultStore,
} from "@/lib/server/store";

function ensureCoachSharedSync(
  store: VaultStore
): Record<string, CoachSharedSyncRecord> {
  if (!store.coachSharedSync) {
    store.coachSharedSync = {};
  }

  return store.coachSharedSync;
}

export function resolveSharedPoleScopeIdFromStore(
  store: VaultStore,
  athleteId: string
): string {
  const link = store.coachAthletes.find((entry) => entry.athleteId === athleteId);
  return link?.coachId ?? athleteId;
}

export function getAthleteIdsForSharedPoleScope(
  store: VaultStore,
  scopeId: string
): string[] {
  const linkedAthletes = store.coachAthletes
    .filter((entry) => entry.coachId === scopeId)
    .map((entry) => entry.athleteId);

  if (linkedAthletes.length > 0) {
    return linkedAthletes;
  }

  return [scopeId];
}

function extractLegacyPoleInventory(data: SyncBlob): unknown[] {
  const inventory = data[STORAGE_KEYS.POLE_INVENTORY];
  return Array.isArray(inventory) ? inventory : [];
}

function extractWishlistInventory(data: SyncBlob): unknown[] {
  const wishlist = data[STORAGE_KEYS.POLE_WISHLIST];
  if (Array.isArray(wishlist)) {
    return wishlist;
  }

  return extractLegacyPoleInventory(data).filter((value) => {
    if (!value || typeof value !== "object") {
      return false;
    }

    const record = value as Record<string, unknown>;
    return record.kind === "wishlist" || record.status === "wishlist";
  });
}

export async function resolveSharedPoleScopeId(
  athleteId: string
): Promise<string> {
  const store = await readStoreSnapshot();
  return resolveSharedPoleScopeIdFromStore(store, athleteId);
}

export async function migrateAndGetSharedOwnedPoles(
  scopeId: string
): Promise<Pole[]> {
  return withStore((store) => {
    const sharedSync = ensureCoachSharedSync(store);
    const athleteIds = getAthleteIdsForSharedPoleScope(store, scopeId);
    const ownedGroups: Pole[][] = [];

    const existingShared = sharedSync[scopeId]?.poleInventory ?? [];
    ownedGroups.push(normalizePoleRecords(existingShared));

    for (const athleteId of athleteIds) {
      const syncRecord = store.athleteSync[athleteId];
      if (!syncRecord) {
        continue;
      }

      const syncData = syncRecord.data ?? {};
      const legacySplit = splitUnknownPoleRecords(
        extractLegacyPoleInventory(syncData)
      );
      ownedGroups.push(legacySplit.owned);

      const wishlistRecords = extractWishlistInventory(syncData);
      syncRecord.data = {
        ...syncData,
        [STORAGE_KEYS.POLE_WISHLIST]: wishlistRecords,
        [STORAGE_KEYS.POLE_INVENTORY]: wishlistRecords,
      };
    }

    const mergedOwned = mergeOwnedPoles(...ownedGroups);
    sharedSync[scopeId] = {
      poleInventory: mergedOwned,
      updatedAt: new Date().toISOString(),
    } satisfies CoachSharedSyncRecord;

    return mergedOwned;
  });
}

export async function saveSharedOwnedPoles(
  scopeId: string,
  ownedPoles: Pole[]
): Promise<void> {
  await withStore((store) => {
    const sharedSync = ensureCoachSharedSync(store);
    const existing = normalizePoleRecords(
      sharedSync[scopeId]?.poleInventory ?? []
    );

    sharedSync[scopeId] = {
      poleInventory: mergeOwnedPoles(existing, normalizePoleRecords(ownedPoles)),
      updatedAt: new Date().toISOString(),
    } satisfies CoachSharedSyncRecord;
  });
}

export function splitIncomingSyncPoles(data: SyncBlob): {
  owned: Pole[];
  wishlist: Pole[];
} {
  const sharedRaw = data[STORAGE_KEYS.SHARED_POLE_INVENTORY];
  const wishlistRaw = data[STORAGE_KEYS.POLE_WISHLIST];
  const legacyRaw = data[STORAGE_KEYS.POLE_INVENTORY];

  const ownedGroups: Pole[][] = [];
  if (Array.isArray(sharedRaw)) {
    ownedGroups.push(normalizePoleRecords(sharedRaw));
  }

  if (Array.isArray(legacyRaw)) {
    ownedGroups.push(splitUnknownPoleRecords(legacyRaw).owned);
  }

  const wishlist = normalizePoleRecords(
    Array.isArray(wishlistRaw)
      ? wishlistRaw
      : Array.isArray(legacyRaw)
        ? splitUnknownPoleRecords(legacyRaw).wishlist
        : []
  ).filter((pole) => isWishlistPole(pole));

  return {
    owned: mergeOwnedPoles(...ownedGroups),
    wishlist,
  };
}

export function attachSharedPolesToAthleteSyncData(
  data: SyncBlob,
  sharedOwnedPoles: Pole[]
): SyncBlob {
  const wishlistRecords = extractWishlistInventory(data);

  return {
    ...data,
    [STORAGE_KEYS.SHARED_POLE_INVENTORY]: sharedOwnedPoles,
    [STORAGE_KEYS.POLE_WISHLIST]: wishlistRecords,
    [STORAGE_KEYS.POLE_INVENTORY]: wishlistRecords,
  };
}

export function stripSharedPolesFromAthleteSyncData(
  data: SyncBlob,
  wishlist: Pole[]
): SyncBlob {
  const nextData: SyncBlob = { ...data };
  nextData[STORAGE_KEYS.POLE_WISHLIST] = wishlist;
  nextData[STORAGE_KEYS.POLE_INVENTORY] = wishlist;
  delete nextData[STORAGE_KEYS.SHARED_POLE_INVENTORY];
  return nextData;
}
