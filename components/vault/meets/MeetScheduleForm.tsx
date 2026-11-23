"use client";

import Card from "@/components/Card";
import type { MeetFormValues } from "@/lib/domain/meetSchedule";
import {
  fieldClassName,
  primaryButtonClassName,
} from "@/lib/ui/componentStyles";

type MeetScheduleFormProps = {
  values: MeetFormValues;
  error: string | null;
  onChange: (next: MeetFormValues) => void;
  onSubmit: () => void;
};

export default function MeetScheduleForm({
  values,
  error,
  onChange,
  onSubmit,
}: MeetScheduleFormProps) {
  return (
    <Card>
      <h2 className="mb-3 text-lg font-bold text-foreground">Add meet</h2>

      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Meet name
          </label>
          <input
            type="text"
            value={values.name}
            onChange={(event) =>
              onChange({ ...values, name: event.target.value })
            }
            placeholder="Conference Championships"
            className={fieldClassName}
            autoComplete="off"
            required
          />
        </div>

        {/* Stacked full-width fields — iOS date/time inputs overflow 2-col grids. */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Date
          </label>
          <input
            type="date"
            value={values.dateKey}
            onChange={(event) =>
              onChange({ ...values, dateKey: event.target.value })
            }
            className={`${fieldClassName} box-border min-w-0 max-w-full`}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Start time
          </label>
          <input
            type="time"
            value={values.startTime}
            onChange={(event) =>
              onChange({ ...values, startTime: event.target.value })
            }
            className={`${fieldClassName} box-border min-w-0 max-w-full`}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Location
          </label>
          <input
            type="text"
            value={values.location}
            onChange={(event) =>
              onChange({ ...values, location: event.target.value })
            }
            placeholder="Memorial Stadium"
            className={fieldClassName}
            autoComplete="off"
            required
          />
        </div>

        {error ? (
          <p className="text-sm text-red-600 [data-theme-mode=dark]:text-red-400">
            {error}
          </p>
        ) : null}

        <button type="submit" className={primaryButtonClassName}>
          Save meet
        </button>
      </form>
    </Card>
  );
}
