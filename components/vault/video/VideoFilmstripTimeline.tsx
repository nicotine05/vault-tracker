"use client";

import { useEffect, useRef, useState } from "react";

type VideoFilmstripTimelineProps = {
  currentTime: number;
  duration: number;
  disabled?: boolean;
  compact?: boolean;
  onScrubStart: () => void;
  onScrub: (time: number) => void;
  onScrubEnd: () => void;
  onInteraction: () => void;
  className?: string;
};

export default function VideoFilmstripTimeline({
  currentTime,
  duration,
  disabled = false,
  compact = false,
  onScrubStart,
  onScrub,
  onScrubEnd,
  onInteraction,
  className = "",
}: VideoFilmstripTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isScrubbingRef = useRef(false);
  const pendingTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const [dragTime, setDragTime] = useState<number | null>(null);

  const maxDuration = Math.max(duration, 0.001);
  const displayTime = dragTime ?? currentTime;
  const progress = Math.max(0, Math.min(1, displayTime / maxDuration));
  // Compact matches the 44px play/markup buttons in the bottom chrome row.
  const trackHeight = compact ? "h-11" : "h-12";
  const knobSize = compact ? "h-5 w-5" : "h-6 w-6";

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const queueScrub = (time: number) => {
    pendingTimeRef.current = time;

    if (rafRef.current !== null) {
      return;
    }

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (pendingTimeRef.current !== null) {
        onScrub(pendingTimeRef.current);
        pendingTimeRef.current = null;
      }
    });
  };

  const seekFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track || disabled) {
      return;
    }

    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const time = ratio * maxDuration;

    setDragTime(time);
    queueScrub(time);
  };

  const finishScrub = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbingRef.current) {
      return;
    }

    isScrubbingRef.current = false;
    setDragTime(null);

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (pendingTimeRef.current !== null) {
      onScrub(pendingTimeRef.current);
      pendingTimeRef.current = null;
    }

    onScrubEnd();
    onInteraction();
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div className={`min-w-0 flex-1 ${className}`}>
      <div
        ref={trackRef}
        className={`relative ${trackHeight} overflow-hidden rounded-2xl bg-black/45 backdrop-blur-xl ring-1 ring-white/15 ${
          disabled ? "opacity-40" : "touch-none select-none"
        }`}
        onPointerDown={(event) => {
          if (disabled) {
            return;
          }

          isScrubbingRef.current = true;
          onInteraction();
          onScrubStart();
          seekFromClientX(event.clientX);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!isScrubbingRef.current || disabled) {
            return;
          }

          onInteraction();
          seekFromClientX(event.clientX);
        }}
        onPointerUp={finishScrub}
        onPointerCancel={finishScrub}
      >
        <div
          className="pointer-events-none absolute inset-y-0 w-[2px] -translate-x-1/2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.75)]"
          style={{ left: `${progress * 100}%` }}
        />

        <div
          className={`pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.35)] ${knobSize}`}
          style={{ left: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
