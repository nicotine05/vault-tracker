import type {
  HeightPREntry,
  Jump,
  RunPRs,
  VaultSession,
  VaultStepReferences,
} from "@/lib/domain/types";
import { normalizeVaultPR } from "@/lib/domain/vaultUnits";

export const VAULT_RUN_STEPS = [
  ["3L", "threeL"],
  ["4L", "fourL"],
  ["5L", "fiveL"],
  ["6L", "sixL"],
  ["7L", "sevenL"],
] as const;

export type VaultRunStepKey =
  (typeof VAULT_RUN_STEPS)[number][1];

export const VAULT_HEIGHT_PR_KEYS = VAULT_RUN_STEPS.map(
  ([, key]) => key
) as VaultRunStepKey[];

function normalizeRunPRValue(value: string): string {
  const trimmed = value.trim();
  return trimmed === "" ? "" : normalizeVaultPR(trimmed);
}

export function getGradeEmoji(grade: string): string {
  if (grade === "green") return "🟢";
  if (grade === "yellow") return "🟡";
  return "🔴";
}

export function getRunReference(
  run: string,
  stepRefs: VaultStepReferences
): string {
  switch (run.trim().toLowerCase()) {
    case "3l":
      return stepRefs.threeL;
    case "4l":
      return stepRefs.fourL;
    case "5l":
      return stepRefs.fiveL;
    case "6l":
      return stepRefs.sixL;
    case "7l":
      return stepRefs.sevenL;
    default:
      return "";
  }
}

export function getWeekLabel(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return `${monday.toLocaleDateString()} - ${sunday.toLocaleDateString()}`;
}

export function getVaultWeekOptions(sessions: VaultSession[]): string[] {
  return [...new Set(sessions.map((session) => getWeekLabel(session.date)))];
}

export function filterVaultSessionsByWeek(
  sessions: VaultSession[],
  weekFilter: string
): VaultSession[] {
  if (weekFilter === "all") {
    return sessions;
  }

  return sessions.filter(
    (session) => getWeekLabel(session.date) === weekFilter
  );
}

export function countJumpGrades(jumps: Jump[]): {
  green: number;
  yellow: number;
  red: number;
} {
  return {
    green: jumps.filter((jump) => jump.grade === "green").length,
    yellow: jumps.filter((jump) => jump.grade === "yellow").length,
    red: jumps.filter((jump) => jump.grade === "red").length,
  };
}

export function createJump(params: {
  run: string;
  grip: string;
  takeoff: string;
  grade: Jump["grade"];
  comment: string;
  poleId?: string;
  poleLabel?: string;
}): Jump {
  return {
    id: crypto.randomUUID(),
    run: params.run,
    grip: params.grip,
    takeoff: params.takeoff,
    grade: params.grade,
    comment: params.comment,
    poleId: params.poleId,
    poleLabel: params.poleLabel,
  };
}

export function createVaultSession(params: {
  keys: string[];
  jumps: Jump[];
}): VaultSession {
  return {
    id: crypto.randomUUID(),
    date: new Date().toLocaleDateString(),
    keys: params.keys.filter((key) => key.trim() !== ""),
    jumps: params.jumps,
  };
}

export function updateRunPR(
  runPRs: RunPRs,
  key: keyof RunPRs,
  value: string
): RunPRs {
  const today = new Date().toLocaleDateString();
  const normalized = value.trim() === "" ? "" : normalizeVaultPR(value);

  return {
    ...runPRs,
    [key]: normalized,
    [`${String(key)}Date`]: today,
  } as RunPRs;
}

export function appendHeightPREntry(
  prHistory: HeightPREntry[],
  previousRunPRs: RunPRs,
  nextRunPRs: RunPRs
): { history: HeightPREntry[]; changed: boolean } {
  const entry: HeightPREntry = {
    date: new Date().toLocaleDateString(),
    threeL: "",
    fourL: "",
    fiveL: "",
    sixL: "",
    sevenL: "",
  };

  let hasChanges = false;

  for (const key of VAULT_HEIGHT_PR_KEYS) {
    const previous = normalizeRunPRValue(previousRunPRs[key]);
    const next = normalizeRunPRValue(nextRunPRs[key]);

    if (next !== "" && next !== previous) {
      entry[key] = next;
      hasChanges = true;
    }
  }

  if (!hasChanges) {
    return { history: prHistory, changed: false };
  }

  return {
    history: [entry, ...prHistory],
    changed: true,
  };
}

export function emptyJumpForm(): {
  run: string;
  grip: string;
  takeoff: string;
  grade: Jump["grade"];
  comment: string;
  poleId?: string;
} {
  return {
    run: "",
    grip: "",
    takeoff: "",
    grade: "green",
    comment: "",
    poleId: undefined,
  };
}
