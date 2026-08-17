"use client";

import type { DailySchedule } from "@/lib/trainingProgram";
import { getTrafficLightSymbol } from "@/lib/trainingProgram";
import { trafficStyles } from "@/lib/ui/trainingStyles";

type TodayWorkoutHeroProps = {
  todayName: string;
  dailyPlan: DailySchedule;
  onOpenTraining: () => void;
};

export default function TodayWorkoutHero({
  todayName,
  dailyPlan,
  onOpenTraining,
}: TodayWorkoutHeroProps) {
  const sessions = dailyPlan.sessions;
  const isRestDay = sessions.length === 0;

  return (
    <div className="rounded-2xl border border-accent/40 bg-gradient-to-br from-accent-soft via-surface to-surface-accent p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-accent-text">
        Today
      </p>

      {isRestDay ? (
        <>
          <p className="mt-2 text-2xl font-bold text-foreground">Recovery Day</p>
          <p className="mt-1 text-sm text-muted">No training scheduled.</p>
        </>
      ) : (
        <>
          <p className="mt-1 text-sm font-medium text-muted">{todayName}</p>

          <div className="mt-3 space-y-1">
            {sessions.map((session) => (
              <p key={session.id} className="text-lg font-bold leading-tight text-foreground">
                {session.name}
              </p>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${trafficStyles[dailyPlan.level]}`}
            >
              {getTrafficLightSymbol(dailyPlan.level)}
              Traffic Light: {dailyPlan.level}
            </span>
            <span className="text-sm font-medium text-muted">
              {sessions.length} session{sessions.length === 1 ? "" : "s"}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenTraining}
            className="mt-4 w-full rounded-xl bg-accent py-3 text-sm font-bold text-white shadow-lg shadow-accent/20 transition hover:opacity-95"
          >
            Open Training
          </button>
        </>
      )}
    </div>
  );
}
