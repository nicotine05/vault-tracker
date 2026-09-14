"use client";

import Link from "next/link";
import {
  getProgramStatusLabel,
  type InjuryProfile,
} from "@/lib/domain/injuryManagement";

type InjuryModeBadgeProps = {
  profile: InjuryProfile;
};

export default function InjuryModeBadge({ profile }: InjuryModeBadgeProps) {
  if (profile.status === "active") {
    return null;
  }

  return (
    <Link
      href="/settings/injuries"
      className="block rounded-2xl border border-amber-300/60 bg-amber-500/10 px-4 py-3 transition hover:bg-amber-500/15 [data-theme=dark]:border-amber-500/30"
    >
      <div className="flex items-start gap-3">
        <span className="text-lg">🩹</span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Program {getProgramStatusLabel(profile.status)}
          </p>
          <p className="text-sm text-muted">
            {profile.status === "paused"
              ? "Progression is paused"
              : "Workout generation is filtered"}
          </p>
        </div>
      </div>
    </Link>
  );
}
