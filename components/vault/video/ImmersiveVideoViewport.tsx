"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AnnotationTool, VideoAnnotation } from "@/lib/domain/videoAnalysis";
import { createAnnotationId } from "@/lib/domain/videoAnalysis";
import {
  createDraftAnnotation,
  getVideoContentRect,
  normalizePointerInContent,
  renderAnnotations,
  updateDraftAnnotation,
  type ContentRect,
} from "@/lib/domain/videoAnnotations";
import { useVideoZoom } from "@/lib/hooks/useVideoZoom";

export type PlayerInteractionMode = "watch" | "mark";

type ImmersiveVideoViewportProps = {
  videoUrl: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  annotations: VideoAnnotation[];
  currentFrame: number;
  activeTool: AnnotationTool | null;
  annotationColor: string;
  mode: PlayerInteractionMode;
  muted: boolean;
  controlsVisible?: boolean;
  onAnnotationsChange: (annotations: VideoAnnotation[]) => void;
  onTogglePlay: () => void;
  onStepFrames: (delta: number) => void;
  onInteraction: () => void;
  className?: string;
};

function getTouchDistance(touches: React.TouchList | TouchList) {
  if (touches.length < 2) {
    return 0;
  }

  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

function rectsNearlyEqual(a: ContentRect, b: ContentRect) {
  return (
    Math.abs(a.x - b.x) < 0.5 &&
    Math.abs(a.y - b.y) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  );
}

export default function ImmersiveVideoViewport({
  videoUrl,
  videoRef,
  annotations,
  currentFrame,
  activeTool,
  annotationColor,
  mode,
  muted,
  controlsVisible = true,
  onAnnotationsChange,
  onTogglePlay,
  onStepFrames,
  onInteraction,
  className = "",
}: ImmersiveVideoViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<ContentRect>({ x: 0, y: 0, width: 1, height: 1 });
  const [contentRect, setContentRect] = useState<ContentRect>({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  });
  const [draft, setDraft] = useState<VideoAnnotation | null>(null);
  const draftRef = useRef<VideoAnnotation | null>(null);
  const frameAnnotationsRef = useRef<VideoAnnotation[]>([]);
  const isDrawingRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );
  const zoom = useVideoZoom();
  const drawingEnabled = mode === "mark" && activeTool !== null;

  const setDraftAnnotation = useCallback((next: VideoAnnotation | null) => {
    draftRef.current = next;
    setDraft(next);
  }, []);

  const frameAnnotations = useMemo(
    () =>
      annotations.filter((annotation) => annotation.frame === currentFrame),
    [annotations, currentFrame],
  );
  frameAnnotationsRef.current = frameAnnotations;

  const measureContent = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const next = getVideoContentRect(container, videoRef.current);
    contentRef.current = next;
    setContentRect((previous) =>
      rectsNearlyEqual(previous, next) ? previous : next,
    );
  }, [videoRef]);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const content = contentRef.current;
    if (!canvas) {
      return;
    }

    const width = Math.max(1, Math.round(content.width * window.devicePixelRatio));
    const height = Math.max(
      1,
      Math.round(content.height * window.devicePixelRatio),
    );

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    const currentDraft = draftRef.current;
    const marks = frameAnnotationsRef.current;
    const allAnnotations = currentDraft ? [...marks, currentDraft] : marks;
    renderAnnotations(ctx, allAnnotations, content.width, content.height);
  }, []);

  useEffect(() => {
    measureContent();
  }, [measureContent, videoUrl]);

  useEffect(() => {
    paint();
  }, [paint, draft, frameAnnotations, contentRect, currentFrame]);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container) {
      return;
    }

    const onResize = () => {
      measureContent();
      paint();
    };

    const observer = new ResizeObserver(onResize);
    observer.observe(container);
    if (video) {
      video.addEventListener("loadedmetadata", onResize);
      video.addEventListener("loadeddata", onResize);
    }

    return () => {
      observer.disconnect();
      video?.removeEventListener("loadedmetadata", onResize);
      video?.removeEventListener("loadeddata", onResize);
    };
  }, [measureContent, paint, videoRef, videoUrl]);

  const finishDraft = useCallback(
    (annotation: VideoAnnotation | null) => {
      if (!annotation) {
        setDraftAnnotation(null);
        return;
      }

      onAnnotationsChange([
        ...annotations,
        {
          ...annotation,
          id: createAnnotationId(),
          frame: currentFrame,
        },
      ]);
      setDraftAnnotation(null);
    },
    [annotations, currentFrame, onAnnotationsChange, setDraftAnnotation],
  );

  const pointFromEvent = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) {
      return null;
    }

    return normalizePointerInContent(
      clientX,
      clientY,
      container.getBoundingClientRect(),
      contentRef.current,
    );
  };

  const handleWatchTap = (clientX: number, rect: DOMRect) => {
    // First tap only reveals chrome (iOS-like); next tap plays / steps.
    if (!controlsVisible) {
      onInteraction();
      return;
    }

    onInteraction();
    const zone = (clientX - rect.left) / rect.width;

    if (zone < 0.22) {
      onStepFrames(-1);
      return;
    }

    if (zone > 0.78) {
      onStepFrames(1);
      return;
    }

    onTogglePlay();
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") {
      return;
    }

    onInteraction();

    if (drawingEnabled && activeTool) {
      const point = pointFromEvent(event.clientX, event.clientY);
      if (!point) {
        return;
      }

      isDrawingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDraftAnnotation(
        createDraftAnnotation(
          activeTool,
          point,
          currentFrame,
          annotationColor,
        ),
      );
      return;
    }

    if (mode === "watch" && zoom.scale > 1 && event.buttons === 1) {
      zoom.handlePanStart(event.clientX, event.clientY);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") {
      return;
    }

    const currentDraft = draftRef.current;
    if (isDrawingRef.current && currentDraft && activeTool) {
      const point = pointFromEvent(event.clientX, event.clientY);
      if (!point) {
        return;
      }

      if (currentDraft.type === "draw") {
        const last = currentDraft.points[currentDraft.points.length - 1];
        if (Math.hypot(point.x - last.x, point.y - last.y) < 0.004) {
          return;
        }
      }

      setDraftAnnotation(updateDraftAnnotation(currentDraft, point));
      return;
    }

    if (mode === "watch") {
      zoom.handlePanMove(event.clientX, event.clientY);
    }
  };

  const commitDraft = (annotation: VideoAnnotation | null) => {
    if (!annotation) {
      setDraftAnnotation(null);
      return;
    }

    if (annotation.type === "circle" && annotation.radius < 0.01) {
      setDraftAnnotation(null);
      return;
    }

    if (
      (annotation.type === "arrow" || annotation.type === "line") &&
      Math.hypot(
        annotation.end.x - annotation.start.x,
        annotation.end.y - annotation.start.y,
      ) < 0.01
    ) {
      setDraftAnnotation(null);
      return;
    }

    if (annotation.type === "draw" && annotation.points.length < 2) {
      setDraftAnnotation(null);
      return;
    }

    finishDraft(annotation);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") {
      return;
    }

    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      event.currentTarget.releasePointerCapture(event.pointerId);
      commitDraft(draftRef.current);
      return;
    }

    if (mode === "watch" && zoom.scale > 1) {
      zoom.handlePanEnd();
      return;
    }

    if (mode !== "watch" || drawingEnabled) {
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    handleWatchTap(event.clientX, rect);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (mode === "watch" && event.touches.length === 2) {
      onInteraction();
      zoom.handlePinchStart(getTouchDistance(event.touches));
      touchStartRef.current = null;
      return;
    }

    if (event.touches.length === 1 && drawingEnabled && activeTool) {
      onInteraction();
      const touch = event.touches[0];
      const point = pointFromEvent(touch.clientX, touch.clientY);
      if (!point) {
        return;
      }

      isDrawingRef.current = true;
      touchStartRef.current = null;
      setDraftAnnotation(
        createDraftAnnotation(
          activeTool,
          point,
          currentFrame,
          annotationColor,
        ),
      );
      return;
    }

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    }
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const currentDraft = draftRef.current;
    if (
      isDrawingRef.current &&
      currentDraft &&
      activeTool &&
      event.touches.length === 1
    ) {
      const touch = event.touches[0];
      const point = pointFromEvent(touch.clientX, touch.clientY);
      if (!point) {
        return;
      }

      onInteraction();

      if (currentDraft.type === "draw") {
        const last = currentDraft.points[currentDraft.points.length - 1];
        if (Math.hypot(point.x - last.x, point.y - last.y) < 0.004) {
          return;
        }
      }

      setDraftAnnotation(updateDraftAnnotation(currentDraft, point));
      return;
    }

    if (mode === "watch" && event.touches.length === 2) {
      onInteraction();
      zoom.handlePinchMove(getTouchDistance(event.touches));
      touchStartRef.current = null;
      return;
    }

    if (!touchStartRef.current || event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];
    const moved = Math.hypot(
      touch.clientX - touchStartRef.current.x,
      touch.clientY - touchStartRef.current.y,
    );

    if (moved > 12) {
      touchStartRef.current = null;
    }
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    zoom.handlePanEnd();

    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      commitDraft(draftRef.current);
      touchStartRef.current = null;
      return;
    }

    if (mode !== "watch" || event.touches.length > 0) {
      touchStartRef.current = null;
      return;
    }

    const start = touchStartRef.current;
    touchStartRef.current = null;

    if (!start) {
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    handleWatchTap(start.x, rect);
  };

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden bg-black touch-none ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="relative flex h-full w-full items-center justify-center transition-transform duration-75 ease-out"
        style={mode === "watch" ? zoom.transformStyle : undefined}
      >
        <video
          key={videoUrl}
          ref={videoRef}
          src={videoUrl}
          className="max-h-full max-w-full object-contain"
          playsInline
          muted={muted}
          preload="auto"
        />

        <canvas
          ref={canvasRef}
          className={`pointer-events-none absolute ${
            drawingEnabled && activeTool ? "cursor-crosshair" : ""
          }`}
          style={{
            left: contentRect.x,
            top: contentRect.y,
            width: contentRect.width,
            height: contentRect.height,
          }}
        />
      </div>
    </div>
  );
}
