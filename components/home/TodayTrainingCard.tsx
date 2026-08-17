import Link from "next/link";
import { buildProgramDayHref } from "@/lib/domain/programScheduleView";
import { getTodayWorkoutPlan } from "@/lib/domain/todayTraining";
import type { WeekScheduleSnapshot } from "@/lib/storage/programStore";
import { getTrafficLightSymbol } from "@/lib/trainingProgram";
import { trafficStyles } from "@/lib/ui/trainingStyles";

type TodayTrainingCardProps = {
  currentWeek: number;
  scheduleSnapshotsByWeek: Record<number, WeekScheduleSnapshot>;
};

export default function TodayTrainingCard({
  currentWeek,
  scheduleSnapshotsByWeek,
}: TodayTrainingCardProps) {
  const { todayName, snapshot, dailyPlan: todayWorkoutPlan } =
    getTodayWorkoutPlan(scheduleSnapshotsByWeek, currentWeek);

  const programHref =
    snapshot && todayWorkoutPlan
      ? buildProgramDayHref(todayName, currentWeek)
      : "/program";

  const hasSessions =
    snapshot && todayWorkoutPlan && todayWorkoutPlan.sessions.length > 0;
  const isRestDay =
    snapshot && todayWorkoutPlan && todayWorkoutPlan.sessions.length === 0;

  return (
    <Link href={programHref} className="block h-full">
      <div className="h-full rounded-2xl border border-accent/40 bg-gradient-to-br from-accent-soft via-surface to-surface-accent p-5 shadow-sm transition hover:shadow-md">
        <p className="text-xs font-bold uppercase tracking-widest text-accent-text">
          Today
        </p>

        {!snapshot && (
          <>
            <p className="mt-2 text-lg font-bold text-foreground">
              Build your week
            </p>
            <p className="mt-1 text-sm text-muted">
              Complete your weekly planner to see today&apos;s training.
            </p>
          </>
        )}

        {isRestDay && (
          <>
            <p className="mt-2 text-2xl font-bold text-foreground">Recovery Day</p>
            <p className="mt-1 text-sm text-muted">No training scheduled.</p>
          </>
        )}

        {hasSessions && todayWorkoutPlan && (
          <>
            <p className="mt-1 text-sm font-medium text-muted">{todayName}</p>

            <div className="mt-3 space-y-1">
              {todayWorkoutPlan.sessions.slice(0, 2).map((session) => (
                <p
                  key={session.id}
                  className="text-lg font-bold leading-tight text-foreground"
                >
                  {session.name}
                </p>
              ))}
              {todayWorkoutPlan.sessions.length > 2 && (
                <p className="text-sm text-muted">
                  +{todayWorkoutPlan.sessions.length - 2} more
                </p>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${trafficStyles[todayWorkoutPlan.level]}`}
              >
                {getTrafficLightSymbol(todayWorkoutPlan.level)}
                {todayWorkoutPlan.level}
              </span>
              <span className="text-sm font-medium text-muted">
                {todayWorkoutPlan.sessions.length} session
                {todayWorkoutPlan.sessions.length === 1 ? "" : "s"}
              </span>
            </div>
          </>
        )}

        <p className="mt-4 text-xs font-semibold text-accent-text">
          Open Training →
        </p>
      </div>
    </Link>
  );
}
