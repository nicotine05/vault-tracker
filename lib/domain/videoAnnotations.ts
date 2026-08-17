import type {
  NormalizedPoint,
  VideoAnnotation,
} from "@/lib/domain/videoAnalysis";
import { ANNOTATION_COLOR } from "@/lib/domain/videoAnalysis";

function toCanvasPoint(
  point: NormalizedPoint,
  width: number,
  height: number,
): { x: number; y: number } {
  return {
    x: point.x * width,
    y: point.y * height,
  };
}

function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const headLength = Math.min(18, Math.hypot(toX - fromX, toY - fromY) * 0.25);

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6),
  );
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6),
  );
  ctx.stroke();
}

export function renderAnnotations(
  ctx: CanvasRenderingContext2D,
  annotations: VideoAnnotation[],
  width: number,
  height: number,
) {
  ctx.clearRect(0, 0, width, height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const annotation of annotations) {
    ctx.strokeStyle = annotation.color;
    ctx.fillStyle = annotation.color;
    ctx.lineWidth = 3;

    if (annotation.type === "arrow" || annotation.type === "line") {
      const start = toCanvasPoint(annotation.start, width, height);
      const end = toCanvasPoint(annotation.end, width, height);

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      if (annotation.type === "arrow") {
        drawArrowHead(ctx, start.x, start.y, end.x, end.y);
      }
    }

    if (annotation.type === "circle") {
      const center = toCanvasPoint(annotation.center, width, height);
      const radius = annotation.radius * Math.min(width, height);

      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (annotation.type === "draw" && annotation.points.length > 1) {
      ctx.beginPath();
      const first = toCanvasPoint(annotation.points[0], width, height);
      ctx.moveTo(first.x, first.y);

      for (let index = 1; index < annotation.points.length; index += 1) {
        const point = toCanvasPoint(annotation.points[index], width, height);
        ctx.lineTo(point.x, point.y);
      }

      ctx.stroke();
    }
  }
}

export function normalizePointer(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): NormalizedPoint {
  return {
    x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
    y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
  };
}

export function createDraftAnnotation(
  type: VideoAnnotation["type"],
  start: NormalizedPoint,
  frame: number,
  color: string,
): VideoAnnotation {
  if (type === "draw") {
    return {
      id: "draft",
      frame,
      type: "draw",
      points: [start],
      color,
    };
  }

  if (type === "circle") {
    return {
      id: "draft",
      frame,
      type: "circle",
      center: start,
      radius: 0,
      color,
    };
  }

  return {
    id: "draft",
    frame,
    type,
    start,
    end: start,
    color,
  };
}

export function updateDraftAnnotation(
  draft: VideoAnnotation,
  point: NormalizedPoint,
): VideoAnnotation {
  if (draft.type === "draw") {
    return {
      ...draft,
      points: [...draft.points, point],
    };
  }

  if (draft.type === "circle") {
    const radius = Math.hypot(point.x - draft.center.x, point.y - draft.center.y);
    return {
      ...draft,
      radius,
    };
  }

  return {
    ...draft,
    end: point,
  };
}
