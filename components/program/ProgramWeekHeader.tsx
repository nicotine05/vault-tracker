import Link from "next/link";
import Card from "@/components/Card";
import { getPhaseBadgeClass } from "@/lib/ui/phaseStyles";

type ProgramWeekHeaderProps = {
  planningWeek: number;
  currentWeek: number;
  phaseName: string;
  isPlanning?: boolean;
};

export default function ProgramWeekHeader({
  planningWeek,
  currentWeek,
  phaseName,
  isPlanning = false,
}: ProgramWeekHeaderProps) {
  return (
    <Card
      className={
        isPlanning
          ? "border-accent/30 bg-gradient-to-br from-surface via-surface-accent to-accent-soft/40"
          : undefined
      }
    >
      <div className="text-center">
        <p className="text-lg font-bold text-foreground">Week {planningWeek}</p>
        <span
          className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getPhaseBadgeClass(phaseName)}`}
        >
          {phaseName}
        </span>

        {planningWeek > currentWeek && (
          <span className="mt-2 block text-xs font-medium text-accent-text">
            Planning ahead for this week
          </span>
        )}

        {isPlanning && (
          <p className="mt-3 text-sm text-muted">
            Build your week below, then generate your schedule.
          </p>
        )}

        <Link
          href="/settings"
          className="mt-3 inline-block text-xs font-medium text-accent-text hover:underline"
        >
          Change week in Settings →
        </Link>
      </div>
    </Card>
  );
}
