"use client";

import { navButtonClassName } from "@/lib/ui/componentStyles";

type VideoPlaybackControlsProps = {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onJumpBack: () => void;
  onJumpForward: () => void;
  disabled?: boolean;
};

export default function VideoPlaybackControls({
  isPlaying,
  onTogglePlay,
  onStepBack,
  onStepForward,
  onJumpBack,
  onJumpForward,
  disabled = false,
}: VideoPlaybackControlsProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={onJumpBack}
        className={`${navButtonClassName} min-h-11 text-xs font-semibold`}
        aria-label="Jump back 5 frames"
      >
        -5
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={onStepBack}
        className={`${navButtonClassName} min-h-11 text-xs font-semibold`}
        aria-label="Previous frame"
      >
        Prev
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={onTogglePlay}
        className="min-h-11 rounded-xl bg-accent px-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={onStepForward}
        className={`${navButtonClassName} min-h-11 text-xs font-semibold`}
        aria-label="Next frame"
      >
        Next
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={onJumpForward}
        className={`${navButtonClassName} min-h-11 text-xs font-semibold`}
        aria-label="Jump forward 5 frames"
      >
        +5
      </button>
    </div>
  );
}
