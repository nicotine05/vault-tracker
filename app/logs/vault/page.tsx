/*
vNext Layout Update - LEFT COLUMN SESSIONS VERSION
- Previous Vault Sessions moved into LEFT COLUMN
- Sessions render BELOW Step Reference chart
- Current Vault Session remains in RIGHT COLUMN
- Week grouping/filter preserved
*/
"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";

type Jump = {
  id: string;
  run: string;
  grip: string;
  takeoff: string;
  grade: "green" | "yellow" | "red";
  comment: string;
};

type VaultSession = {
  id: string;
  date: string;
  keys: string[];
  jumps: Jump[];
};

type RunPRs = {
  threeL: string;
  threeLDate: string;
  fourL: string;
  fourLDate: string;
  fiveL: string;
  fiveLDate: string;
  sixL: string;
  sixLDate: string;
  sevenL: string;
  sevenLDate: string;
};

type HeightPREntry = {
  date: string;
  threeL: string;
  fourL: string;
  fiveL: string;
  sixL: string;
  sevenL: string;
};

export default function VaultPage() {
  const [loaded, setLoaded] =
    useState(false);

  const [sessions, setSessions] =
    useState<VaultSession[]>([]);

  const [expandedSessionId, setExpandedSessionId] =
    useState<string | null>(null);

  const [weekFilter, setWeekFilter] =
    useState("all");

  const [keys, setKeys] =
    useState<string[]>([""]);

  const [editingRefs, setEditingRefs] =
    useState(false);

  const [stepRefs, setStepRefs] =
    useState({
      threeL: "",
      fourL: "",
      fiveL: "",
      sixL: "",
      sevenL: "",
    });

  const [showPRMenu, setShowPRMenu] =
    useState(false);

  const [runPRs, setRunPRs] =
    useState<RunPRs>({
      threeL: "",
      threeLDate: "",
      fourL: "",
      fourLDate: "",
      fiveL: "",
      fiveLDate: "",
      sixL: "",
      sixLDate: "",
      sevenL: "",
      sevenLDate: "",
    });

  const [prHistory, setPrHistory] =
    useState<HeightPREntry[]>([]);

  const [jumps, setJumps] =
    useState<Jump[]>([]);

  const [run, setRun] =
    useState("");

  const [grip, setGrip] =
    useState("");

  const [takeoff, setTakeoff] =
    useState("");

  const [grade, setGrade] =
    useState<
      "green" | "yellow" | "red"
    >("green");

  const [comment, setComment] =
    useState("");

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          "vaultLogs"
        );

      if (saved) {
        setSessions(
          JSON.parse(saved)
        );
      }

      const savedRefs =
        localStorage.getItem(
          "vaultStepReferences"
        );

      if (savedRefs) {
        setStepRefs(
          JSON.parse(savedRefs)
        );
      }

      const savedPRs =
        localStorage.getItem(
          "vaultRunPRs"
        );

      if (savedPRs) {
        setRunPRs(
          JSON.parse(savedPRs)
        );
      }

      const savedHistory =
        localStorage.getItem(
          "vaultPRHistory"
        );

      if (savedHistory) {
        setPrHistory(
          JSON.parse(savedHistory)
        );
      }
    } catch (error) {
      console.error(
        "Failed to load vault logs",
        error
      );
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "vaultLogs",
      JSON.stringify(sessions)
    );
  }, [sessions, loaded]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "vaultStepReferences",
      JSON.stringify(stepRefs)
    );
  }, [stepRefs, loaded]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "vaultRunPRs",
      JSON.stringify(runPRs)
    );
  }, [runPRs, loaded]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "vaultPRHistory",
      JSON.stringify(prHistory)
    );
  }, [prHistory, loaded]);

  function getRunReference(
    run: string
  ) {
    switch (
      run.trim().toLowerCase()
    ) {
      case "3l":
        return stepRefs.threeL;
      case "4l":
        return stepRefs.fourL;
      case "5l":
        return stepRefs.fiveL;
      case "6l":
        return stepRefs.sixL;
      case "7l":
        return stepRefs.sevenL;
      default:
        return "";
    }
  }

  function addJump() {
    const newJump: Jump = {
      id: crypto.randomUUID(),

      run,
      grip,
      takeoff,

      grade,

      comment,
    };

    setJumps((prev) => [
      ...prev,
      newJump,
    ]);

    setRun("");
    setGrip("");
    setTakeoff("");
    setGrade("green");
    setComment("");
  }

  function removeJump(
    jumpId: string
  ) {
    setJumps((prev) =>
      prev.filter(
        (jump) =>
          jump.id !== jumpId
      )
    );
  }

  function saveSession() {
    if (jumps.length === 0)
      return;

    const newSession: VaultSession =
      {
        id: crypto.randomUUID(),

        date:
          new Date().toLocaleDateString(),

        keys: keys.filter(
          (key) => key.trim() !== ""
        ),

        jumps,
      };

    setSessions((prev) => [
      newSession,
      ...prev,
    ]);

    setKeys([""]);

    setJumps([]);

    setRun("");
    setGrip("");
    setTakeoff("");
    setGrade("green");
    setComment("");
  }

  function deleteSession(
    sessionId: string
  ) {
    if (
      !confirm(
        "Delete this vault session?"
      )
    ) {
      return;
    }

    setSessions((prev) =>
      prev.filter(
        (session) =>
          session.id !==
          sessionId
      )
    );
  }

  function getEmoji(
    value: string
  ) {
    if (value === "green")
      return "🟢";

    if (value === "yellow")
      return "🟡";

    return "🔴";
  }

  function getWeekLabel(
    dateString: string
  ) {
    const d = new Date(dateString);

    const day =
      d.getDay();

    const diff =
      day === 0
        ? -6
        : 1 - day;

    const monday =
      new Date(d);

    monday.setDate(
      d.getDate() + diff
    );

    const sunday =
      new Date(monday);

    sunday.setDate(
      monday.getDate() + 6
    );

    return `${monday.toLocaleDateString()} - ${sunday.toLocaleDateString()}`;
  }

  const weekOptions = [
    ...new Set(
      sessions.map((s) =>
        getWeekLabel(s.date)
      )
    ),
  ];

  const filteredSessions =
    weekFilter === "all"
      ? sessions
      : sessions.filter(
          (session) =>
            getWeekLabel(
              session.date
            ) === weekFilter
        );


  function updatePR(
    key: keyof RunPRs,
    value: string
  ) {
    const today =
      new Date().toLocaleDateString();

    setRunPRs((prev) => ({
      ...prev,
      [key]: value,
      [`${String(key)}Date`]:
        today,
    }));
  }

  return (
    <main className="max-w-5xl mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold mb-4">
        Vault Log
      </h1>

      <div className="grid md:grid-cols-[320px_1fr] gap-4 items-start">

      <div className="space-y-4">
      <Card className="bg-violet-50 border-violet-300 shadow-md">
        <div className="space-y-3 bg-blue-50 border-blue-200 border rounded-xl p-3 h-fit">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg">
              Step Reference
            </h2>

            <button
              onClick={() =>
                setEditingRefs(
                  !editingRefs
                )
              }
              className="text-sm border px-3 py-1 rounded-lg"
            >
              {editingRefs
                ? "Done"
                : "Edit"}
            </button>

            <button
              onClick={() =>
                setShowPRMenu(
                  !showPRMenu
                )
              }
              className="text-sm bg-green-500 text-white px-3 py-1 rounded-lg"
            >
              PRs
            </button>
          </div>

          {[
            ["3L", "threeL"],
            ["4L", "fourL"],
            ["5L", "fiveL"],
            ["6L", "sixL"],
            ["7L", "sevenL"],
          ].map(([label, key]) => (
            <div
              key={label}
              className="flex justify-between items-center"
            >
              <span className="font-medium">
                {label}
              </span>

              {editingRefs ? (
                <input
                  value={
                    stepRefs[
                      key as keyof typeof stepRefs
                    ]
                  }
                  onChange={(e) =>
                    setStepRefs({
                      ...stepRefs,
                      [key]:
                        e.target.value,
                    })
                  }
                  className="border rounded-lg px-2 py-1 w-24 text-right"
                />
              ) : (
                <span>
                  {stepRefs[
                    key as keyof typeof stepRefs
                  ] || "--"}
                </span>
              )}
            </div>
          ))}

          {showPRMenu && (
            <div className="border-t pt-3 mt-3 space-y-2">
              <p className="font-semibold">
                PR by Step
              </p>

              {([
                ["3L","threeL"],
                ["4L","fourL"],
                ["5L","fiveL"],
                ["6L","sixL"],
                ["7L","sevenL"],
              ] as const).map(
                ([label,key]) => (
                  <div
                    key={label}
                    className="flex justify-between items-center"
                  >
                    <span>{label}</span>

                    <input
                      value={runPRs[key]}
                      onChange={(e) =>
                        updatePR(
                          key as keyof RunPRs,
                          e.target.value
                        )
                      }
                      placeholder="PR"
                      className="border rounded px-2 py-1 w-24 text-right"
                    />

                    <span className="text-xs text-gray-500">
                      {runPRs[`${key}Date` as keyof RunPRs] as string}
                    </span>
                  </div>
                )
              )}
              <button
                onClick={() =>
                  setPrHistory([
                    {
                      date:
                        new Date().toLocaleDateString(),
                      ...runPRs,
                    },
                    ...prHistory,
                  ])
                }
                className="w-full mt-2 bg-green-500 text-white rounded-lg p-2"
              >
                Save Height PRs
              </button>

              {prHistory.length > 0 && (
                <div className="text-xs border-t pt-2">
                  Latest Saved:
                  {" "}
                  {prHistory[0].date}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {sessions.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">
              Vault Sessions
            </h2>

            <select
              value={weekFilter}
              onChange={(e) =>
                setWeekFilter(
                  e.target.value
                )
              }
              className="border rounded-lg px-2 py-1"
            >
              <option value="all">
                All
              </option>

              {weekOptions.map(
                (week) => (
                  <option
                    key={week}
                    value={week}
                  >
                    {week}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="space-y-3">
            {filteredSessions.map(
              (session) => {
                const greenCount =
                  session.jumps.filter(
                    (j) =>
                      j.grade ===
                      "green"
                  ).length;

                const yellowCount =
                  session.jumps.filter(
                    (j) =>
                      j.grade ===
                      "yellow"
                  ).length;

                const redCount =
                  session.jumps.filter(
                    (j) =>
                      j.grade ===
                      "red"
                  ).length;

                const expanded =
                  expandedSessionId ===
                  session.id;

                return (
                  <Card
                    key={
                      session.id
                    }
                  >
                    <div
                      onClick={() =>
                        setExpandedSessionId(
                          expanded
                            ? null
                            : session.id
                        )
                      }
                      className="cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">
                            {
                              session.date
                            }
                          </p>

                          <p className="text-sm text-gray-500">
                            {
                              session
                                .jumps
                                .length
                            }{" "}
                            jumps
                          </p>
                        </div>

                        <div className="text-right">
                          <p>
                            🟢{" "}
                            {
                              greenCount
                            }
                          </p>

                          <p>
                            🟡{" "}
                            {
                              yellowCount
                            }
                          </p>

                          <p>
                            🔴{" "}
                            {
                              redCount
                            }
                          </p>
                        </div>
                      </div>

                      {session.keys.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        🎯 {session.keys.join(" • ")}
                      </div>
                    )}
                    </div>

                    {expanded && (
                      <div className="mt-4 border-t pt-4">
                        <div className="space-y-2">
                          {session.jumps.map(
                            (
                              jump
                            ) => (
                              <div
                                key={
                                  jump.id
                                }
                                className="border rounded-lg p-3"
                              >
                                <div className="flex gap-2">
                                  <span>
                                    {getEmoji(
                                      jump.grade
                                    )}
                                  </span>

                                  <span>
                                    {
                                      jump.run
                                    }
                                  </span>

                                  {getRunReference(
                                    jump.run
                                  ) && (
                                    <span className="text-xs text-blue-600">
                                      (
                                      {getRunReference(
                                        jump.run
                                      )}
                                      )
                                    </span>
                                  )}

                                  <span>
                                    {
                                      jump.grip
                                    }
                                  </span>

                                  <span>
                                    {
                                      jump.takeoff
                                    }
                                  </span>
                                </div>

                                {jump.comment && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {
                                      jump.comment
                                    }
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>

                        <button
                          onClick={() =>
                            deleteSession(
                              session.id
                            )
                          }
                          className="w-full mt-4 border border-red-300 text-red-500 rounded-xl p-2"
                        >
                          Delete Session
                        </button>
                      </div>
                    )}
                  </Card>
                );
              }
            )}
          </div>
        </div>
      )}

      </div>

      <div>
      <Card className="bg-purple-50 border-purple-200">
        <div className="space-y-4">
          <div className="bg-purple-100 border border-purple-200 rounded-xl p-3">
            <h2 className="font-bold text-lg text-purple-900">
              New Vault Session
            </h2>
          </div>

          
<div className="space-y-3">
  <p className="font-medium">
    Daily Keys
  </p>

  {keys.map((key, index) => (
    <input
      key={index}
      value={key}
      onChange={(e) => {
        const updated = [...keys];
        updated[index] = e.target.value;
        setKeys(updated);
      }}
      placeholder={`Daily Key #${index + 1}`}
      className="w-full border rounded-xl p-3"
    />
  ))}

  {keys.length < 3 && (
    <button
      type="button"
      onClick={() => setKeys([...keys, ""])}
      className="w-full border rounded-xl p-2 text-sm"
    >
      + Add Key
    </button>
  )}
</div>


          <div className="border-t pt-4">
            <p className="font-semibold mb-3">
              Add Jump
            </p>

            <div className="space-y-3">
              <input
                value={run}
                onChange={(e) =>
                  setRun(
                    e.target.value
                  )
                }
                placeholder="Run (7L)"
                className="w-full border rounded-xl p-3"
              />

              <input
                value={grip}
                onChange={(e) =>
                  setGrip(
                    e.target.value
                  )
                }
                placeholder="Grip (13'6)"
                className="w-full border rounded-xl p-3"
              />

              <input
                value={takeoff}
                onChange={(e) =>
                  setTakeoff(
                    e.target.value
                  )
                }
                placeholder="Takeoff (-1)"
                className="w-full border rounded-xl p-3"
              />

              <select
                value={grade}
                onChange={(e) =>
                  setGrade(
                    e.target
                      .value as
                      | "green"
                      | "yellow"
                      | "red"
                  )
                }
                className="w-full border rounded-xl p-3"
              >
                <option value="green">
                  🟢
                </option>

                <option value="yellow">
                  🟡
                </option>

                <option value="red">
                  🔴
                </option>
              </select>

              <input
                value={comment}
                onChange={(e) =>
                  setComment(
                    e.target.value
                  )
                }
                placeholder="Quick comment"
                className="w-full border rounded-xl p-3"
              />

              <button
                onClick={addJump}
                className="w-full bg-gray-200 rounded-xl p-3 font-semibold"
              >
                + Add Jump
              </button>
            </div>
          </div>

          {jumps.length > 0 && (
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-gray-100 p-3 font-semibold">
                Current Session (
                {jumps.length} jumps)
              </div>

              <div className="divide-y">
                {jumps.map(
                  (jump) => (
                    <div
                      key={jump.id}
                      className="p-3"
                    >
                      <div className="flex justify-between">
                        <span>
                          {getEmoji(
                            jump.grade
                          )}
                        </span>

                        <button
                          onClick={() =>
                            removeJump(
                              jump.id
                            )
                          }
                          className="text-red-500 text-sm"
                        >
                          Delete
                        </button>
                      </div>

                      <p>
                        Run:{" "}
                        {jump.run}
                      </p>

                      {getRunReference(
                        jump.run
                      ) && (
                        <p className="text-sm text-gray-500">
                          Ref:{" "}
                          {getRunReference(
                            jump.run
                          )}
                        </p>
                      )}

                      <p>
                        Grip:{" "}
                        {jump.grip}
                      </p>

                      <p>
                        Takeoff:{" "}
                        {
                          jump.takeoff
                        }
                      </p>

                      {jump.comment && (
                        <p className="text-gray-600">
                          {
                            jump.comment
                          }
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          <button
            onClick={saveSession}
            disabled={
              jumps.length === 0
            }
            className="w-full bg-blue-500 text-white rounded-xl p-3 font-semibold disabled:bg-gray-300"
          >
            Save Vault Session
          </button>
        </div>
      </Card>
      </div>

      </div>

          </main>
  );
}