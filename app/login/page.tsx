"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, registerCoach } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return (
      <main className="max-w-md mx-auto p-4 pb-20">
        <Card title="Already signed in">
          <p className="text-sm text-muted mb-4">
            You&apos;re signed in as {user.name} ({user.role}).
          </p>
          <Link
            href="/settings"
            className="block w-full rounded-xl bg-purple-600 p-3 text-center font-semibold text-white"
          >
            Go to Settings
          </Link>
        </Card>
      </main>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result =
      mode === "login"
        ? await login(email, password)
        : await registerCoach(name, email, password);

    if (result) {
      setError(result);
    } else {
      router.push("/settings");
    }

    setSubmitting(false);
  }

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold mb-2">Vault Tracker</h1>
      <p className="text-sm text-muted mb-6">
        Sign in to sync data across devices. Coaches can manage athlete
        accounts for a small local squad.
      </p>

      <Card title={mode === "login" ? "Sign in" : "Create coach account"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm"
              required
            />
          )}

          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            type="email"
            className="w-full rounded-xl border border-slate-300 p-3 text-sm"
            required
          />

          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            type="password"
            className="w-full rounded-xl border border-slate-300 p-3 text-sm"
            required
          />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-purple-600 p-3 font-semibold text-white disabled:opacity-60"
          >
            {submitting
              ? "Working..."
              : mode === "login"
              ? "Sign in"
              : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() =>
            setMode((current) => (current === "login" ? "register" : "login"))
          }
          className="mt-3 w-full text-sm text-blue-600"
        >
          {mode === "login"
            ? "Need a coach account? Register"
            : "Already have an account? Sign in"}
        </button>
      </Card>
    </main>
  );
}
