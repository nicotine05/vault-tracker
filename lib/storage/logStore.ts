import type {
  HeightPREntry,
  RunPRs,
  SprintPREntry,
  SprintPRs,
  StrengthPREntry,
  StrengthPRs,
  VaultSession,
  VaultStepReferences,
} from "@/lib/domain/types";
import { getItem, setItem } from "@/lib/storage/localStore";
import { STORAGE_EVENTS, STORAGE_KEYS } from "@/lib/storage/keys";

export const EMPTY_SPRINT_PRS: SprintPRs = {
  tenMeterPR: "",
  tenMeterDate: "",
  twentyMeterPR: "",
  twentyMeterDate: "",
  thirtyMeterPR: "",
  thirtyMeterDate: "",
};

export const EMPTY_STRENGTH_PRS: StrengthPRs = {
  benchPR: "",
  benchDate: "",
  squatPR: "",
  squatDate: "",
  pullupPR: "",
  pullupDate: "",
};

export const EMPTY_RUN_PRS: RunPRs = {
  threeL: "",
  threeLDate: "",
  fourL: "",
  fourLDate: "",
  fiveL: "",
  fiveLDate: "",
  sixL: "",
  sixLDate: "",
  sevenL: "",
  sevenLDate: "",
};

export const EMPTY_STEP_REFS: VaultStepReferences = {
  threeL: "",
  fourL: "",
  fiveL: "",
  sixL: "",
  sevenL: "",
};

export function loadSprintPRs(): SprintPRs {
  return getItem(STORAGE_KEYS.SPRINT_PRS, EMPTY_SPRINT_PRS);
}

export function saveSprintPRs(prs: SprintPRs): void {
  setItem(STORAGE_KEYS.SPRINT_PRS, prs);
  window.dispatchEvent(new Event(STORAGE_EVENTS.SPRINT_PRS_CHANGED));
}

export function loadSprintPRHistory(): SprintPREntry[] {
  return getItem<SprintPREntry[]>(STORAGE_KEYS.SPRINT_PR_HISTORY, []);
}

export function saveSprintPRHistory(history: SprintPREntry[]): void {
  setItem(STORAGE_KEYS.SPRINT_PR_HISTORY, history);
  window.dispatchEvent(new Event(STORAGE_EVENTS.SPRINT_PRS_CHANGED));
}

export function loadStrengthPRs(): StrengthPRs {
  return getItem(STORAGE_KEYS.STRENGTH_PRS, EMPTY_STRENGTH_PRS);
}

export function saveStrengthPRs(prs: StrengthPRs): void {
  setItem(STORAGE_KEYS.STRENGTH_PRS, prs);
  window.dispatchEvent(new Event(STORAGE_EVENTS.STRENGTH_PRS_CHANGED));
}

export function loadStrengthPRHistory(): StrengthPREntry[] {
  return getItem<StrengthPREntry[]>(STORAGE_KEYS.STRENGTH_PR_HISTORY, []);
}

export function saveStrengthPRHistory(history: StrengthPREntry[]): void {
  setItem(STORAGE_KEYS.STRENGTH_PR_HISTORY, history);
  window.dispatchEvent(new Event(STORAGE_EVENTS.STRENGTH_PRS_CHANGED));
}

export function loadVaultSessions(): VaultSession[] {
  return getItem<VaultSession[]>(STORAGE_KEYS.VAULT_LOGS, []);
}

export function saveVaultSessions(sessions: VaultSession[]): void {
  setItem(STORAGE_KEYS.VAULT_LOGS, sessions);
}

export function loadVaultStepReferences(): VaultStepReferences {
  return getItem(STORAGE_KEYS.VAULT_STEP_REFERENCES, EMPTY_STEP_REFS);
}

export function saveVaultStepReferences(refs: VaultStepReferences): void {
  setItem(STORAGE_KEYS.VAULT_STEP_REFERENCES, refs);
}

export function loadVaultRunPRs(): RunPRs {
  return getItem(STORAGE_KEYS.VAULT_RUN_PRS, EMPTY_RUN_PRS);
}

export function saveVaultRunPRs(prs: RunPRs): void {
  setItem(STORAGE_KEYS.VAULT_RUN_PRS, prs);
  window.dispatchEvent(new Event(STORAGE_EVENTS.VAULT_RUN_PRS_CHANGED));
}

export function loadVaultPRHistory(): HeightPREntry[] {
  return getItem<HeightPREntry[]>(STORAGE_KEYS.VAULT_PR_HISTORY, []);
}

export function saveVaultPRHistory(history: HeightPREntry[]): void {
  setItem(STORAGE_KEYS.VAULT_PR_HISTORY, history);
}

export function getVaultHeightPRValues(runPRs: RunPRs): string[] {
  return [
    runPRs.threeL,
    runPRs.fourL,
    runPRs.fiveL,
    runPRs.sixL,
    runPRs.sevenL,
  ].filter((value) => value.trim() !== "");
}

export function subscribeVaultRunPRs(listener: () => void): () => void {
  const handler = () => listener();

  window.addEventListener(STORAGE_EVENTS.VAULT_RUN_PRS_CHANGED, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(STORAGE_EVENTS.VAULT_RUN_PRS_CHANGED, handler);
    window.removeEventListener("storage", handler);
  };
}

export function subscribeSprintPRs(listener: () => void): () => void {
  const handler = () => listener();

  window.addEventListener(STORAGE_EVENTS.SPRINT_PRS_CHANGED, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(STORAGE_EVENTS.SPRINT_PRS_CHANGED, handler);
    window.removeEventListener("storage", handler);
  };
}

export function subscribeStrengthPRs(listener: () => void): () => void {
  const handler = () => listener();

  window.addEventListener(STORAGE_EVENTS.STRENGTH_PRS_CHANGED, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(STORAGE_EVENTS.STRENGTH_PRS_CHANGED, handler);
    window.removeEventListener("storage", handler);
  };
}
