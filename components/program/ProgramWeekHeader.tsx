import Link from "next/link";
import Card from "@/components/Card";

type ProgramWeekHeaderProps = {
  planningWeek: number;
  currentWeek: number;
  phaseName: string;
};

export default function ProgramWeekHeader({
  planningWeek,
  currentWeek,
  phaseName,
}: ProgramWeekHeaderProps) {
  return (
    <Card>
      <div className="text-center">
        <p className="font-bold">Week {planningWeek}</p>
        <p className="text-sm text-gray-500">{phaseName}</p>

        {planningWeek > currentWeek && (
          <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800">
            Planning ahead
          </span>
        )}

        <Link href="/settings" className="mt-3 block text-xs text-blue-500">
          Change week in Settings →
        </Link>
      </div>
    </Card>
  );
}
