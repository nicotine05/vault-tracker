"use client";

import { useState } from "react";
import Card from "@/components/Card";
import { useAuth } from "@/components/AuthProvider";

export default function AccountSettings() {
  const {
    user,
    athletes,
    viewingAthleteId,
    isCoachReadOnly,
    logout,
    selectAthlete,
    createAthlete,
    syncNow,
  } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  if (!user) {
    return (
      <Card title="Account & Sync">
        <p className="text-sm text-gray-500 mb-4">
          Sign in to sync training data across devices and manage your
          athletes.
        </p>
        <a
          href="/login"
          className="block w-full rounded-xl bg-purple-600 p-3 text-center font-semibold text-white"
        >
          Go to Login
        </a>
      </Card>
    );
  }

  async function handleCreateAthlete() {
    setMessage(null);
    const error = await createAthlete({ name, email, password });
    if (error) {
      setMessage(error);
      return;
    }

    setName("");
    setEmail("");
    setPassword("");
    setMessage("Athlete account created.");
  }

  async function handleSyncNow() {
    setSyncing(true);
    setMessage(null);

    try {
      await syncNow();
      setMessage(isCoachReadOnly ? "Athlete data refreshed." : "Sync complete.");
    } catch {
      setMessage("Sync failed. Try again.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <Card title="Account & Sync">
      <p className="text-sm text-gray-500">
        Signed in as <span className="font-medium">{user.name}</span> (
        {user.role})
      </p>

      {user.role === "coach" && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700">
            Viewing athlete
          </label>
          <select
            value={viewingAthleteId ?? ""}
            onChange={(event) =>
              void selectAthlete(event.target.value || null)
            }
            className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-sm"
          >
            {athletes.length === 0 ? (
              <option value="">No athletes yet</option>
            ) : (
              athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name}
                </option>
              ))
            )}
          </select>

          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-slate-700">Add athlete</p>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Athlete name"
              className="w-full rounded-xl border border-slate-300 p-2 text-sm"
            />
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Athlete email"
              type="email"
              className="w-full rounded-xl border border-slate-300 p-2 text-sm"
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Temporary password"
              type="password"
              className="w-full rounded-xl border border-slate-300 p-2 text-sm"
            />
            <button
              type="button"
              onClick={() => void handleCreateAthlete()}
              className="w-full rounded-xl border border-purple-300 bg-purple-50 p-2 text-sm font-medium text-purple-800"
            >
              Create athlete account
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => void handleSyncNow()}
        disabled={syncing}
        className="mt-4 w-full rounded-xl bg-blue-600 p-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {syncing
          ? isCoachReadOnly
            ? "Refreshing..."
            : "Syncing..."
          : isCoachReadOnly
            ? "Refresh athlete data"
            : "Sync now"}
      </button>

      <button
        type="button"
        onClick={() => void logout()}
        className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm font-medium text-slate-700"
      >
        Log out
      </button>

      {message && (
        <p className="mt-3 text-center text-xs text-slate-600">{message}</p>
      )}
    </Card>
  );
}
