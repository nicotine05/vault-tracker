import { program } from "@/lib/data";
import { getPhaseNameForWeek } from "@/lib/domain/programWeek";
import type { PlannerDay } from "@/lib/trainingProgram";
import type { WeekScheduleSnapshot } from "@/lib/storage/programStore";

export type ProgramCycleReason =
  | "initial"
  | "injury-resume"
  | "injury-phase-restart"
  | "program-restart";

export type ProgramCycle = {
  id: string;
  cycleNumber: number;
  startedAt: string;
  endedAt?: string;
  startWeek: number;
  endWeek?: number;
  phaseAtStart: string;
  reason: ProgramCycleReason;
};

export type ProgramCycleState = {
  activeCycleId: string;
  cycles: ProgramCycle[];
};

export function getPhaseStartWeek(weekNumber: number): number {
  const phase = program.phases.find(
    (entry) => weekNumber >= entry.startWeek && weekNumber <= entry.endWeek
  );

  return phase?.startWeek ?? 1;
}

export function createInitialProgramCycle(startWeek: number): ProgramCycleState {
  const cycle: ProgramCycle = {
    id: crypto.randomUUID(),
    cycleNumber: 1,
    startedAt: new Date().toISOString(),
    startWeek,
    phaseAtStart: getPhaseNameForWeek(startWeek),
    reason: "initial",
  };

  return {
    activeCycleId: cycle.id,
    cycles: [cycle],
  };
}

export function startProgramCycle(
  state: ProgramCycleState,
  startWeek: number,
  reason: ProgramCycleReason,
  endPreviousAtWeek?: number
): ProgramCycleState {
  const now = new Date().toISOString();
  const previousEndWeek =
    endPreviousAtWeek ?? Math.max(0, startWeek - 1);
  const endedCycles = state.cycles.map((cycle) =>
    cycle.id === state.activeCycleId && !cycle.endedAt
      ? { ...cycle, endedAt: now, endWeek: previousEndWeek }
      : cycle
  );

  const nextCycle: ProgramCycle = {
    id: crypto.randomUUID(),
    cycleNumber: endedCycles.length + 1,
    startedAt: now,
    startWeek,
    phaseAtStart: getPhaseNameForWeek(startWeek),
    reason,
  };

  return {
    activeCycleId: nextCycle.id,
    cycles: [...endedCycles, nextCycle],
  };
}

export function normalizeProgramCycleState(value: unknown): ProgramCycleState {
  if (!value || typeof value !== "object") {
    return createInitialProgramCycle(1);
  }

  const record = value as Record<string, unknown>;
  const cycles = Array.isArray(record.cycles)
    ? record.cycles
        .map((cycle): ProgramCycle | null => {
          if (!cycle || typeof cycle !== "object") {
            return null;
          }

          const entry = cycle as Record<string, unknown>;
          if (
            typeof entry.id !== "string" ||
            typeof entry.cycleNumber !== "number" ||
            typeof entry.startedAt !== "string" ||
            typeof entry.startWeek !== "number" ||
            typeof entry.phaseAtStart !== "string"
          ) {
            return null;
          }

          const reason = entry.reason;
          const validReason =
            reason === "initial" ||
            reason === "injury-resume" ||
            reason === "injury-phase-restart" ||
            reason === "program-restart"
              ? reason
              : "initial";

          return {
            id: entry.id,
            cycleNumber: entry.cycleNumber,
            startedAt: entry.startedAt,
            endedAt:
              typeof entry.endedAt === "string" ? entry.endedAt : undefined,
            startWeek: entry.startWeek,
            endWeek:
              typeof entry.endWeek === "number" ? entry.endWeek : undefined,
            phaseAtStart: entry.phaseAtStart,
            reason: validReason,
          };
        })
        .filter((cycle): cycle is ProgramCycle => cycle !== null)
    : [];

  if (cycles.length === 0) {
    return createInitialProgramCycle(1);
  }

  const activeCycleId =
    typeof record.activeCycleId === "string" &&
    cycles.some((cycle) => cycle.id === record.activeCycleId)
      ? record.activeCycleId
      : cycles[cycles.length - 1]!.id;

  return {
    activeCycleId,
    cycles,
  };
}

export function pruneProgramScheduleFromWeek(
  plannerByWeek: Record<number, Record<string, PlannerDay>>,
  scheduleSnapshotsByWeek: Record<number, WeekScheduleSnapshot>,
  fromWeek: number
): {
  plannerByWeek: Record<number, Record<string, PlannerDay>>;
  scheduleSnapshotsByWeek: Record<number, WeekScheduleSnapshot>;
} {
  const nextPlanner: Record<number, Record<string, PlannerDay>> = {};
  const nextSnapshots: Record<number, WeekScheduleSnapshot> = {};

  for (const [weekKey, planner] of Object.entries(plannerByWeek)) {
    const week = Number(weekKey);
    if (week < fromWeek) {
      nextPlanner[week] = planner;
    }
  }

  for (const [weekKey, snapshot] of Object.entries(scheduleSnapshotsByWeek)) {
    const week = Number(weekKey);
    if (week < fromWeek) {
      nextSnapshots[week] = snapshot;
    }
  }

  return {
    plannerByWeek: nextPlanner,
    scheduleSnapshotsByWeek: nextSnapshots,
  };
}
