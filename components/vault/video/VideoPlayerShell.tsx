"use client";

import { useRouter } from "next/navigation";
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

export default function VideoPlayerShell({
  videoUrl,
  title,
  clipId,
  initialAnnotations = [],
  backHref = "/vault/video-analysis",
}: VideoPlayerShellProps) {
  const router = useRouter();
  const { setImmersive } = useVideoImmersive();
  const player = useVideoPlayer({ videoUrl });
  const { thumbnails } = useFilmstripThumbnails(videoUrl);
  const overlay = useOverlayVisibility(4500);

  const [mode, setMode] = useState<PlayerInteractionMode>("watch");
  const [annotations, setAnnotations] =
    useState<VideoAnnotation[]>(initialAnnotations);
  const [activeTool, setActiveTool] = useState<AnnotationTool>("draw");
  const [color, setColor] = useState(ANNOTATION_COLOR);
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
        if (current[index].frame === player.currentFrame) {
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

  const handleClearFrame = useCallback(() => {
    setAnnotations((current) => {
      const next = current.filter(
        (annotation) => annotation.frame !== player.currentFrame,
      );
      persistAnnotations(next);
      return next;
    });
  }, [persistAnnotations, player.currentFrame]);

  const canUndo = annotations.some(
    (annotation) => annotation.frame === player.currentFrame,
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      overlay.notifyActivity();

      if (event.key === "Escape" && mode === "mark") {
        event.preventDefault();
        exitMarkMode();
        return;
      }

      if (mode === "mark") {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        player.stepFrames(event.shiftKey ? -5 : -1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        player.stepFrames(event.shiftKey ? 5 : 1);
      }

      if (event.key === " ") {
        event.preventDefault();
        void player.togglePlay();
      }

      if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        player.toggleMute();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [exitMarkMode, mode, overlay, player]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black"
      onMouseMove={() => {
        if (mode === "watch") {
          overlay.notifyActivity();
        }
      }}
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
        <div className="pointer-events-auto flex items-center justify-between gap-3 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          {mode === "watch" ? (
            <>
              <button
                type="button"
                className={`${glassButtonClassName} h-10 w-10 shrink-0 text-base`}
                aria-label="Back"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  player.pause();
                  setImmersive(false);
                  router.push(backHref);
                }}
              >
                ←
              </button>

              <p
                className={`${glassPillClassName} max-w-[46%] truncate ${overlayFadeClass(
                  controlsVisible,
                )}`}
              >
                {title}
              </p>

              <button
                type="button"
                className={`${glassButtonClassName} h-10 shrink-0 rounded-full px-3.5 text-sm font-semibold`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  enterMarkMode();
                }}
              >
                Markup
              </button>
            </>
          ) : (
            <>
              <span className={`${glassPillClassName}`}>
                Frame {player.currentFrame}
              </span>
              <p className={`${glassPillClassName} max-w-[46%] truncate`}>
                {title}
              </p>
              <button
                type="button"
                className="rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-black"
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

              <div
                className={`flex items-center justify-between gap-3 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1 ${overlayFadeClass(
                  controlsVisible,
                )}`}
              >
                <button
                  type="button"
                  aria-label={player.isMuted ? "Unmute" : "Mute"}
                  className={`${glassButtonClassName} h-11 w-11 text-sm`}
                  onClick={() => {
                    overlay.notifyActivity();
                    player.toggleMute();
                  }}
                >
                  {player.isMuted ? "🔇" : "🔊"}
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Previous frame"
                    className={`${glassButtonClassName} h-11 w-11 text-sm font-semibold`}
                    onClick={() => {
                      overlay.notifyActivity();
                      player.stepFrames(-1);
                    }}
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    aria-label={player.isPlaying ? "Pause" : "Play"}
                    className={`${glassButtonClassName} h-14 w-14 text-2xl`}
                    onClick={() => {
                      overlay.notifyActivity();
                      void player.togglePlay();
                    }}
                  >
                    {player.isPlaying ? "⏸" : "▶️"}
                  </button>

                  <button
                    type="button"
                    aria-label="Next frame"
                    className={`${glassButtonClassName} h-11 w-11 text-sm font-semibold`}
                    onClick={() => {
                      overlay.notifyActivity();
                      player.stepFrames(1);
                    }}
                  >
                    ›
                  </button>
                </div>

                <button
                  type="button"
                  aria-label="Open markup"
                  className={`${glassButtonClassName} h-11 w-11 text-base`}
                  onClick={enterMarkMode}
                >
                  ✎
                </button>
              </div>
            </>
          )}

          {mode === "mark" && (
            <VideoMarkupBar
              activeTool={activeTool}
              color={color}
              canUndo={canUndo}
              canClear={canUndo}
              onToolChange={setActiveTool}
              onColorChange={setColor}
              onUndo={handleUndo}
              onClear={handleClearFrame}
              onDone={exitMarkMode}
            />
          )}
        </div>
      </div>
    </div>
  );
}
