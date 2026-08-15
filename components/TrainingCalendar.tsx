"use client";

import { useEffect, useMemo, useState } from "react";
import type { WorkoutExecutionRecord } from "@/lib/domain/types";
import {
  getRecordCalendarDate,
  getScheduledSessionsForDate,
  toLocalDateKey,
} from "@/lib/domain/calendarUtils";
import {
  getCatalogWorkout,
  type TrainingType,
} from "@/lib/trainingProgram";
import {
  loadProgramState,
  MAX_PLAN_AHEAD_WEEKS,
  subscribeProgramState,
} from "@/lib/storage/programStore";
import { trainingTypeStyles } from "@/lib/ui/trainingStyles";

type DaySessionView = {
  id: string;
  name: string;
  type: TrainingType;
  status: "completed" | "scheduled";
  completedAt?: string;
  load?: number;
  focus?: string;
  jumpVolume?: string;
  weekNumber?: number;
};

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getCompletionsForDate(
  history: Record<string, WorkoutExecutionRecord>,
  dateKey: string,
  currentWeek: number
): WorkoutExecutionRecord[] {
  return Object.values(history).filter((record) => {
    return getRecordCalendarDate(record, currentWeek) === dateKey;
  });
}

function buildDaySessions(
  dateKey: string,
  executionHistory: Record<string, WorkoutExecutionRecord>,
  currentWeek: number,
  schedulesByWeek: Record<
    number,
    Record<string, { sessions: Array<{ id: string; type: string; name: string; load: number; focus?: string; jumpVolume?: string }> }>
  >
): DaySessionView[] {
  const completions = getCompletionsForDate(
    executionHistory,
    dateKey,
    currentWeek
  );

  const views: DaySessionView[] = completions.map((record) => ({
    id: record.sessionId,
    name: record.sessionName,
    type: record.sessionType,
    status: "completed",
    completedAt: record.completedAt,
    weekNumber: record.weekNumber,
  }));

  const completedIds = new Set(views.map((view) => view.id));

  const scheduled = getScheduledSessionsForDate(
    dateKey,
    currentWeek,
    schedulesByWeek,
    MAX_PLAN_AHEAD_WEEKS
  );

  for (const session of scheduled) {
    if (completedIds.has(session.id)) continue;

    views.push({
      id: session.id,
      name: session.name,
      type: session.type as TrainingType,
      status: "scheduled",
      load: session.load,
      focus: session.focus,
      jumpVolume: session.jumpVolume,
      weekNumber: session.weekNumber,
    });
  }

  return views;
}

