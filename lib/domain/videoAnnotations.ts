import type {
  NormalizedPoint,
  VideoAnnotation,
} from "@/lib/domain/videoAnalysis";

export type ContentRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Letterboxed / pillarboxed rect for object-fit: contain. */
export function getObjectContainRect(
  containerWidth: number,
  containerHeight: number,
  mediaWidth: number,
  mediaHeight: number,
): ContentRect {
  if (
    containerWidth <= 0 ||
    containerHeight <= 0 ||
    mediaWidth <= 0 ||
    mediaHeight <= 0
  ) {
    return {
      x: 0,
      y: 0,
      width: Math.max(1, containerWidth),
      height: Math.max(1, containerHeight),
    };
  }

  const containerRatio = containerWidth / containerHeight;
  const mediaRatio = mediaWidth / mediaHeight;

  if (mediaRatio > containerRatio) {
    const width = containerWidth;
    const height = containerWidth / mediaRatio;
    return {
      x: 0,
      y: (containerHeight - height) / 2,
      width,
      height,
    };
  }

  const height = containerHeight;
  const width = containerHeight * mediaRatio;
  return {
    x: (containerWidth - width) / 2,
    y: 0,
    width,
    height,
  };
}

/** Prefer the video element's painted box when available. */
export function getVideoContentRect(
  container: HTMLElement,
  video: HTMLVideoElement | null,
): ContentRect {
  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;

  if (video && video.videoWidth > 0 && video.videoHeight > 0) {
    const videoRect = video.getBoundingClientRect();
    return {
      x: videoRect.left - containerRect.left,
      y: videoRect.top - containerRect.top,
      width: Math.max(1, videoRect.width),
      height: Math.max(1, videoRect.height),
    };
  }

  return getObjectContainRect(
    containerWidth,
    containerHeight,
    video?.videoWidth ?? 0,
    video?.videoHeight ?? 0,
  );
}

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

/** Normalize pointer into the displayed video content (0–1), not the letterbox. */
export function normalizePointerInContent(
  clientX: number,
  clientY: number,
  containerRect: DOMRect,
  content: ContentRect,
): NormalizedPoint {
  const x = (clientX - containerRect.left - content.x) / content.width;
  const y = (clientY - containerRect.top - content.y) / content.height;
  return {
    x: Math.max(0, Math.min(1, x)),
    y: Math.max(0, Math.min(1, y)),
  };
}

export function isPointInContent(
  clientX: number,
  clientY: number,
  containerRect: DOMRect,
  content: ContentRect,
): boolean {
  const localX = clientX - containerRect.left;
  const localY = clientY - containerRect.top;
  return (
    localX >= content.x &&
    localX <= content.x + content.width &&
    localY >= content.y &&
    localY <= content.y + content.height
  );
}

export function createDraftAnnotation(
  type: VideoAnnotation["type"],
  start: NormalizedPoint,
  frame: number,
  color: string,
  persistent = false,
): VideoAnnotation {
  const base = {
    id: "draft" as const,
    frame,
    color,
    ...(persistent ? { persistent: true as const } : {}),
  };

  if (type === "draw") {
    return {
      ...base,
      type: "draw",
      points: [start],
    };
  }

  if (type === "circle") {
    return {
      ...base,
      type: "circle",
      center: start,
      radius: 0,
    };
  }

  return {
    ...base,
    type,
    start,
    end: start,
  };
}

export function annotationVisibleOnFrame(
  annotation: VideoAnnotation,
  frame: number,
): boolean {
  return Boolean(annotation.persistent) || annotation.frame === frame;
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
