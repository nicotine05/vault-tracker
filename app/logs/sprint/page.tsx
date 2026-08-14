"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import type { SprintPRs } from "@/lib/domain/types";
import {
  EMPTY_SPRINT_PRS,
  loadSprintPRs,
  saveSprintPRs,
} from "@/lib/storage/logStore";

export default function SprintPage() {
  const [prs, setPrs] = useState<SprintPRs>(EMPTY_SPRINT_PRS);
  const [tenMeter, setTenMeter] = useState("");
  const [twentyMeter, setTwentyMeter] = useState("");
  const [thirtyMeter, setThirtyMeter] = useState("");

  useEffect(() => {
    setPrs(loadSprintPRs());
  }, []);

  function handleSave() {
    const today = new Date().toLocaleDateString();
    const updated = { ...prs };

    if (
      tenMeter &&
      (!updated.tenMeterPR ||
        Number(tenMeter) < Number(updated.tenMeterPR))
    ) {
      updated.tenMeterPR = tenMeter;
      updated.tenMeterDate = today;
    }

    if (
      twentyMeter &&
      (!updated.twentyMeterPR ||
        Number(twentyMeter) < Number(updated.twentyMeterPR))
    ) {
      updated.twentyMeterPR = twentyMeter;
      updated.twentyMeterDate = today;
    }

    if (
      thirtyMeter &&
      (!updated.thirtyMeterPR ||
        Number(thirtyMeter) < Number(updated.thirtyMeterPR))
    ) {
      updated.thirtyMeterPR = thirtyMeter;
      updated.thirtyMeterDate = today;
    }

    setPrs(updated);
    saveSprintPRs(updated);

    setTenMeter("");
    setTwentyMeter("");
    setThirtyMeter("");
  }

  function clearPRs() {
    if (!confirm("Delete all sprint PRs?")) return;

    setPrs(EMPTY_SPRINT_PRS);
    saveSprintPRs(EMPTY_SPRINT_PRS);
  }

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Sprint PRs</h1>

        <button
          onClick={clearPRs}
          className="text-xs text-red-500 border border-red-300 px-3 py-1 rounded-lg"
        >
          Reset
        </button>
      </div>

      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">10m PR</label>
            <input
              type="number"
              step="0.01"
              value={tenMeter}
              onChange={(e) => setTenMeter(e.target.value)}
              placeholder="1.72"
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">20m PR</label>
            <input
              type="number"
              step="0.01"
              value={twentyMeter}
              onChange={(e) => setTwentyMeter(e.target.value)}
              placeholder="3.04"
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">30m PR</label>
            <input
              type="number"
              step="0.01"
              value={thirtyMeter}
              onChange={(e) => setThirtyMeter(e.target.value)}
              placeholder="4.21"
              className="w-full border rounded-xl p-3"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-green-500 text-white rounded-xl p-3 font-semibold"
          >
            Update PRs
          </button>
        </div>
      </Card>

      <div className="mt-6 space-y-4">
        <Card>
          <div className="text-center py-2">
            <p className="text-3xl mb-2">🏆</p>
            <p className="text-sm text-gray-500">10 Meter PR</p>
            <p className="text-5xl font-bold text-green-500">
              {prs.tenMeterPR || "--"}
            </p>
            <p className="text-sm text-gray-500 mt-1">seconds</p>
            <p className="text-xs text-gray-500 mt-2">
              {prs.tenMeterDate
                ? `Set ${prs.tenMeterDate}`
                : "No PR recorded"}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center py-2">
            <p className="text-3xl mb-2">🏆</p>
            <p className="text-sm text-gray-500">20 Meter PR</p>
            <p className="text-5xl font-bold text-blue-500">
              {prs.twentyMeterPR || "--"}
            </p>
            <p className="text-sm text-gray-500 mt-1">seconds</p>
            <p className="text-xs text-gray-500 mt-2">
              {prs.twentyMeterDate
                ? `Set ${prs.twentyMeterDate}`
                : "No PR recorded"}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center py-2">
            <p className="text-3xl mb-2">🏆</p>
            <p className="text-sm text-gray-500">30 Meter PR</p>
            <p className="text-5xl font-bold text-purple-500">
              {prs.thirtyMeterPR || "--"}
            </p>
            <p className="text-sm text-gray-500 mt-1">seconds</p>
            <p className="text-xs text-gray-500 mt-2">
              {prs.thirtyMeterDate
                ? `Set ${prs.thirtyMeterDate}`
                : "No PR recorded"}
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
