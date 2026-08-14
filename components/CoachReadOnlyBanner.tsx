"use client";

import { useAuth } from "@/components/AuthProvider";

export default function CoachReadOnlyBanner() {
  const { user, isCoachReadOnly, athletes, viewingAthleteId } = useAuth();

  if (!isCoachReadOnly || !user) {
    return null;
  }

  const viewingAthlete = athletes.find(
    (athlete) => athlete.id === viewingAthleteId
  );

  const athleteLabel = viewingAthlete
    ? viewingAthlete.name
    : athletes.length === 0
      ? "No athletes linked"
      : "No athlete selected";

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
      Coach view — read-only · Viewing athlete:{" "}
      <span className="font-semibold">{athleteLabel}</span>
    </div>
  );
}
