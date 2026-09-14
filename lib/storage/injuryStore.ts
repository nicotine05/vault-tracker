import {
  DEFAULT_INJURY_PROFILE,
  normalizeInjuryProfile,
  type InjuryBodyArea,
  type InjuryProfile,
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

export function enableInjuryManagement(
  bodyArea: InjuryBodyArea,
  notes?: string
): InjuryProfile {
  const profile: InjuryProfile = {
    status: "managing",
    bodyArea,
    startedAt: new Date().toLocaleDateString(),
    notes: notes?.trim() || undefined,
  };

  saveInjuryProfile(profile);
  return profile;
}

export function clearInjuryManagement(): InjuryProfile {
  const profile: InjuryProfile = { status: "normal" };
  saveInjuryProfile(profile);
  return profile;
}

export function updateInjuryNotes(notes: string): InjuryProfile {
  const profile = loadInjuryProfile();
  const nextProfile: InjuryProfile = {
    ...profile,
    notes: notes.trim() || undefined,
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
