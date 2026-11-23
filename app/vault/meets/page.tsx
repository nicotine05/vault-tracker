"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import MeetScheduleForm from "@/components/vault/meets/MeetScheduleForm";
import MeetScheduleList from "@/components/vault/meets/MeetScheduleList";
import {
  createScheduledMeet,
  EMPTY_MEET_FORM,
  partitionMeetsByTiming,
  type MeetFormValues,
} from "@/lib/domain/meetSchedule";
import { useScheduledMeets } from "@/lib/hooks/useScheduledMeets";
import { linkTextClassName } from "@/lib/ui/componentStyles";

export default function MeetSchedulePage() {
  const { meets, ready, addMeet, removeMeet } = useScheduledMeets();
  const [form, setForm] = useState<MeetFormValues>(EMPTY_MEET_FORM);
  const [error, setError] = useState<string | null>(null);

  const { upcoming, past } = useMemo(
    () => partitionMeetsByTiming(meets),
    [meets],
  );

  const handleSubmit = () => {
    const meet = createScheduledMeet(form);
    if (!meet) {
      setError("Enter a meet name, date, location, and start time.");
      return;
    }

    addMeet(meet);
    setForm(EMPTY_MEET_FORM);
    setError(null);
  };

  return (
    <main className="mx-auto max-w-md p-4 pb-24">
      <div className="mb-5">
        <Link href="/vault" className={linkTextClassName}>
          ← Vault
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-foreground">
          Meet Schedule
        </h1>
        <p className="mt-1 text-sm text-muted">
          Add upcoming meets. They also show up on the training calendar day.
        </p>
      </div>

      <div className="space-y-5">
        <MeetScheduleForm
          values={form}
          error={error}
          onChange={(next) => {
            setForm(next);
            if (error) {
              setError(null);
            }
          }}
          onSubmit={handleSubmit}
        />

        {!ready ? (
          <p className="text-sm text-muted">Loading meets…</p>
        ) : (
          <>
            <MeetScheduleList
              title="Upcoming"
              emptyLabel="No upcoming meets yet. Add one above."
              meets={upcoming}
              onDelete={removeMeet}
            />
            <MeetScheduleList
              title="Past"
              emptyLabel="No past meets saved."
              meets={past}
              onDelete={removeMeet}
            />
          </>
        )}
      </div>
    </main>
  );
}
