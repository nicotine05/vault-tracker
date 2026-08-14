"use client";

import Card from "@/components/Card";
import { program } from "@/lib/data";
import { getPhaseNameForWeek } from "@/lib/domain/programWeek";
import { useProgramState } from "@/lib/hooks/useProgramState";

export default function SettingsPage() {
  const { currentWeek, selectedWeek, setCurrentWeek, setSelectedWeek, advanceToNextWeek } =
    useProgramState();

  const phaseName = getPhaseNameForWeek(currentWeek);
  const canAdvance = currentWeek < program.totalWeeks;

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>

      <Card title="Program Week">
        <p className="text-sm text-gray-500 mb-4">
          This tells the app which week of your 12-week program you&apos;re on.
          It updates your meal plan, training phase, and home screen.
        </p>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
          <button
            type="button"
            onClick={() => setCurrentWeek(currentWeek - 1)}
            disabled={currentWeek <= 1}
            className="px-3 py-1 border rounded-lg disabled:opacity-40"
          >
            ←
          </button>

          <div className="text-center">
            <p className="text-2xl font-bold">Week {currentWeek}</p>
            <p className="text-sm text-gray-500">{phaseName} phase</p>
          </div>

          <button
            type="button"
            onClick={() => setCurrentWeek(currentWeek + 1)}
            disabled={currentWeek >= program.totalWeeks}
            className="px-3 py-1 border rounded-lg disabled:opacity-40"
          >
            →
          </button>
        </div>

        {canAdvance && (
          <button
            type="button"
            onClick={advanceToNextWeek}
            className="mt-4 w-full rounded-xl bg-purple-600 p-3 font-semibold text-white"
          >
            Finish Week {currentWeek} → Start Week {currentWeek + 1}
          </button>
        )}

        {currentWeek >= program.totalWeeks && (
          <p className="mt-4 text-center text-sm text-gray-500">
            You&apos;re on the final week of the program.
          </p>
        )}
      </Card>

      <div className="mt-4">
        <Card title="Program Page Week">
          <p className="text-sm text-gray-500 mb-3">
            The Program tab can show a different week while you plan ahead.
            This only changes what you see on that page.
          </p>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedWeek(selectedWeek - 1)}
              disabled={selectedWeek <= 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-40"
            >
              ←
            </button>

            <span className="font-semibold">Viewing Week {selectedWeek}</span>

            <button
              type="button"
              onClick={() =>
                setSelectedWeek(Math.min(currentWeek + 1, selectedWeek + 1))
              }
              disabled={selectedWeek >= currentWeek + 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-40"
            >
              →
            </button>
          </div>
        </Card>
      </div>
    </main>
  );
}
