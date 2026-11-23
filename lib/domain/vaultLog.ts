import type {
  HeightPREntry,
  Jump,
  RunPRs,
  VaultSession,
  VaultStepReferences,
} from "@/lib/domain/types";
import {
  normalizeVaultPR,
  parseVaultPRToMeters,
} from "@/lib/domain/vaultUnits";

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

export function getGradeEmoji(grade?: string): string {
  if (grade === "green") return "🟢";
  if (grade === "yellow") return "🟡";
  if (grade === "red") return "🔴";
  return "";
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

export const VAULT_SESSION_RECENT_FILTER = "recent";
export const VAULT_SESSION_RECENT_DAYS = 7;
export const VAULT_SESSION_RECENT_FALLBACK_COUNT = 3;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseVaultSessionDate(dateString: string): Date | null {
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return startOfLocalDay(parsed);
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

export function getVaultSessionsInPastDays(
  sessions: VaultSession[],
  days: number,
  now: Date = new Date()
): VaultSession[] {
  const today = startOfLocalDay(now);

  return sessions.filter((session) => {
    const sessionDate = parseVaultSessionDate(session.date);
    if (!sessionDate) {
      return false;
    }

    const daysAgo = (today.getTime() - sessionDate.getTime()) / MS_PER_DAY;
    return daysAgo >= 0 && daysAgo < days;
  });
}

export function getLatestVaultSessions(
  sessions: VaultSession[],
  count: number
): VaultSession[] {
  return [...sessions]
    .sort((a, b) => {
      const aDate = parseVaultSessionDate(a.date)?.getTime() ?? 0;
      const bDate = parseVaultSessionDate(b.date)?.getTime() ?? 0;
      return bDate - aDate;
    })
    .slice(0, count);
}

export function filterRecentVaultSessions(
  sessions: VaultSession[],
  now: Date = new Date()
): VaultSession[] {
  const recent = getVaultSessionsInPastDays(
    sessions,
    VAULT_SESSION_RECENT_DAYS,
    now
  );

  if (recent.length > 0) {
    return recent;
  }

  return getLatestVaultSessions(
    sessions,
    VAULT_SESSION_RECENT_FALLBACK_COUNT
  );
}

export function isVaultRecentFallback(
  sessions: VaultSession[],
  now: Date = new Date()
): boolean {
  if (sessions.length === 0) {
    return false;
  }

  return (
    getVaultSessionsInPastDays(sessions, VAULT_SESSION_RECENT_DAYS, now)
      .length === 0
  );
}

export function getVaultRecentFilterLabel(
  sessions: VaultSession[],
  now: Date = new Date()
): string {
  return isVaultRecentFallback(sessions, now)
    ? "Last 3 sessions"
    : "Past 7 days";
}

export function filterVaultSessionsByWeek(
  sessions: VaultSession[],
  weekFilter: string,
  now: Date = new Date()
): VaultSession[] {
  if (weekFilter === VAULT_SESSION_RECENT_FILTER) {
    return filterRecentVaultSessions(sessions, now);
  }

  if (weekFilter === "all") {
    return sessions;
  }

  return sessions.filter(
    (session) => getWeekLabel(session.date) === weekFilter
  );
}

export type PoleJumpHistoryEntry = {
  jumpId: string;
  sessionId: string;
  date: string;
  run: string;
  grip: string;
  takeoff: string;
  comment: string;
  grade?: Jump["grade"];
  result?: Jump["result"];
  barHeight?: string;
  standards?: string;
};

export function isCompetitionSession(
  session: Pick<VaultSession, "mode">
): boolean {
  return session.mode === "competition";
}

export function filterCompetitionVaultSessions(
  sessions: VaultSession[]
): VaultSession[] {
  return sessions.filter(isCompetitionSession);
}

/** Medal emoji for 1st–3rd; otherwise null. */
export function getCompetitionPlaceMedal(
  place?: number | null
): string | null {
  if (place === 1) return "🥇";
  if (place === 2) return "🥈";
  if (place === 3) return "🥉";
  return null;
}

export function normalizeCompetitionPlace(
  value: unknown
): number | undefined {
  const place =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.trim())
        : NaN;

  if (!Number.isInteger(place) || place < 1) {
    return undefined;
  }

  return place;
}

export function formatCompetitionPlaceLabel(
  place?: number | null
): string | null {
  if (place == null || place < 1) {
    return null;
  }

  const remainder = place % 100;
  if (remainder >= 11 && remainder <= 13) {
    return `${place}th`;
  }

  switch (place % 10) {
    case 1:
      return `${place}st`;
    case 2:
      return `${place}nd`;
    case 3:
      return `${place}rd`;
    default:
      return `${place}th`;
  }
}

/** Highest cleared (make) bar height among competition jumps, or null. */
export function getHighestMakeBarHeight(jumps: Jump[]): string | null {
  let bestLabel: string | null = null;
  let bestMeters = -1;

  for (const jump of jumps) {
    if (jump.result !== "make") {
      continue;
    }

    const raw = jump.barHeight?.trim();
    if (!raw) {
      continue;
    }

    const meters = parseVaultPRToMeters(raw);
    if (meters === null) {
      continue;
    }

    if (meters > bestMeters) {
      bestMeters = meters;
      bestLabel = normalizeVaultPR(raw);
    }
  }

  return bestLabel;
}

export function getPoleJumpHistory(
  sessions: VaultSession[],
  poleId: string
): PoleJumpHistoryEntry[] {
  const entries: PoleJumpHistoryEntry[] = [];

  for (const session of sessions) {
    for (let index = session.jumps.length - 1; index >= 0; index -= 1) {
      const jump = session.jumps[index];
      if (jump.poleId !== poleId) {
        continue;
      }

      entries.push({
        jumpId: jump.id,
        sessionId: session.id,
        date: session.date,
        run: jump.run,
        grip: jump.grip,
        takeoff: jump.takeoff,
        comment: jump.comment,
        grade: jump.grade,
        result: jump.result,
        barHeight: jump.barHeight,
        standards: jump.standards,
      });
    }
  }

  return entries;
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

export function countJumpResults(jumps: Jump[]): {
  make: number;
  miss: number;
  warmup: number;
} {
  return {
    make: jumps.filter((jump) => jump.result === "make").length,
    miss: jumps.filter((jump) => jump.result === "miss").length,
    warmup: jumps.filter((jump) => !jump.result).length,
  };
}

export function getJumpOutcomeLabel(jump: {
  grade?: Jump["grade"];
  result?: Jump["result"];
}): string {
  if (jump.result === "make") return "Make";
  if (jump.result === "miss") return "Miss";
  if (jump.grade) return getGradeEmoji(jump.grade);
  return "Warmup";
}

export function getCompetitionJumpTintClass(
  result?: Jump["result"]
): string {
  if (result === "make") {
    return "border-emerald-400/60 bg-emerald-500/15";
  }
  if (result === "miss") {
    return "border-red-400/60 bg-red-500/15";
  }
  return "border-border bg-surface";
}

export function getCompetitionOutcomeTagClass(
  result?: Jump["result"]
): string {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide";

  if (result === "make") {
    return `${base} border-emerald-300 bg-emerald-600 text-white shadow-sm`;
  }
  if (result === "miss") {
    return `${base} border-red-300 bg-red-600 text-white shadow-sm`;
  }
  return `${base} border-border bg-zinc-200 text-zinc-800 [data-theme-mode=dark]:border-zinc-500 [data-theme-mode=dark]:bg-zinc-700 [data-theme-mode=dark]:text-zinc-100`;
}

export function createJump(params: {
  run: string;
  grip: string;
  takeoff: string;
  grade?: Jump["grade"];
  result?: Jump["result"];
  barHeight?: string;
  standards?: string;
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
    result: params.result,
    barHeight: params.barHeight?.trim()
      ? params.barHeight.trim()
      : undefined,
    standards: params.standards?.trim() ? params.standards.trim() : undefined,
    comment: params.comment,
    poleId: params.poleId,
    poleLabel: params.poleLabel,
  };
}

export function createVaultSession(params: {
  keys: string[];
  jumps: Jump[];
  mode?: VaultSession["mode"];
  title?: string;
  place?: number;
}): VaultSession {
  const mode = params.mode ?? "practice";
  const title = params.title?.trim();
  const place =
    mode === "competition"
      ? normalizeCompetitionPlace(params.place)
      : undefined;

  return {
    id: crypto.randomUUID(),
    date: new Date().toLocaleDateString(),
    keys:
      mode === "competition"
        ? []
        : params.keys.filter((key) => key.trim() !== ""),
    jumps: params.jumps,
    mode,
    ...(mode === "competition" && title ? { title } : {}),
    ...(place !== undefined ? { place } : {}),
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

export type JumpFormState = {
  run: string;
  grip: string;
  takeoff: string;
  grade: NonNullable<Jump["grade"]>;
  result?: Jump["result"];
  barHeight: string;
  standards: string;
  comment: string;
  poleId?: string;
};

export function emptyJumpForm(): JumpFormState {
  return {
    run: "",
    grip: "",
    takeoff: "",
    grade: "green",
    result: undefined,
    barHeight: "",
    standards: "",
    comment: "",
    poleId: undefined,
  };
}

/** Keep run/grip/takeoff/pole/bar height/standards; clear comment + result. */
export function carryForwardJumpForm(form: JumpFormState): JumpFormState {
  return {
    run: form.run,
    grip: form.grip,
    takeoff: form.takeoff,
    grade: form.grade,
    result: undefined,
    barHeight: form.barHeight,
    standards: form.standards,
    comment: "",
    poleId: form.poleId,
  };
}

export type VaultSessionDraft = {
  keys: string[];
  jumps: Jump[];
  jumpForm: JumpFormState;
  competitionMode: boolean;
};

export function emptyVaultSessionDraft(): VaultSessionDraft {
  return {
    keys: [""],
    jumps: [],
    jumpForm: emptyJumpForm(),
    competitionMode: false,
  };
}

export function isVaultSessionDraftEmpty(draft: VaultSessionDraft): boolean {
  const hasKeys = draft.keys.some((key) => key.trim() !== "");
  const hasJumps = draft.jumps.length > 0;
  const form = draft.jumpForm;

  return (
    !draft.competitionMode &&
    !hasKeys &&
    !hasJumps &&
    form.run.trim() === "" &&
    form.grip.trim() === "" &&
    form.takeoff.trim() === "" &&
    form.barHeight.trim() === "" &&
    form.standards.trim() === "" &&
    form.comment.trim() === "" &&
    !form.result &&
    !form.poleId
  );
}

function isJumpGrade(value: unknown): value is NonNullable<Jump["grade"]> {
  return value === "green" || value === "yellow" || value === "red";
}

function isJumpResult(value: unknown): value is NonNullable<Jump["result"]> {
  return value === "make" || value === "miss";
}

export function isPersistedJump(value: unknown): value is Jump {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Jump;
  if (
    typeof entry.id !== "string" ||
    typeof entry.run !== "string" ||
    typeof entry.grip !== "string" ||
    typeof entry.takeoff !== "string" ||
    typeof entry.comment !== "string"
  ) {
    return false;
  }

  const hasGrade = entry.grade === undefined || isJumpGrade(entry.grade);
  const hasResult = entry.result === undefined || isJumpResult(entry.result);
  return hasGrade && hasResult;
}

export function normalizeVaultSessionDraft(
  value: unknown
): VaultSessionDraft | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const keys = Array.isArray(record.keys)
    ? record.keys.filter((key): key is string => typeof key === "string")
    : [""];
  const jumps = Array.isArray(record.jumps)
    ? record.jumps.filter(isPersistedJump)
    : [];

  const jumpFormRaw = record.jumpForm;
  if (!jumpFormRaw || typeof jumpFormRaw !== "object") {
    return null;
  }

  const form = jumpFormRaw as Record<string, unknown>;
  const grade = isJumpGrade(form.grade) ? form.grade : "green";
  const result = isJumpResult(form.result) ? form.result : undefined;

  const jumpForm: JumpFormState = {
    run: typeof form.run === "string" ? form.run : "",
    grip: typeof form.grip === "string" ? form.grip : "",
    takeoff: typeof form.takeoff === "string" ? form.takeoff : "",
    grade,
    result,
    barHeight: typeof form.barHeight === "string" ? form.barHeight : "",
    standards: typeof form.standards === "string" ? form.standards : "",
    comment: typeof form.comment === "string" ? form.comment : "",
    poleId: typeof form.poleId === "string" ? form.poleId : undefined,
  };

  const draft: VaultSessionDraft = {
    keys: keys.length > 0 ? keys : [""],
    jumps,
    jumpForm,
    competitionMode: record.competitionMode === true,
  };

  return isVaultSessionDraftEmpty(draft) ? null : draft;
}
