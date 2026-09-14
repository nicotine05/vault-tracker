import {
  DEFAULT_INJURY_PROFILE,
  EMPTY_INJURY_RESTRICTIONS,
  normalizeInjuryProfile,
  type InjuryProfile,
  type InjuryRestrictions,
} from "@/lib/domain/injuryManagement";
import {
  createInitialProgramCycle,
  normalizeProgramCycleState,
  type ProgramCycleReason,
  type ProgramCycleState,
  startProgramCycle,
} from "@/lib/domain/programCycle";
import { getItem, setItem } from "@/lib/storage/localStore";
import { STORAGE_KEYS } from "@/lib/storage/keys";

export function loadInjuryProfile(): InjuryProfile {
  return normalizeInjuryProfile(
    getItem(STORAGE_KEYS.INJURY_PROFILE, DEFAULT_INJURY_PROFILE)
  );
}

export function saveInjuryProfile(profile: InjuryProfile): void {
  setItem(STORAGE_KEYS.INJURY_PROFILE, profile);
}

export function loadProgramCycleState(
  currentWeek: number
): ProgramCycleState {
  const stored = getItem<unknown>(STORAGE_KEYS.PROGRAM_CYCLES, null);
  const normalized = normalizeProgramCycleState(stored);

  if (!stored) {
    const initial = createInitialProgramCycle(currentWeek);
    saveProgramCycleState(initial);
    return initial;
  }

  return normalized;
}

export function saveProgramCycleState(state: ProgramCycleState): void {
  setItem(STORAGE_KEYS.PROGRAM_CYCLES, state);
}

export function pauseProgram(): InjuryProfile {
  const profile: InjuryProfile = {
    status: "paused",
    restrictions: { ...EMPTY_INJURY_RESTRICTIONS },
    updatedAt: new Date().toLocaleDateString(),
  };

  saveInjuryProfile(profile);
  return profile;
}

export function modifyProgram(
  restrictions: InjuryRestrictions
): InjuryProfile {
  const profile: InjuryProfile = {
    status: "modified",
    restrictions,
    updatedAt: new Date().toLocaleDateString(),
  };

  saveInjuryProfile(profile);
  return profile;
}

export function resumeProgram(): InjuryProfile {
  const profile: InjuryProfile = { ...DEFAULT_INJURY_PROFILE };
  saveInjuryProfile(profile);
  return profile;
}

export function updateProgramRestrictions(
  restrictions: InjuryRestrictions
): InjuryProfile {
  const profile = loadInjuryProfile();

  if (profile.status !== "modified") {
    return profile;
  }

  const nextProfile: InjuryProfile = {
    ...profile,
    restrictions,
    updatedAt: new Date().toLocaleDateString(),
  };

  saveInjuryProfile(nextProfile);
  return nextProfile;
}

export function recordProgramCycleStart(
  currentState: ProgramCycleState,
  startWeek: number,
  reason: ProgramCycleReason,
  endPreviousAtWeek?: number
): ProgramCycleState {
  const nextState = startProgramCycle(
    currentState,
    startWeek,
    reason,
    endPreviousAtWeek
  );
  saveProgramCycleState(nextState);
  return nextState;
}
