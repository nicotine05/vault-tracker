"use client";

import Link from "next/link";
import { useVideoFocusMode } from "@/components/vault/video/VideoFocusModeContext";
import { linkTextClassName, softButtonClassName } from "@/lib/ui/componentStyles";

type VideoAnalysisHeaderProps = {
  title: string;
  backHref?: string;
  showFocusToggle?: boolean;
};

export default function VideoAnalysisHeader({
  title,
  backHref = "/vault/video-analysis",
  showFocusToggle = true,
}: VideoAnalysisHeaderProps) {
  const { focusMode, toggleFocusMode } = useVideoFocusMode();

  if (focusMode) {
    return (
      <button
        type="button"
        onClick={() => toggleFocusMode()}
        className="fixed right-4 top-4 z-[120] rounded-full border border-white/20 bg-black/50 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm"
      >
        Exit Focus
      </button>
    );
  }

  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <Link href={backHref} className={linkTextClassName}>
          ← Back
        </Link>
        <h1 className="mt-1 truncate text-2xl font-bold text-foreground">
          {title}
        </h1>
      </div>

      {showFocusToggle && (
        <button
          type="button"
          onClick={toggleFocusMode}
          className={`${softButtonClassName} shrink-0 px-4 py-2`}
        >
          Focus
        </button>
      )}
    </div>
  );
}
