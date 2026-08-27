"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Pole, PoleBag } from "@/lib/domain/types";
import {
  ALL_POLES_BAG_ID,
  createPole,
  createPoleBag,
  applyPoleFormValues,
  pruneBagPoleIds,
  sortPolesForDisplay,
  type PoleFormValues,
} from "@/lib/domain/poleInventory";
import {
  loadPoleBags,
  loadPoles,
  loadRecentPoleIds,
  savePoleBags,
  savePoles,
  saveRecentPoleIds,
} from "@/lib/storage/poleStore";

export function usePoleInventoryState() {
  const [loaded, setLoaded] = useState(false);
  const [poles, setPoles] = useState<Pole[]>([]);
  const [bags, setBags] = useState<PoleBag[]>([]);
  const [recentPoleIds, setRecentPoleIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const loadedPoles = loadPoles();
      const loadedBags = loadPoleBags();
      const validPoleIds = new Set(loadedPoles.map((pole) => pole.id));

      setPoles(loadedPoles);
      setBags(
        loadedBags
          .filter((bag) => bag.id !== ALL_POLES_BAG_ID)
          .map((bag) => pruneBagPoleIds(bag, validPoleIds))
      );
      setRecentPoleIds(
        loadRecentPoleIds().filter((poleId) => validPoleIds.has(poleId))
      );
    } catch (error) {
      console.error("Failed to load pole inventory", error);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    savePoles(poles);
  }, [poles, loaded]);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    savePoleBags(bags);
  }, [bags, loaded]);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    saveRecentPoleIds(recentPoleIds);
  }, [recentPoleIds, loaded]);

  const sortedPoles = useMemo(() => sortPolesForDisplay(poles), [poles]);

  const addPole = useCallback((values: PoleFormValues) => {
    setPoles((prev) => [...prev, createPole(values)]);
  }, []);

  const updatePole = useCallback((poleId: string, values: PoleFormValues) => {
    setPoles((prev) =>
      prev.map((pole) =>
        pole.id === poleId ? applyPoleFormValues(pole, values) : pole
      )
    );
  }, []);

  const deletePole = useCallback((poleId: string) => {
    setPoles((prev) => prev.filter((pole) => pole.id !== poleId));
    setBags((prev) =>
      prev.map((bag) => ({
        ...bag,
        poleIds: bag.poleIds.filter((id) => id !== poleId),
      }))
    );
    setRecentPoleIds((prev) => prev.filter((id) => id !== poleId));
  }, []);

  const addBag = useCallback((name: string) => {
    setBags((prev) => [...prev, createPoleBag(name)]);
  }, []);

  const renameBag = useCallback((bagId: string, name: string) => {
    setBags((prev) =>
      prev.map((bag) =>
        bag.id === bagId ? { ...bag, name: name.trim() } : bag
      )
    );
  }, []);

  const deleteBag = useCallback((bagId: string) => {
    setBags((prev) => prev.filter((bag) => bag.id !== bagId));
  }, []);

  const addPoleToBag = useCallback((bagId: string, poleId: string) => {
    setBags((prev) =>
      prev.map((bag) => {
        if (bag.id !== bagId || bag.poleIds.includes(poleId)) {
          return bag;
        }

        return {
          ...bag,
          poleIds: [...bag.poleIds, poleId],
        };
      })
    );
  }, []);

  const removePoleFromBag = useCallback((bagId: string, poleId: string) => {
    setBags((prev) =>
      prev.map((bag) =>
        bag.id === bagId
          ? {
              ...bag,
              poleIds: bag.poleIds.filter((id) => id !== poleId),
            }
          : bag
      )
    );
  }, []);

  return {
    loaded,
    poles: sortedPoles,
    bags,
    recentPoleIds,
    addPole,
    updatePole,
    deletePole,
    addBag,
    renameBag,
    deleteBag,
    addPoleToBag,
    removePoleFromBag,
  };
}
