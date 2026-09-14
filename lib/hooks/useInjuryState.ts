"use client";

import { useCallback, useEffect, useState } from "react";
import type { InjuryBodyArea, InjuryProfile } from "@/lib/domain/injuryManagement";
import { isInjuryModeActive } from "@/lib/domain/injuryManagement";
import { getPhaseStartWeek } from "@/lib/domain/programCycle";
import { useProgramState } from "@/lib/hooks/useProgramState";
import {
  clearInjuryManagement,
  enableInjuryManagement,
  loadInjuryProfile,
  loadProgramCycleState,
  recordProgramCycleStart,
  saveInjuryProfile,
  updateInjuryNotes,
} from "@/lib/storage/injuryStore";

export type InjuryRecoveryOption =
  | "resume"
  | "restart-phase"
  | "restart-program";

export function useInjuryState() {
  const {
    currentWeek,
    restartCurrentPhase,
    restartEntireProgram,
  } = useProgramState();
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<InjuryProfile>({ status: "normal" });

  useEffect(() => {
    setProfile(loadInjuryProfile());
    loadProgramCycleState(currentWeek);
    setLoaded(true);
  }, [currentWeek]);

  const refreshProfile = useCallback(() => {
    setProfile(loadInjuryProfile());
  }, []);

  const setManagingInjury = useCallback(
    (bodyArea: InjuryBodyArea, notes?: string) => {
      const nextProfile = enableInjuryManagement(bodyArea, notes);
      setProfile(nextProfile);
      return nextProfile;
    },
    []
  );

  const setNormalTraining = useCallback(() => {
    const nextProfile = clearInjuryManagement();
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  const saveNotes = useCallback((notes: string) => {
    const nextProfile = updateInjuryNotes(notes);
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  const recoverFromInjury = useCallback(
    (option: InjuryRecoveryOption) => {
      if (option === "restart-phase") {
        const phaseStart = getPhaseStartWeek(currentWeek);
        const cycleState = loadProgramCycleState(currentWeek);
        restartCurrentPhase();
        recordProgramCycleStart(
          cycleState,
          phaseStart,
          "injury-phase-restart",
          currentWeek - 1
        );
      } else if (option === "restart-program") {
        const cycleState = loadProgramCycleState(currentWeek);
        restartEntireProgram();
        recordProgramCycleStart(
          cycleState,
          1,
          "program-restart",
          currentWeek - 1
        );
      }

      const nextProfile = clearInjuryManagement();
      setProfile(nextProfile);
    },
    [currentWeek, restartCurrentPhase, restartEntireProgram]
  );

  return {
    loaded,
    profile,
    isActive: isInjuryModeActive(profile),
    setManagingInjury,
    setNormalTraining,
    saveNotes,
    recoverFromInjury,
    refreshProfile,
    updateProfile: (nextProfile: InjuryProfile) => {
      saveInjuryProfile(nextProfile);
      setProfile(nextProfile);
    },
  };
}
