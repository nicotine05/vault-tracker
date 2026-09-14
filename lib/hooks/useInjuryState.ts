"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  InjuryProfile,
  InjuryRestrictions,
} from "@/lib/domain/injuryManagement";
import { getPhaseStartWeek } from "@/lib/domain/programCycle";
import { useProgramState } from "@/lib/hooks/useProgramState";
import {
  loadInjuryProfile,
  loadProgramCycleState,
  modifyProgram,
  pauseProgram,
  recordProgramCycleStart,
  resumeProgram,
  saveInjuryProfile,
  updateProgramRestrictions,
} from "@/lib/storage/injuryStore";

export function useInjuryState() {
  const {
    currentWeek,
    restartCurrentPhase,
    restartEntireProgram,
  } = useProgramState();
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<InjuryProfile>(() =>
    loadInjuryProfile()
  );

  useEffect(() => {
    setProfile(loadInjuryProfile());
    loadProgramCycleState(currentWeek);
    setLoaded(true);
  }, [currentWeek]);

  const refreshProfile = useCallback(() => {
    setProfile(loadInjuryProfile());
  }, []);

  const pause = useCallback(() => {
    const nextProfile = pauseProgram();
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  const modify = useCallback((restrictions: InjuryRestrictions) => {
    const nextProfile = modifyProgram(restrictions);
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  const updateRestrictions = useCallback((restrictions: InjuryRestrictions) => {
    const nextProfile = updateProgramRestrictions(restrictions);
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  const resume = useCallback(() => {
    const cycleState = loadProgramCycleState(currentWeek);
    recordProgramCycleStart(cycleState, currentWeek, "injury-resume");
    const nextProfile = resumeProgram();
    setProfile(nextProfile);
    return nextProfile;
  }, [currentWeek]);

  const restartPhase = useCallback(() => {
    const cycleState = loadProgramCycleState(currentWeek);
    const phaseStart = getPhaseStartWeek(currentWeek);
    restartCurrentPhase();
    recordProgramCycleStart(cycleState, phaseStart, "injury-phase-restart");
  }, [currentWeek, restartCurrentPhase]);

  const restartProgram = useCallback(() => {
    const cycleState = loadProgramCycleState(currentWeek);
    restartEntireProgram();
    recordProgramCycleStart(cycleState, 1, "program-restart");
  }, [currentWeek, restartEntireProgram]);

  return {
    loaded,
    profile,
    pause,
    modify,
    updateRestrictions,
    resume,
    restartPhase,
    restartProgram,
    refreshProfile,
    updateProfile: (nextProfile: InjuryProfile) => {
      saveInjuryProfile(nextProfile);
      setProfile(nextProfile);
    },
  };
}
