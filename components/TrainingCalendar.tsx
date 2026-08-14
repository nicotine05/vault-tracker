"use client";

import { useMemo, useState } from "react";

type TrainingType = "vault" | "strength" | "speed";

type PlannerEntry = {
  vault: boolean;
  strength: boolean;
  speed: boolean;
};

type PlannerMap = Record<number, Record<string, PlannerEntry>>;

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

function getPlannerForCurrentWeek() {
  if (typeof window === "undefined") return {} as Record<string, PlannerEntry>;

  const savedPlanner = localStorage.getItem("weeklyPlannerByWeek") || "{}";
  const selectedWeek = Number(
    localStorage.getItem("selectedWeek") || localStorage.getItem("currentWeek") || "1"
  );

  try {
    return JSON.parse(savedPlanner)?.[selectedWeek] || {};
  } catch {
    return {};
  }
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
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateKey(new Date()));

  const planner = getPlannerForCurrentWeek();

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

  const selectedPlan = useMemo(() => {
    const date = new Date(`${selectedDate}T00:00:00`);
    const dayName = getDayName(date);
    return planner[dayName] || { vault: false, strength: false, speed: false };
  }, [planner, selectedDate]);

  const selectedTrainingTypes = (Object.keys(trainingStyles) as TrainingType[]).filter(
    (type) => selectedPlan[type]
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
          const entry = isInActiveWeek ? planner[dayName] || { vault: false, strength: false, speed: false } : { vault: false, strength: false, speed: false };
          const trainingTypes = (Object.keys(trainingStyles) as TrainingType[]).filter(
            (type) => entry[type]
          );

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
                  trainingTypes.map((type) => (
                    <span
                      key={`${dateKey}-${type}`}
                      className={`h-2 w-2 rounded-full ${trainingStyles[type].dot}`}
                      aria-label={`${trainingStyles[type].label} planned`}
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
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selectedTrainingTypes.map((type) => (
              <span
                key={type}
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                  type === "vault"
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : type === "strength"
                    ? "border-sky-200 bg-sky-50 text-sky-900"
                    : "border-emerald-200 bg-emerald-50 text-emerald-900"
                }`}
              >
                {trainingStyles[type].label}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[11px] text-slate-500">No planned session</p>
        )}
      </div>
    </div>
  );
}