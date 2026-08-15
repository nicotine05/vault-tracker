"use client";

import { useAuth } from "@/components/AuthProvider";
import { coachBannerClassName } from "@/lib/ui/componentStyles";

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
    <div className={coachBannerClassName}>
      Coach view — read-only · Viewing athlete:{" "}
      <span className="font-semibold">{athleteLabel}</span>
    </div>
  );
}
