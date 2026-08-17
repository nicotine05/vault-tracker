"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AnnotationTool, VideoAnnotation } from "@/lib/domain/videoAnalysis";
import { createAnnotationId } from "@/lib/domain/videoAnalysis";
import {
  createDraftAnnotation,
  normalizePointer,
  renderAnnotations,
  updateDraftAnnotation,
} from "@/lib/domain/videoAnnotations";

type VideoViewportProps = {
  videoUrl: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  annotations: VideoAnnotation[];
  activeTool: AnnotationTool | null;
  onAnnotationsChange: (annotations: VideoAnnotation[]) => void;
  label?: string;
  compact?: boolean;
};

export default function VideoViewport({
  videoUrl,
  videoRef,
  annotations,
  activeTool,
  onAnnotationsChange,
  label,
  compact = false,
}: VideoViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<VideoAnnotation | null>(null);
  const isDrawingRef = useRef(false);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const allAnnotations = draft ? [...annotations, draft] : annotations;
    renderAnnotations(ctx, allAnnotations, width, height);
  }, [annotations, draft]);

  useEffect(() => {
    paint();
  }, [paint]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver(() => {
      paint();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [paint]);

  const finishDraft = useCallback(
    (annotation: VideoAnnotation | null) => {
      if (!annotation) {
        setDraft(null);
        return;
      }

      onAnnotationsChange([
        ...annotations,
        {
          ...annotation,
          id: createAnnotationId(),
        },
      ]);
      setDraft(null);
    },
    [annotations, onAnnotationsChange],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activeTool) {
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    isDrawingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = normalizePointer(event.clientX, event.clientY, rect);
    setDraft(createDraftAnnotation(activeTool, point));
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !draft || !activeTool) {
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const point = normalizePointer(event.clientX, event.clientY, rect);

    if (draft.type === "draw") {
      const last = draft.points[draft.points.length - 1];
      if (Math.hypot(point.x - last.x, point.y - last.y) < 0.004) {
        return;
      }
    }

    setDraft((current) =>
      current ? updateDraftAnnotation(current, point) : current,
    );
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) {
      return;
    }

    isDrawingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (!draft) {
      return;
    }

    if (draft.type === "circle" && draft.radius < 0.01) {
      setDraft(null);
      return;
    }

    if (
      (draft.type === "arrow" || draft.type === "line") &&
      Math.hypot(draft.end.x - draft.start.x, draft.end.y - draft.start.y) < 0.01
    ) {
      setDraft(null);
      return;
    }

    if (draft.type === "draw" && draft.points.length < 2) {
      setDraft(null);
      return;
    }

    finishDraft(draft);
  };

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </p>
      )}

      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded-2xl border border-border bg-black ${
          compact ? "aspect-[3/4]" : "aspect-[9/16] sm:aspect-video"
        }`}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          className="h-full w-full object-contain"
          playsInline
          preload="metadata"
        />

        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full touch-none ${
            activeTool ? "cursor-crosshair" : "pointer-events-none"
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>
    </div>
  );
}
