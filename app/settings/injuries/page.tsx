"use client";

import Link from "next/link";
import InjuryManagementPanel from "@/components/settings/InjuryManagementPanel";
import { linkTextClassName } from "@/lib/ui/componentStyles";

export default function InjuryManagementPage() {
  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <Link href="/settings" className={linkTextClassName}>
        ← Settings
      </Link>

      <h1 className="mt-2 text-3xl font-bold text-foreground">
        Injury Management
      </h1>
      <p className="mt-1 mb-4 text-sm text-muted">
        Pause or modify your training program without losing any data.
      </p>

      <InjuryManagementPanel />
    </main>
  );
}
