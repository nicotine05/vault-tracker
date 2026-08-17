"use client";

import Link from "next/link";
import { primaryButtonClassName, secondaryButtonClassName } from "@/lib/ui/componentStyles";

export default function VideoAnalysisLanding() {
  return (
    <main className="mx-auto max-w-md p-4 pb-20">
      <div className="mb-8">
        <Link
          href="/vault"
          className="text-sm text-accent-text transition hover:opacity-80"
        >
          ← Vault
        </Link>

        <h1 className="mt-2 text-3xl font-bold text-foreground">
          Video Analysis
        </h1>

        <p className="mt-3 text-base leading-relaxed text-muted">
          Analyze your own vault or compare two vaults side-by-side.
        </p>
      </div>

      <div className="space-y-4">
        <Link href="/vault/video-analysis/single" className="block">
          <span className={`${primaryButtonClassName} flex min-h-16 items-center justify-center text-lg`}>
            Single Video
          </span>
        </Link>

        <Link href="/vault/video-analysis/compare" className="block">
          <span className={`${secondaryButtonClassName} flex min-h-16 items-center justify-center text-lg`}>
            Compare Videos
          </span>
        </Link>
      </div>
    </main>
  );
}
