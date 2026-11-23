"use client";

import { useEffect, useRef, useState } from "react";
import { overlayFadeClass } from "@/components/vault/video/videoStyles";

type VideoFilmstripTimelineProps = {
  currentTime: number;
  duration: number;
  thumbnails: string[];
  visible: boolean;
  disabled?: boolean;
  onScrubStart: () => void;
  onScrub: (time: number) => void;
  onScrubEnd: () => void;
  onInteraction: () => void;
  frameLabel?: string;
};

export default function VideoFilmstripTimeline({
  currentTime,
  duration,
  thumbnails,
  visible,
  disabled = false,
  onScrubStart,
  onScrub,
  onScrubEnd,
  onInteraction,
  frameLabel,
}: VideoFilmstripTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isScrubbingRef = useRef(false);
  const pendingTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const [dragTime, setDragTime] = useState<number | null>(null);

  const maxDuration = Math.max(duration, 0.001);
  const displayTime = dragTime ?? currentTime;
  const progress = Math.max(0, Math.min(1, displayTime / maxDuration));

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
    <div className={`px-3 pb-1.5 pt-1.5 ${overlayFadeClass(visible)}`}>
      {frameLabel && (
        <p className="mb-1.5 text-center text-[12px] font-medium tabular-nums text-white/75">
          {frameLabel}
        </p>
      )}

      {/* ~15% shorter than prior h-16 (64px → 54px) */}
      <div
        ref={trackRef}
        className={`relative h-[54px] overflow-hidden rounded-2xl bg-black/40 ring-1 ring-white/10 ${
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
        {thumbnails.length > 0 ? (
          <div className="absolute inset-0 flex">
            {thumbnails.map((thumbnail, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${index}-${thumbnail.slice(-24)}`}
                src={thumbnail}
                alt=""
                className="h-full flex-1 object-cover"
                draggable={false}
              />
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-white/8 to-white/15" />
        )}

        {/* iOS-style playhead only — no black wash that hides thumbnails */}
        <div
          className="pointer-events-none absolute inset-y-0 w-[3px] -translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.85)]"
          style={{ left: `${progress * 100}%` }}
        />

        <div
          className="pointer-events-none absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-white bg-white shadow-md"
          style={{ left: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
