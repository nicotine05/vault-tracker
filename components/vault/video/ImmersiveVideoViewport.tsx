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
import { useVideoZoom } from "@/lib/hooks/useVideoZoom";

type ImmersiveVideoViewportProps = {
  videoUrl: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  annotations: VideoAnnotation[];
  currentFrame: number;
  activeTool: AnnotationTool | null;
  annotationColor: string;
  drawingEnabled: boolean;
  onAnnotationsChange: (annotations: VideoAnnotation[]) => void;
  onSingleTap: () => void;
  onDoubleTapLeft: () => void;
  onDoubleTapRight: () => void;
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

export default function ImmersiveVideoViewport({
  videoUrl,
  videoRef,
  annotations,
  currentFrame,
  activeTool,
  annotationColor,
  drawingEnabled,
  onAnnotationsChange,
  onSingleTap,
  onDoubleTapLeft,
  onDoubleTapRight,
  onInteraction,
  className = "",
}: ImmersiveVideoViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<VideoAnnotation | null>(null);
  const isDrawingRef = useRef(false);
  const lastTapRef = useRef<{ time: number; x: number } | null>(null);
  const activeTouches = useRef(0);
  const zoom = useVideoZoom();

  const frameAnnotations = annotations.filter(
    (annotation) => annotation.frame === currentFrame,
  );

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

    const allAnnotations = draft ? [...frameAnnotations, draft] : frameAnnotations;
    renderAnnotations(ctx, allAnnotations, width, height);
  }, [draft, frameAnnotations]);

  useEffect(() => {
    paint();
  }, [paint, currentFrame]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver(paint);
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
          frame: currentFrame,
        },
      ]);
      setDraft(null);
    },
    [annotations, currentFrame, onAnnotationsChange],
  );

  const handleTapGesture = (clientX: number, rect: DOMRect) => {
    const now = Date.now();
    const lastTap = lastTapRef.current;

    if (lastTap && now - lastTap.time < 280) {
      const zone = (clientX - rect.left) / rect.width;
      if (zone < 0.35) {
        onDoubleTapLeft();
      } else if (zone > 0.65) {
        onDoubleTapRight();
      }

      lastTapRef.current = null;
      onInteraction();
      return;
    }

    lastTapRef.current = { time: now, x: clientX };

    window.setTimeout(() => {
      if (lastTapRef.current?.time === now) {
        onSingleTap();
        lastTapRef.current = null;
      }
    }, 280);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onInteraction();

    if (drawingEnabled && activeTool) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      isDrawingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      const point = normalizePointer(event.clientX, event.clientY, rect);
      setDraft(createDraftAnnotation(activeTool, point, currentFrame, annotationColor));
      return;
    }

    if (event.pointerType === "touch") {
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    if (zoom.scale > 1 && event.buttons === 1) {
      zoom.handlePanStart(event.clientX, event.clientY);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isDrawingRef.current && draft && activeTool) {
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
      return;
    }

    zoom.handlePanMove(event.clientX, event.clientY);
  };

  const finishPointerDraw = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current) {
      zoom.handlePanEnd();
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

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    onInteraction();
    activeTouches.current = event.touches.length;

    if (event.touches.length === 2) {
      zoom.handlePinchStart(getTouchDistance(event.touches));
      return;
    }

    if (event.touches.length === 1 && !drawingEnabled) {
      const touch = event.touches[0];
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        handleTapGesture(touch.clientX, rect);
      }
    }
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      zoom.handlePinchMove(getTouchDistance(event.touches));
      return;
    }

    if (event.touches.length === 2 && zoom.scale > 1) {
      const centerX =
        (event.touches[0].clientX + event.touches[1].clientX) / 2;
      const centerY =
        (event.touches[0].clientY + event.touches[1].clientY) / 2;
      zoom.handlePanMove(centerX, centerY);
    }
  };

  const handleTouchEnd = () => {
    activeTouches.current = 0;
    zoom.handlePanEnd();
  };

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden bg-black touch-none ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointerDraw}
      onPointerCancel={finishPointerDraw}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="relative flex h-full w-full items-center justify-center transition-transform duration-75 ease-out"
        style={zoom.transformStyle}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          className="max-h-full max-w-full object-contain"
          playsInline
          preload="auto"
        />

        <canvas
          ref={canvasRef}
          className={`absolute inset-0 m-auto max-h-full max-w-full ${
            drawingEnabled && activeTool ? "cursor-crosshair" : ""
          }`}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
