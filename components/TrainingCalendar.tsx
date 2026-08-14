"use client";

import { useEffect, useMemo, useState } from "react";
import {
  loadProgramState,
  subscribeProgramState,
} from "@/lib/storage/programStore";

type TrainingType = "vault" | "strength" | "speed";

const trainingStyles: Record<
  TrainingType,
  {
    dot: string;
    label: string;
  }
> = {
  vault: {
    dot: "bg-amber-500",
    label: "Vault",
  },
  strength: {
    dot: "bg-sky-500",
    label: "Strength",
  },
  speed: {
    dot: "bg-emerald-500",
    label: "Speed",
  },
};

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDayName(date: Date) {
  const weekday = date.getDay();

  if (weekday === 0) return "Sunday";
  if (weekday === 1) return "Monday";
  if (weekday === 2) return "Tuesday";
  if (weekday === 3) return "Wednesday";
  if (weekday === 4) return "Thursday";
  if (weekday === 5) return "Friday";
  return "Saturday";
}

export default function TrainingCalendar() {
  const [programState, setProgramState] = useState(loadProgramState);
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateKey(new Date()));

  useEffect(() => {
    setProgramState(loadProgramState());
    return subscribeProgramState(() => {
      setProgramState(loadProgramState());
    });
  }, []);

  const selectedWeek = programState.selectedWeek;
  const snapshot = programState.scheduleSnapshotsByWeek[selectedWeek];
  const schedule = snapshot?.schedule ?? {};

  const weekStart = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    const dayOffset = (today.getDay() + 6) % 7;
    start.setDate(today.getDate() - dayOffset);
    start.setHours(0, 0, 0, 0);
    return start;
  }, []);

  const activeWeekDates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);
        return date;
      }),
    [weekStart]
  );

  const activeWeekKeys = useMemo(
    () => new Set(activeWeekDates.map((date) => toLocalDateKey(date))),
    [activeWeekDates]
  );

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
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
    const totalDays = lastOfMonth.getDate();
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

  const selectedDayName = useMemo(() => {
    const date = new Date(`${selectedDate}T00:00:00`);
    return getDayName(date);
  }, [selectedDate]);

  const selectedSessions = schedule[selectedDayName]?.sessions ?? [];
  const selectedTrainingTypes = selectedSessions.map(
    (session) => session.type
  );

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-slate-900">Training Calendar</h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
              )
            }
            className="h-7 w-7 rounded-lg border border-slate-200 bg-slate-50 text-sm"
          >
            ←
          </button>

          <span className="min-w-[110px] text-center text-xs font-semibold text-slate-700">
            {monthLabel}
          </span>

          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
              )
            }
            className="h-7 w-7 rounded-lg border border-slate-200 bg-slate-50 text-sm"
          >
            →
          </button>
        </div>
      </div>

      <p className="mb-2 text-[11px] text-slate-500">
        Week {selectedWeek} generated schedule
      </p>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {dayNames.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {monthDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-12 rounded-lg bg-slate-50" />;
          }

          const dateKey = toLocalDateKey(date);
          const isSelected = dateKey === selectedDate;
          const dayName = getDayName(date);
          const isInActiveWeek = activeWeekKeys.has(dateKey);
          const sessions = isInActiveWeek
            ? schedule[dayName]?.sessions ?? []
            : [];
          const trainingTypes = sessions.map((session) => session.type);

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedDate(dateKey)}
              className={`flex h-12 flex-col items-center justify-center rounded-lg border text-[10px] transition ${
                isSelected
                  ? "border-violet-400 bg-violet-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span className="text-slate-700">{date.getDate()}</span>

              <div className="mt-1 flex items-center justify-center gap-1">
                {trainingTypes.length > 0 ? (
                  trainingTypes.map((type, typeIndex) => (
                    <span
                      key={`${dateKey}-${type}-${typeIndex}`}
                      className={`h-2 w-2 rounded-full ${trainingStyles[type].dot}`}
                      aria-label={`${trainingStyles[type].label} scheduled`}
                    />
                  ))
                ) : (
                  <span className="h-2 w-2 rounded-full bg-slate-200" aria-hidden="true" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-2">
        <p className="text-[11px] font-semibold text-slate-600">
          {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>

        {selectedTrainingTypes.length > 0 ? (
          <div className="mt-2 space-y-1">
            {selectedSessions.map((session) => (
              <div
                key={session.id}
                className={`inline-flex w-full items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                  session.type === "vault"
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : session.type === "strength"
                    ? "border-sky-200 bg-sky-50 text-sky-900"
                    : "border-emerald-200 bg-emerald-50 text-emerald-900"
                }`}
              >
                {session.name}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[11px] text-slate-500">No scheduled session</p>
        )}
      </div>
    </div>
  );
}
