export type AnnotationTool = "arrow" | "line" | "circle" | "draw";

export type NormalizedPoint = {
  x: number;
  y: number;
};

export type VideoAnnotation =
  | {
      id: string;
      type: "arrow";
      start: NormalizedPoint;
      end: NormalizedPoint;
      color: string;
    }
  | {
      id: string;
      type: "line";
      start: NormalizedPoint;
      end: NormalizedPoint;
      color: string;
    }
  | {
      id: string;
      type: "circle";
      center: NormalizedPoint;
      radius: number;
      color: string;
    }
  | {
      id: string;
      type: "draw";
      points: NormalizedPoint[];
      color: string;
    };

export const ANNOTATION_COLOR = "#34C759";
export const DEFAULT_FPS = 30;

export function frameToTime(frame: number, fps: number = DEFAULT_FPS): number {
  return frame / fps;
}

export function timeToFrame(time: number, fps: number = DEFAULT_FPS): number {
  return Math.round(time * fps);
}

export function getTotalFrames(
  duration: number,
  fps: number = DEFAULT_FPS,
): number {
  if (!Number.isFinite(duration) || duration <= 0) {
    return 0;
  }

  return Math.max(0, Math.floor(duration * fps));
}

export function clampFrame(frame: number, totalFrames: number): number {
  return Math.max(0, Math.min(totalFrames, frame));
}

export function seekToFrame(
  video: HTMLVideoElement,
  frame: number,
  fps: number = DEFAULT_FPS,
): void {
  const totalFrames = getTotalFrames(video.duration, fps);
  const clamped = clampFrame(frame, totalFrames);
  video.pause();
  video.currentTime = frameToTime(clamped, fps);
}

export function stepVideoFrames(
  video: HTMLVideoElement,
  deltaFrames: number,
  fps: number = DEFAULT_FPS,
): number {
  const totalFrames = getTotalFrames(video.duration, fps);
  const currentFrame = timeToFrame(video.currentTime, fps);
  const nextFrame = clampFrame(currentFrame + deltaFrames, totalFrames);
  seekToFrame(video, nextFrame, fps);
  return nextFrame;
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/") || /\.(mp4|mov|webm|m4v)$/i.test(file.name);
}

export function createVideoObjectUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeVideoObjectUrl(url: string | null): void {
  if (url) {
    URL.revokeObjectURL(url);
  }
}

export function createAnnotationId(): string {
  return `ann-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getSyncOffsetBounds(
  takeoffFrameA: number,
  takeoffFrameB: number,
  totalFramesA: number,
  totalFramesB: number,
): { min: number; max: number } {
  return {
    min: -Math.min(takeoffFrameA, takeoffFrameB),
    max: Math.min(
      totalFramesA - takeoffFrameA,
      totalFramesB - takeoffFrameB,
    ),
  };
}

export function clampSyncOffset(
  offset: number,
  takeoffFrameA: number,
  takeoffFrameB: number,
  totalFramesA: number,
  totalFramesB: number,
): number {
  const { min, max } = getSyncOffsetBounds(
    takeoffFrameA,
    takeoffFrameB,
    totalFramesA,
    totalFramesB,
  );
  return Math.max(min, Math.min(max, offset));
}
