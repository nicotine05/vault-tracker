"use client";

type VideoTimelineProps = {
  currentFrame: number;
  totalFrames: number;
  onScrubStart: () => void;
  onScrub: (frame: number) => void;
  onScrubEnd: () => void;
  label?: string;
  syncLabel?: string;
};

export default function VideoTimeline({
  currentFrame,
  totalFrames,
  onScrubStart,
  onScrub,
  onScrubEnd,
  label = "Timeline",
  syncLabel,
}: VideoTimelineProps) {
  const maxFrame = Math.max(totalFrames, 1);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </p>
        <p className="text-xs tabular-nums text-muted">
          {syncLabel ?? `Frame ${currentFrame} / ${totalFrames}`}
        </p>
      </div>

      <input
        type="range"
        min={0}
        max={maxFrame}
        step={1}
        value={Math.min(currentFrame, maxFrame)}
        onPointerDown={onScrubStart}
        onPointerUp={onScrubEnd}
        onPointerCancel={onScrubEnd}
        onChange={(event) => onScrub(Number(event.target.value))}
        onInput={(event) => onScrub(Number(event.currentTarget.value))}
        className="h-3 w-full cursor-pointer appearance-none rounded-full bg-surface-muted accent-accent"
        aria-label={label}
      />
    </div>
  );
}
