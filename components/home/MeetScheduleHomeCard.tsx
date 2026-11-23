"use client";

import Link from "next/link";
import Card from "@/components/Card";
import {
  formatMeetDateLabel,
  formatMeetTimeLabel,
  partitionMeetsByTiming,
} from "@/lib/domain/meetSchedule";
import { useScheduledMeets } from "@/lib/hooks/useScheduledMeets";
import { linkTextClassName } from "@/lib/ui/componentStyles";

const MAX_VISIBLE = 3;

export default function MeetScheduleHomeCard() {
  const { meets, ready } = useScheduledMeets();

  if (!ready) {
    return null;
  }

  const { upcoming } = partitionMeetsByTiming(meets);
  if (upcoming.length === 0) {
    return null;
  }

  const visible = upcoming.slice(0, MAX_VISIBLE);
  const remaining = upcoming.length - visible.length;

  return (
    <div className="mb-4">
      <Card title="Meet Schedule">
        <ul className="space-y-3">
          {visible.map((meet) => (
            <li key={meet.id}>
              <p className="font-medium text-foreground">{meet.name}</p>
              <p className="text-sm text-muted">
                {formatMeetDateLabel(meet.dateKey)} ·{" "}
                {formatMeetTimeLabel(meet.startTime)}
              </p>
              <p className="text-sm text-muted">{meet.location}</p>
            </li>
          ))}
        </ul>

        {remaining > 0 ? (
          <p className="mt-3 text-sm text-muted">
            +{remaining} more upcoming
          </p>
        ) : null}

        <Link
          href="/vault/meets"
          className={`mt-3 inline-block ${linkTextClassName}`}
        >
          View all meets →
        </Link>
      </Card>
    </div>
  );
}
