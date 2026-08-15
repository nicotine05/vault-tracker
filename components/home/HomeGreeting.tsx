"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { getFirstName, getTimeGreeting } from "@/lib/domain/greeting";

export default function HomeGreeting() {
  const { user } = useAuth();
  const greeting = getTimeGreeting();
  const firstName = user ? getFirstName(user.name) : null;

  return (
    <div className="mb-4 rounded-2xl border border-border/70 bg-gradient-to-br from-surface-muted/80 to-surface px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        {greeting}
      </p>

      <p className="mt-1 text-xl font-semibold leading-tight tracking-tight text-foreground">
        {firstName ? (
          <span className="text-accent-text">{firstName}</span>
        ) : (
          <Link
            href="/login"
            className="text-accent-text transition hover:opacity-80"
          >
            Sign in
          </Link>
        )}
      </p>
    </div>
  );
}
