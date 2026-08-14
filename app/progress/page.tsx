"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import TrainingCalendar from "@/components/TrainingCalendar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type LogEntry = {
  date: string;
  bodyWeight: string;
  sleepHours: string;
  readiness: string;
  rpe: string;
  vaultPR: string;
  sprintDone: boolean;
  liftDone: boolean;
  vaultDone: boolean;
  notes: string;
};

type HeightPREntry = {
  date: string;
  threeL: string;
  fourL: string;
  fiveL: string;
  sixL: string;
  sevenL: string;
};

function parseVaultPRToMeters(
  value: string | undefined | null
): number | null {
  if (!value) return null;

  const clean = value
    .toString()
    .trim()
    .toLowerCase();

  if (!clean) return null;

  const match = clean.match(
    /(\d+(?:\.\d+)?)ft\s*(\d+(?:\.\d+)?)in/i
  );

  if (match) {
    const feet = Number(match[1] || "0");
    const inches = Number(match[2] || "0");
    return ((feet * 12) + inches) * 0.0254;
  }

  const ftOnlyMatch = clean.match(
    /(\d+(?:\.\d+)?)ft/i
  );

  if (ftOnlyMatch) {
    const feet = Number(ftOnlyMatch[1] || "0");
    return feet * 0.3048;
  }

  return null;
}

function metersToFeetInches(
  meters: number
) {
  const totalInches =
    meters * 39.3701;

  const feet = Math.floor(
    totalInches / 12
  );

  const inches =
    Math.round(
      totalInches - feet * 12
    );

  if (inches === 0) {
    return `${feet}ft`;
  }

  return `${feet}ft ${inches}in`;
}

export default function ProgressPage() {
  const [logs, setLogs] = useState<
    LogEntry[]
  >([]);

  const [vaultRunPRs, setVaultRunPRs] =
    useState<Record<string, string>>({});

  const [
    trainingHistory,
    setTrainingHistory,
  ] = useState<string[]>([]);

  const [
    prHistory,
    setPrHistory,
  ] = useState<HeightPREntry[]>([]);

  const [
    selectedRun,
    setSelectedRun,
  ] = useState<
    "threeL" |
    "fourL" |
    "fiveL" |
    "sixL" |
    "sevenL"
  >("sevenL");

  useEffect(() => {
    const savedLogs =
      localStorage.getItem("logs");

    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }

    const loadVaultRunPRs = () => {
      const savedVaultRunPRs =
        localStorage.getItem(
          "vaultRunPRs"
        );

      if (savedVaultRunPRs) {
        setVaultRunPRs(
          JSON.parse(savedVaultRunPRs)
        );
      }
    };

    loadVaultRunPRs();

    const savedHistory =
      localStorage.getItem(
        "trainingHistory"
      );

    if (savedHistory) {
      setTrainingHistory(
        JSON.parse(savedHistory)
      );
    }

    const savedPRHistory =
      localStorage.getItem(
        "vaultPRHistory"
      );

    if (savedPRHistory) {
      setPrHistory(
        JSON.parse(savedPRHistory)
      );
    }

    const syncVaultRunPRs = () => {
      loadVaultRunPRs();
    };

    window.addEventListener(
      "vaultRunPRsChanged",
      syncVaultRunPRs
    );

    return () =>
      window.removeEventListener(
        "vaultRunPRsChanged",
        syncVaultRunPRs
      );
  }, []);

  const latestLog =
    logs.length > 0 ? logs[0] : null;

  const START_PR_METERS = 3.6576;
  const GOAL_PR_METERS = 4.57;

  const currentPRMeters =
    Object.values(vaultRunPRs).reduce(
      (max, value) => {
        const parsed =
          parseVaultPRToMeters(value);
        return parsed === null
          ? max
          : Math.max(max, parsed);
      },
      START_PR_METERS
    );

  const maxPRString =
    Object.values(vaultRunPRs)
      .filter((v) => v.trim() !== "")
      .sort((a, b) => {
        const aMeters =
          parseVaultPRToMeters(a) || 0;
        const bMeters =
          parseVaultPRToMeters(b) || 0;
        return bMeters - aMeters;
      })[0] || "";

  const goalProgress = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ((currentPRMeters -
          START_PR_METERS) /
          (GOAL_PR_METERS -
            START_PR_METERS)) *
          100
      )
    )
  );

  const chartData =
    prHistory
      .filter(
        (entry) =>
          entry[selectedRun] &&
          !isNaN(
            parseFloat(
              entry[selectedRun]
            )
          )
      )
      .map((entry) => ({
        date: entry.date,
        pr: parseFloat(
          entry[selectedRun]
        ),
      }))
      .sort(
        (a, b) =>
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
      );

  const minPR =
    chartData.length > 0
      ? Math.floor(
          Math.min(
            ...chartData.map(
              (d) => d.pr
            )
          ) - 2
        )
      : undefined;

  const maxPR =
    chartData.length > 0
      ? Math.ceil(
          Math.max(
            ...chartData.map(
              (d) => d.pr
            )
          ) + 2
        )
      : undefined;

  function formatVaultHeight(
    inches: number
  ) {
    const feet = Math.floor(
      inches / 12
    );

    const remaining =
      Math.round(inches % 12);

    if (remaining === 0) {
      return `${feet}ft`;
    }

    return `${feet}ft ${remaining}in`;
  }

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold mb-4">
        Progress
      </h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <p className="text-sm text-gray-500">
            Current Weight
          </p>

          <p className="text-3xl font-bold">
            {latestLog?.bodyWeight ||
              "--"}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-500">
            Current PR
          </p>

          <p className="font-bold text-xl">
            {maxPRString || "--"}
          </p>
        </Card>
      </div>

      <Card>
        <div className="flex justify-between mb-2">
          <span className="font-medium">
            Goal Progress
          </span>

          <span className="font-bold">
            {goalProgress}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full"
            style={{
              width: `${goalProgress}%`,
            }}
          />
        </div>

        <p className="text-sm text-gray-500 mt-2">
          Goal: 15ft
        </p>
      </Card>

      <div className="mt-4">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <p className="font-semibold">
              Vault PR Progression
            </p>

            <select
              value={selectedRun}
              onChange={(e) =>
                setSelectedRun(
                  e.target.value as any
                )
              }
              className="border rounded-lg px-2 py-1"
            >
              <option value="threeL">3L</option>
              <option value="fourL">4L</option>
              <option value="fiveL">5L</option>
              <option value="sixL">6L</option>
              <option value="sevenL">7L</option>
            </select>
          </div>

          {chartData.length < 2 ? (
            <p className="text-gray-500">
              Log at least two PR
              entries to display a
              chart.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={chartData}
                >
                  <XAxis
                    dataKey="date"
                  />

                  <YAxis
                    domain={[
                      minPR ?? "auto",
                      maxPR ?? "auto",
                    ]}
                    tickFormatter={(
                      value
                    ) =>
                      formatVaultHeight(
                        Number(value)
                      )
                    }
                  />

                  <Tooltip
                    formatter={(
                      value
                    ) => [
                      formatVaultHeight(
                        Number(value)
                      ),
                      "PR",
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="pr"
                    strokeWidth={3}
                    dot={{
                      r: 5,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-4">
        <TrainingCalendar />
      </div>
    </main>
  );
}