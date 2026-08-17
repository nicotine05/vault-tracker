"use client";

import { useRef } from "react";
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
  const maxDuration = Math.max(duration, 0.001);
  const progress = Math.max(0, Math.min(1, currentTime / maxDuration));

  const seekFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track || disabled) {
      return;
    }

    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onScrub(ratio * maxDuration);
  };

  return (
    <div
      className={`px-4 pb-2 pt-3 ${overlayFadeClass(visible)}`}
      onPointerDown={() => onInteraction()}
    >
      {frameLabel && (
        <p className="mb-2 text-center text-[11px] font-medium tabular-nums text-white/70">
          {frameLabel}
        </p>
      )}

      {thumbnails.length > 0 && (
        <div className="mb-2 flex gap-0.5 overflow-hidden rounded-lg opacity-80">
          {thumbnails.map((thumbnail, index) => (
            <img
              key={`${thumbnail.slice(0, 24)}-${index}`}
              src={thumbnail}
              alt=""
              className="h-8 flex-1 object-cover"
              draggable={false}
            />
          ))}
        </div>
      )}

      <div
        ref={trackRef}
        className={`relative h-8 ${disabled ? "opacity-40" : "cursor-pointer"}`}
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
        onPointerUp={(event) => {
          if (!isScrubbingRef.current) {
            return;
          }

          isScrubbingRef.current = false;
          onScrubEnd();
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={(event) => {
          isScrubbingRef.current = false;
          onScrubEnd();
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
      >
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-white"
          style={{ width: `${progress * 100}%` }}
        />
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow-md"
          style={{ left: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
