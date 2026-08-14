"use client";

import { useEffect, useMemo, useState } from "react";

type TrainingType = "vault" | "strength" | "speed";

type DayTraining = {
  vault: boolean;
  strength: boolean;
  speed: boolean;
  notes: string;
};

type TrainingCalendarMap = Record<string, DayTraining>;

const trainingStyles: Record<
  TrainingType,
  {
    dot: string;
    chip: string;
    label: string;
  }
> = {
  vault: {
    dot: "bg-amber-500",
    chip: "border-amber-200 bg-amber-50 text-amber-900",
    label: "Vault",
  },
  strength: {
    dot: "bg-sky-500",
    chip: "border-sky-200 bg-sky-50 text-sky-900",
    label: "Strength",
  },
  speed: {
    dot: "bg-emerald-500",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-900",
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

export default function TrainingCalendar() {
  const [calendar, setCalendar] = useState<TrainingCalendarMap>({});
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateKey(new Date()));

  useEffect(() => {
    const saved = localStorage.getItem("trainingCalendar");

    if (!saved) return;

    try {
      setCalendar(JSON.parse(saved));
    } catch {
      console.error("Failed to load training calendar");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("trainingCalendar", JSON.stringify(calendar));
  }, [calendar]);

  const selectedEntry = calendar[selectedDate] || {
    vault: false,
    strength: false,
    speed: false,
    notes: "",
  };

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
    const allDays: Array<Date | null> = [];

    for (let i = 0; i < firstWeekday; i += 1) {
      allDays.push(null);
    }

    for (let day = 1; day <= totalDays; day += 1) {
      allDays.push(new Date(year, month, day));
    }

    while (allDays.length % 7 !== 0) {
      allDays.push(null);
    }

    return allDays;
  }, [currentMonth]);

  function updateSession(dateKey: string, type: TrainingType) {
    setCalendar((prev) => {
      const current = prev[dateKey] || {
        vault: false,
        strength: false,
        speed: false,
        notes: "",
      };

      const next = {
        ...current,
        [type]: !current[type],
      };

      return {
        ...prev,
        [dateKey]: next,
      };
    });
  }

  function updateNotes(dateKey: string, value: string) {
    setCalendar((prev) => ({
      ...prev,
      [dateKey]: {
        vault: prev[dateKey]?.vault || false,
        strength: prev[dateKey]?.strength || false,
        speed: prev[dateKey]?.speed || false,
        notes: value,
      },
    }));
  }

  const canClearSelectedDay =
    selectedEntry.vault || selectedEntry.strength || selectedEntry.speed || selectedEntry.notes;

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-slate-900">Training Calendar</h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
              )
            }
            className="h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium"
          >
            ←
          </button>

          <span className="min-w-[130px] text-center text-sm font-semibold text-slate-700">
            {monthLabel}
          </span>

          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
              )
            }
            className="h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
        {dayNames.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {monthDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-20 rounded-xl bg-slate-50" />;
          }

          const dateKey = toLocalDateKey(date);
          const isSelected = dateKey === selectedDate;
          const entry = calendar[dateKey];
          const trainingTypes = (Object.keys(trainingStyles) as TrainingType[]).filter(
            (type) => entry?.[type]
          );

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedDate(dateKey)}
              className={`flex h-20 flex-col items-center justify-between rounded-xl border p-2 text-left transition ${
                isSelected
                  ? "border-violet-400 bg-violet-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  dateKey === toLocalDateKey(new Date())
                    ? "rounded-full bg-violet-600 px-2 py-0.5 text-white"
                    : "text-slate-700"
                }`}
              >
                {date.getDate()}
              </span>

              <div className="flex min-h-5 items-center justify-center gap-1">
                {trainingTypes.length > 0 ? (
                  trainingTypes.map((type) => (
                    <span
                      key={`${dateKey}-${type}`}
                      className={`h-2.5 w-2.5 rounded-full ${trainingStyles[type].dot}`}
                      aria-label={`${trainingStyles[type].label} completed`}
                    />
                  ))
                ) : (
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200" aria-hidden="true" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="font-semibold text-slate-800">
            {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>

          {canClearSelectedDay && (
            <button
              type="button"
              onClick={() => {
                setCalendar((prev) => {
                  const next = { ...prev };
                  delete next[selectedDate];
                  return next;
                });
              }}
              className="text-xs font-medium text-red-600"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(trainingStyles) as TrainingType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => updateSession(selectedDate, type)}
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                selectedEntry[type]
                  ? trainingStyles[type].chip
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {trainingStyles[type].label}
            </button>
          ))}
        </div>

        <label className="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-500">
          Notes
        </label>
        <textarea
          value={selectedEntry.notes}
          onChange={(event) => updateNotes(selectedDate, event.target.value)}
          placeholder="What happened that day?"
          className="mt-1 min-h-20 w-full rounded-xl border border-slate-200 bg-white p-2 text-sm text-slate-700 outline-none focus:border-violet-400"
        />
      </div>
    </div>
  );
}