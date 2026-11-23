"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ImmersiveVideoViewport, {
  type PlayerInteractionMode,
} from "@/components/vault/video/ImmersiveVideoViewport";
import VideoFilmstripTimeline from "@/components/vault/video/VideoFilmstripTimeline";
import { useVideoImmersive } from "@/components/vault/video/VideoFocusModeContext";
import VideoMarkupBar from "@/components/vault/video/VideoMarkupBar";
import {
  glassButtonClassName,
  glassPillClassName,
  overlayFadeClass,
} from "@/components/vault/video/videoStyles";
import type { AnnotationTool, VideoAnnotation } from "@/lib/domain/videoAnalysis";
import { ANNOTATION_COLOR } from "@/lib/domain/videoAnalysis";
import { annotationVisibleOnFrame } from "@/lib/domain/videoAnnotations";
import { useFilmstripThumbnails } from "@/lib/hooks/useFilmstripThumbnails";
import { useOverlayVisibility } from "@/lib/hooks/useOverlayVisibility";
import { useVideoPlayer } from "@/lib/hooks/useVideoPlayer";
import { updateClipAnnotations } from "@/lib/storage/videoLibraryStore";

type VideoPlayerShellProps = {
  videoUrl: string;
  title: string;
  clipId?: string;
  initialAnnotations?: VideoAnnotation[];
  backHref?: string;
};

function formatClock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const whole = Math.floor(seconds);
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function PlayPauseIcon({ playing }: { playing: boolean }) {
  if (playing) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="6" y="4.5" width="4.5" height="15" rx="1.5" fill="currentColor" />
        <rect x="13.5" y="4.5" width="4.5" height="15" rx="1.5" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8.2 4.8c-.7-.4-1.5.1-1.5.9v12.6c0 .8.8 1.3 1.5.9l11-6.3c.7-.4.7-1.4 0-1.8l-11-6.3z"
        fill="currentColor"
      />
    </svg>
  );
}

function MarkupIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M15.2 4.3c.5-.5 1.3-.5 1.8 0l2.7 2.7c.5.5.5 1.3 0 1.8L9.2 19.3c-.2.2-.5.3-.8.4l-3.6.8c-.6.1-1.1-.4-1-.1l.8-3.6c.1-.3.2-.6.4-.8L15.2 4.3z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function VideoPlayerShell({
  videoUrl,
  title,
  clipId,
  initialAnnotations = [],
  backHref = "/vault/video-analysis",
}: VideoPlayerShellProps) {
  const { setImmersive } = useVideoImmersive();
  const player = useVideoPlayer({ videoUrl });
  const { thumbnails } = useFilmstripThumbnails(videoUrl);
  const overlay = useOverlayVisibility(5000);

  const [mode, setMode] = useState<PlayerInteractionMode>("watch");
  const [annotations, setAnnotations] =
    useState<VideoAnnotation[]>(initialAnnotations);
  const [activeTool, setActiveTool] = useState<AnnotationTool>("draw");
  const [color, setColor] = useState(ANNOTATION_COLOR);
  const [persistentDrawing, setPersistentDrawing] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const annotationsRef = useRef(annotations);
  annotationsRef.current = annotations;

  const controlsVisible =
    mode === "mark" || overlay.controlsVisible || player.isScrubbing;

  useEffect(() => {
    setImmersive(true);
    return () => setImmersive(false);
  }, [setImmersive]);

  const seekToFrameRef = useRef(player.seekToFrame);
  seekToFrameRef.current = player.seekToFrame;

  useEffect(() => {
    setAnnotations(initialAnnotations);

    if (initialAnnotations.length === 0) {
      return;
    }

    const firstMarkedFrame = Math.min(
      ...initialAnnotations.map((annotation) => annotation.frame),
    );
    const timer = window.setTimeout(() => {
      seekToFrameRef.current(firstMarkedFrame);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [initialAnnotations, clipId]);

  const persistAnnotations = useCallback(
    (next: VideoAnnotation[]) => {
      if (!clipId) {
        return;
      }

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(() => {
        void updateClipAnnotations(clipId, next).catch((error) => {
          console.error(error);
        });
      }, 350);
    },
    [clipId],
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      if (clipId) {
        void updateClipAnnotations(clipId, annotationsRef.current).catch(
          () => undefined,
        );
      }
    };
  }, [clipId]);

  const handleAnnotationsChange = useCallback(
    (next: VideoAnnotation[]) => {
      setAnnotations(next);
      persistAnnotations(next);
    },
    [persistAnnotations],
  );

  const enterMarkMode = useCallback(() => {
    player.pause();
    setMode("mark");
    overlay.showControls();
  }, [overlay, player]);

  const exitMarkMode = useCallback(() => {
    setMode("watch");
    overlay.notifyActivity();
  }, [overlay]);

  const handleScrubStart = useCallback(() => {
    player.pause();
    player.beginScrub();
    overlay.notifyActivity();
  }, [overlay, player]);

  const handleScrub = useCallback(
    (time: number) => {
      player.scrubToTime(time);
    },
    [player],
  );

  const handleScrubEnd = useCallback(() => {
    player.endScrub();
    player.pause();
  }, [player]);

  const handleUndo = useCallback(() => {
    setAnnotations((current) => {
      for (let index = current.length - 1; index >= 0; index -= 1) {
        if (annotationVisibleOnFrame(current[index], player.currentFrame)) {
          const next = [
            ...current.slice(0, index),
            ...current.slice(index + 1),
          ];
          persistAnnotations(next);
          return next;
        }
      }

      return current;
    });
  }, [persistAnnotations, player.currentFrame]);

  const handleClearVisible = useCallback(() => {
    setAnnotations((current) => {
      const next = current.filter(
        (annotation) =>
          !annotationVisibleOnFrame(annotation, player.currentFrame),
      );
      persistAnnotations(next);
      return next;
    });
  }, [persistAnnotations, player.currentFrame]);

  const canUndo = annotations.some((annotation) =>
    annotationVisibleOnFrame(annotation, player.currentFrame),
  );

  return (
    <div
      className="fixed inset-0 z-[100] bg-black touch-manipulation overscroll-none"
      style={{ height: "100dvh" }}
    >
      <div className="absolute inset-0">
        <ImmersiveVideoViewport
          videoUrl={videoUrl}
          videoRef={player.videoRef}
          annotations={annotations}
          currentFrame={player.currentFrame}
          activeTool={activeTool}
          annotationColor={color}
          mode={mode}
          muted={player.isMuted}
          persistentDrawing={persistentDrawing}
          controlsVisible={controlsVisible}
          isPlaying={player.isPlaying}
          onAnnotationsChange={handleAnnotationsChange}
          onTogglePlay={() => {
            overlay.notifyActivity();
            void player.togglePlay();
          }}
          onStepFrames={(delta) => {
            overlay.notifyActivity();
            player.stepFrames(delta);
          }}
          onInteraction={overlay.notifyActivity}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between">
        <div className="pointer-events-auto flex items-center justify-between gap-3 px-3 pb-2 pt-[max(0.85rem,env(safe-area-inset-top))]">
          {mode === "watch" ? (
            <>
              <a
                href={backHref}
                className={`${glassButtonClassName} h-11 min-w-11 px-3 text-[17px] font-semibold`}
                aria-label="Done"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  player.pause();
                  setImmersive(false);
                  window.location.assign(backHref);
                }}
              >
                Done
              </a>

              <p
                className={`${glassPillClassName} max-w-[70%] truncate ${overlayFadeClass(
                  controlsVisible,
                )}`}
              >
                {title}
              </p>

              <span className="h-11 w-11 shrink-0" aria-hidden="true" />
            </>
          ) : (
            <>
              <span className={`${glassPillClassName} tabular-nums`}>
                Frame {player.currentFrame}
              </span>
              <p className={`${glassPillClassName} max-w-[42%] truncate`}>
                {title}
              </p>
              <button
                type="button"
                className="flex h-11 min-w-[4.5rem] items-center justify-center rounded-full bg-white px-4 text-[15px] font-semibold text-black active:scale-95 touch-manipulation"
                onClick={exitMarkMode}
              >
                Done
              </button>
            </>
          )}
        </div>

        <div className="pointer-events-auto mt-auto">
          {mode === "watch" && (
            <>
              <div className={overlayFadeClass(controlsVisible)}>
                <VideoFilmstripTimeline
                  currentTime={player.currentTime}
                  duration={player.duration}
                  thumbnails={thumbnails}
                  visible={controlsVisible}
                  onScrubStart={handleScrubStart}
                  onScrub={handleScrub}
                  onScrubEnd={handleScrubEnd}
                  onInteraction={overlay.notifyActivity}
                  frameLabel={`${formatClock(player.currentTime)} · Frame ${player.currentFrame}`}
                />
              </div>

              <div className="flex items-center justify-center gap-10 px-4 pb-[max(1.1rem,env(safe-area-inset-bottom))] pt-1">
                <button
                  type="button"
                  aria-label={player.isPlaying ? "Pause" : "Play"}
                  className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-white text-black shadow-[0_8px_28px_rgba(0,0,0,0.35)] transition active:scale-95 touch-manipulation"
                  onClick={() => {
                    overlay.notifyActivity();
                    void player.togglePlay();
                  }}
                >
                  <span className={player.isPlaying ? "" : "translate-x-[1px]"}>
                    <PlayPauseIcon playing={player.isPlaying} />
                  </span>
                </button>

                <button
                  type="button"
                  aria-label="Open markup"
                  className={`${glassButtonClassName} h-14 w-14 text-white`}
                  onClick={enterMarkMode}
                >
                  <MarkupIcon />
                </button>
              </div>
            </>
          )}

          {mode === "mark" && (
            <VideoMarkupBar
              activeTool={activeTool}
              color={color}
              persistent={persistentDrawing}
              canUndo={canUndo}
              canClear={canUndo}
              onToolChange={setActiveTool}
              onColorChange={setColor}
              onPersistentChange={setPersistentDrawing}
              onUndo={handleUndo}
              onClear={handleClearVisible}
              onDone={exitMarkMode}
            />
          )}
        </div>
      </div>
    </div>
  );
}