export default function TrainingCalendar() {
  const [programState, setProgramState] = useState(loadProgramState);
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateKey(new Date()));
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  useEffect(() => {
    setProgramState(loadProgramState());
    return subscribeProgramState(() => {
      setProgramState(loadProgramState());
    });
  }, []);

  const { currentWeek, executionHistory, scheduleSnapshotsByWeek } =
    programState;

  const schedulesByWeek = useMemo(() => {
    const result: Record<
      number,
      Record<string, { sessions: Array<{ id: string; type: string; name: string; load: number; focus?: string; jumpVolume?: string }> }>
    > = {};

    for (const [weekKey, snapshot] of Object.entries(scheduleSnapshotsByWeek)) {
      result[Number(weekKey)] = snapshot.schedule;
    }

    return result;
  }, [scheduleSnapshotsByWeek]);

  const monthLabel = useMemo(
    () =>
      currentMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [currentMonth]
  );

  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: Array<Date | null> = [];

    for (let i = 0; i < firstWeekday; i += 1) {
      days.push(null);
    }

    for (let day = 1; day <= totalDays; day += 1) {
      days.push(new Date(year, month, day));
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [currentMonth]);

  const selectedDaySessions = useMemo(
    () =>
      buildDaySessions(
        selectedDate,
        executionHistory,
        currentWeek,
        schedulesByWeek
      ),
    [selectedDate, executionHistory, currentWeek, schedulesByWeek]
  );

  const selectedDateLabel = new Date(
    `${selectedDate}T00:00:00`
  ).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  function handleSelectDate(dateKey: string) {
    setSelectedDate(dateKey);
    setExpandedSessionId(null);
  }

  function handleToggleSession(sessionId: string) {
    setExpandedSessionId((prev) => (prev === sessionId ? null : sessionId));
  }

  return (
    <div className="mt-4 rounded-2xl border border-border bg-surface p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-foreground">Training Calendar</h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
              )
            }
            className="h-7 w-7 rounded-lg border border-border bg-surface-muted text-sm text-foreground hover:bg-surface-accent"
            aria-label="Previous month"
          >
            ←
          </button>

          <span className="min-w-[110px] text-center text-xs font-semibold text-foreground">
            {monthLabel}
          </span>

          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
              )
            }
            className="h-7 w-7 rounded-lg border border-border bg-surface-muted text-sm text-foreground hover:bg-surface-accent"
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted">
        {dayNames.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {monthDays.map((date, index) => {
          if (!date) {
            return (
              <div key={`empty-${index}`} className="h-12 rounded-lg bg-surface-muted" />
            );
          }

          const dateKey = toLocalDateKey(date);
          const isSelected = dateKey === selectedDate;
          const daySessions = buildDaySessions(
            dateKey,
            executionHistory,
            currentWeek,
            schedulesByWeek
          );

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => handleSelectDate(dateKey)}
              className={`flex h-12 flex-col items-center justify-center rounded-lg border text-[10px] transition ${
                isSelected
                  ? "border-accent bg-surface-accent ring-1 ring-accent/30"
                  : "border-border bg-surface hover:border-border-accent hover:bg-surface-muted"
              }`}
            >
              <span className="text-foreground">{date.getDate()}</span>

              <div className="mt-1 flex items-center justify-center gap-0.5">
                {daySessions.length > 0 ? (
                  daySessions.slice(0, 3).map((session) =>
                    session.status === "completed" ? (
                      <span
                        key={`${dateKey}-${session.id}-done`}
                        className={`h-2 w-2 rounded-full ${trainingTypeStyles[session.type].dot}`}
                        aria-hidden="true"
                      />
                    ) : (
                      <span
                        key={`${dateKey}-${session.id}-plan`}
                        className={`h-2 w-2 rounded-full border bg-surface ${trainingTypeStyles[session.type].ring}`}
                        aria-hidden="true"
                      />
                    )
                  )
                ) : (
                  <span
                    className="h-2 w-2 rounded-full bg-border"
                    aria-hidden="true"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl border border-border bg-surface-muted p-2">
        <p className="text-[11px] font-semibold text-muted">
          {selectedDateLabel}
        </p>

        {selectedDaySessions.length === 0 ? (
          <p className="mt-2 text-[11px] text-muted">No training this day</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {selectedDaySessions.map((session) => {
              const isExpanded = expandedSessionId === session.id;
              const catalog = getCatalogWorkout(session.id);

              return (
                <li key={`${selectedDate}-${session.id}`}>
                  <button
                    type="button"
                    onClick={() => handleToggleSession(session.id)}
                    className={`flex w-full items-center justify-between rounded-lg border px-2 py-1.5 text-left text-[11px] ${trainingTypeStyles[session.type].row}`}
                  >
                    <span className="font-medium">
                      {session.status === "completed" ? "✓ " : "○ "}
                      {session.name}
                      {session.weekNumber !== undefined &&
                        session.weekNumber > currentWeek && (
                          <span className="ml-1 text-[9px] opacity-70">
                            (W{session.weekNumber})
                          </span>
                        )}
                    </span>
                    <span className="text-[10px] opacity-70">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="mt-1 rounded-lg border border-border bg-surface px-2 py-1.5 text-[10px] text-muted">
                      <p>
                        <span className="font-semibold text-foreground">Status:</span>{" "}
                        {session.status === "completed"
                          ? `Completed ${new Date(
                              session.completedAt!
                            ).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}`
                          : "Scheduled (not checked off yet)"}
                      </p>

                      {session.load !== undefined && (
                        <p className="mt-1">
                          <span className="font-semibold text-foreground">Load:</span>{" "}
                          {session.load}
                        </p>
                      )}

                      {session.focus && (
                        <p className="mt-1">
                          <span className="font-semibold text-foreground">Focus:</span>{" "}
                          {session.focus}
                        </p>
                      )}

                      {session.jumpVolume && (
                        <p className="mt-1">
                          <span className="font-semibold text-foreground">Jumps:</span>{" "}
                          {session.jumpVolume}
                        </p>
                      )}

                      {catalog && "description" in catalog && (
                        <p className="mt-1">{catalog.description}</p>
                      )}

                      {catalog && "purpose" in catalog && (
                        <p className="mt-1">{catalog.purpose}</p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-2 text-[10px] text-muted">
          Filled dots = done · Rings = scheduled (includes plan-ahead weeks)
        </p>
      </div>
    </div>
  );
}
