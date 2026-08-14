"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import type { StrengthPRs } from "@/lib/domain/types";
import {
  EMPTY_STRENGTH_PRS,
  loadStrengthPRs,
  saveStrengthPRs,
} from "@/lib/storage/logStore";

export default function StrengthPage() {
  const [prs, setPrs] = useState<StrengthPRs>(EMPTY_STRENGTH_PRS);
  const [benchPR, setBenchPR] = useState("");
  const [squatPR, setSquatPR] = useState("");
  const [pullupPR, setPullupPR] = useState("");

  useEffect(() => {
    setPrs(loadStrengthPRs());
  }, []);

  function handleSave() {
    const today = new Date().toLocaleDateString();
    const updated = { ...prs };

    if (
      benchPR &&
      (!updated.benchPR || Number(benchPR) > Number(updated.benchPR))
    ) {
      updated.benchPR = benchPR;
      updated.benchDate = today;
    }

    if (
      squatPR &&
      (!updated.squatPR || Number(squatPR) > Number(updated.squatPR))
    ) {
      updated.squatPR = squatPR;
      updated.squatDate = today;
    }

    if (
      pullupPR &&
      (!updated.pullupPR || Number(pullupPR) > Number(updated.pullupPR))
    ) {
      updated.pullupPR = pullupPR;
      updated.pullupDate = today;
    }

    setPrs(updated);
    saveStrengthPRs(updated);

    setBenchPR("");
    setSquatPR("");
    setPullupPR("");
  }

  function clearPRs() {
    if (!confirm("Delete all strength PRs?")) return;

    setPrs(EMPTY_STRENGTH_PRS);
    saveStrengthPRs(EMPTY_STRENGTH_PRS);
  }

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Strength PRs</h1>

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
            <label className="block text-sm font-medium mb-1">Bench PR</label>
            <input
              type="number"
              value={benchPR}
              onChange={(e) => setBenchPR(e.target.value)}
              placeholder="245"
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Squat PR</label>
            <input
              type="number"
              value={squatPR}
              onChange={(e) => setSquatPR(e.target.value)}
              placeholder="365"
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pullup PR</label>
            <input
              type="number"
              value={pullupPR}
              onChange={(e) => setPullupPR(e.target.value)}
              placeholder="18"
              className="w-full border rounded-xl p-3"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-red-500 text-white rounded-xl p-3 font-semibold"
          >
            Update PRs
          </button>
        </div>
      </Card>

      <div className="mt-6 space-y-4">
        <Card>
          <div className="text-center py-2">
            <p className="text-3xl mb-2">🏆</p>
            <p className="text-sm text-gray-500">Bench Press PR</p>
            <p className="text-5xl font-bold text-red-500">
              {prs.benchPR || "--"}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {prs.benchDate ? `Set ${prs.benchDate}` : "No PR recorded"}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center py-2">
            <p className="text-3xl mb-2">🏆</p>
            <p className="text-sm text-gray-500">Squat PR</p>
            <p className="text-5xl font-bold text-blue-500">
              {prs.squatPR || "--"}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {prs.squatDate ? `Set ${prs.squatDate}` : "No PR recorded"}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center py-2">
            <p className="text-3xl mb-2">🏆</p>
            <p className="text-sm text-gray-500">Pullup PR</p>
            <p className="text-5xl font-bold text-green-500">
              {prs.pullupPR || "--"}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {prs.pullupDate ? `Set ${prs.pullupDate}` : "No PR recorded"}
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
