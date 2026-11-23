"use client";

import Card from "@/components/Card";
import {
  formatMeetDateLabel,
  formatMeetTimeLabel,
  type ScheduledMeet,
} from "@/lib/domain/meetSchedule";
import { destructiveTextClassName } from "@/lib/ui/componentStyles";

type MeetScheduleListProps = {
  title: string;
  emptyLabel: string;
  meets: ScheduledMeet[];
  onDelete: (meetId: string) => void;
};

export default function MeetScheduleList({
  title,
  emptyLabel,
  meets,
  onDelete,
}: MeetScheduleListProps) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
        {title}
      </h2>

      {meets.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">{emptyLabel}</p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {meets.map((meet) => (
            <li key={meet.id}>
              <Card className="border-rose-200/70 bg-rose-50/50 [data-theme-mode=dark]:border-rose-500/30 [data-theme-mode=dark]:bg-rose-500/10">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-foreground">
                      {meet.name}
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {formatMeetDateLabel(meet.dateKey)} ·{" "}
                      {formatMeetTimeLabel(meet.startTime)}
                    </p>
                    <p className="mt-0.5 text-sm text-muted">{meet.location}</p>
                  </div>

                  <button
                    type="button"
                    className={`shrink-0 text-sm font-medium ${destructiveTextClassName}`}
                    onClick={() => onDelete(meet.id)}
                  >
                    Delete
                  </button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
