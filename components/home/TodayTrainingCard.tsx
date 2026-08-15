import Link from "next/link";
import Card from "@/components/Card";
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

  return (
    <Link href="/program">
      <Card className="h-full cursor-pointer transition hover:shadow-md">
        <p className="text-sm text-gray-500">Today&apos;s Training</p>

        {snapshot && todayWorkoutPlan && todayWorkoutPlan.sessions.length > 0 ? (
          <>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-base font-bold leading-tight">{todayName}</p>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${trafficStyles[todayWorkoutPlan.level]}`}
              >
                {getTrafficLightSymbol(todayWorkoutPlan.level)}{" "}
                {todayWorkoutPlan.level}
              </span>
            </div>

            <p className="mt-2 text-xs text-gray-600">
              {todayWorkoutPlan.sessions
                .slice(0, 2)
                .map((session) => session.name)
                .join(" • ")}
              {todayWorkoutPlan.sessions.length > 2 ? " • + more" : ""}
            </p>
          </>
        ) : snapshot && todayWorkoutPlan && todayWorkoutPlan.sessions.length === 0 ? (
          <>
            <p className="mt-2 text-base font-bold text-slate-800">
              Recovery Day.
            </p>
            <p className="mt-1 text-xs text-gray-500">No training scheduled.</p>
          </>
        ) : (
          <p className="mt-2 text-base font-bold text-slate-800">
            Complete your weekly planner.
          </p>
        )}

        <p className="mt-3 text-xs text-blue-500">Tap to open →</p>
      </Card>
    </Link>
  );
}
