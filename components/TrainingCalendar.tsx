"use client";

import { useState } from "react";

type Props = {
  trainingHistory: string[];
};

export default function TrainingCalendar({
  trainingHistory,
}: Props) {
  const [currentMonth, setCurrentMonth] =
    useState(new Date());

  const year =
    currentMonth.getFullYear();

  const month =
    currentMonth.getMonth();

  const firstDay =
    new Date(year, month, 1);

  const lastDay =
    new Date(year, month + 1, 0);

  const daysInMonth =
    lastDay.getDate();

  const startDay =
    firstDay.getDay();

  const monthName =
    currentMonth.toLocaleString(
      "default",
      {
        month: "long",
      }
    );

  const trainingDates =
    new Set(trainingHistory);

  const today = new Date();

  const calendarDays = [];

  for (
    let i = 0;
    i < startDay;
    i++
  ) {
    calendarDays.push(
      <div key={`empty-${i}`} />
    );
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    const dateString = `${year}-${String(
      month + 1
    ).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    const isTrainingDay =
      trainingDates.has(dateString);

    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day;

    calendarDays.push(
      <div
        key={day}
        className={`h-10 rounded-lg flex items-center justify-center text-sm border
          ${
            isTrainingDay
              ? "bg-blue-500 text-white font-bold"
              : ""
          }
          ${
            isToday
              ? "border-2 border-green-500"
              : "border-gray-200"
          }
        `}
      >
        {day}
      </div>
    );
  }

  const monthlyTrainingCount =
    trainingHistory.filter(
      (date) =>
        date.startsWith(
          `${year}-${String(
            month + 1
          ).padStart(2, "0")}`
        )
    ).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(
                year,
                month - 1,
                1
              )
            )
          }
          className="px-3 py-1 border rounded-lg"
        >
          ←
        </button>

        <h2 className="font-bold text-lg">
          {monthName} {year}
        </h2>

        <button
          onClick={() =>
            setCurrentMonth(
              new Date(
                year,
                month + 1,
                1
              )
            )
          }
          className="px-3 py-1 border rounded-lg"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium mb-2">
        <div>Su</div>
        <div>Mo</div>
        <div>Tu</div>
        <div>We</div>
        <div>Th</div>
        <div>Fr</div>
        <div>Sa</div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays}
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Training Days This Month:{" "}
        {monthlyTrainingCount}
      </p>
    </div>
  );
}