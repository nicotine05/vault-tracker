"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ImmersiveVideoViewport from "@/components/vault/video/ImmersiveVideoViewport";
import VideoDrawingMenu from "@/components/vault/video/VideoDrawingMenu";
import VideoFilmstripTimeline from "@/components/vault/video/VideoFilmstripTimeline";
import { useVideoImmersive } from "@/components/vault/video/VideoFocusModeContext";
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

type VideoPlayerShellProps = {
  videoUrl: string;
  title: string;
  backHref?: string;
};

export default function VideoPlayerShell({
  videoUrl,
  title,
  backHref = "/vault/video-analysis",
}: VideoPlayerShellProps) {
  const { setImmersive } = useVideoImmersive();
  const player = useVideoPlayer();
  const { thumbnails } = useFilmstripThumbnails(videoUrl, player.videoRef);
  const overlay = useOverlayVisibility();

  const [annotations, setAnnotations] = useState<VideoAnnotation[]>([]);
  const [activeTool, setActiveTool] = useState<AnnotationTool | null>(null);
  const [annotationColor, setAnnotationColor] = useState(ANNOTATION_COLOR);
  const [menuOpen, setMenuOpen] = useState(false);

  const drawingEnabled = activeTool !== null;
  const controlsVisible =
    overlay.controlsVisible || player.isScrubbing || menuOpen;

  useEffect(() => {
    setImmersive(true);
    return () => setImmersive(false);
  }, [setImmersive]);

  const handleScrubStart = useCallback(() => {
    player.pause();
    player.beginScrub();
  }, [player]);

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

  const handleToolChange = useCallback(
    (tool: AnnotationTool | null) => {
      player.pause();
      setActiveTool(tool);
    },
    [player],
  );

  const handleUndo = useCallback(() => {
    setAnnotations((current) => {
      for (let index = current.length - 1; index >= 0; index -= 1) {
        if (current[index].frame === player.currentFrame) {
          return [...current.slice(0, index), ...current.slice(index + 1)];
        }
      }

      return current;
    });
  }, [player.currentFrame]);

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
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [overlay, player]);

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <ImmersiveVideoViewport
        videoUrl={videoUrl}
        videoRef={player.videoRef}
        annotations={annotations}
        currentFrame={player.currentFrame}
        activeTool={activeTool}
        annotationColor={annotationColor}
        drawingEnabled={drawingEnabled}
        onAnnotationsChange={setAnnotations}
        onSingleTap={overlay.toggleControls}
        onDoubleTapLeft={() => player.stepFrames(-5)}
        onDoubleTapRight={() => player.stepFrames(5)}
        onInteraction={overlay.notifyActivity}
      />

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
        <div
          className={`pointer-events-auto flex items-center justify-between px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] ${overlayFadeClass(
            controlsVisible,
          )}`}
        >
          <Link
            href={backHref}
            className={`${glassButtonClassName} h-10 w-10 text-base`}
            aria-label="Back"
            onClick={() => overlay.notifyActivity()}
          >
            ←
          </Link>

          <p className={`${glassPillClassName} max-w-[50%] truncate`}>
            {title}
          </p>

          <button
            type="button"
            aria-label="More options"
            className={`${glassButtonClassName} h-10 w-10 text-base`}
            onClick={() => {
              overlay.notifyActivity();
              setMenuOpen((current) => !current);
            }}
          >
            •••
          </button>
        </div>

        {menuOpen && controlsVisible && (
          <div className="pointer-events-auto absolute right-4 top-16 min-w-[180px] rounded-2xl bg-black/45 p-2 backdrop-blur-2xl border border-white/10">
            <button
              type="button"
              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-white hover:bg-white/10"
              onClick={() => {
                setAnnotations([]);
                setMenuOpen(false);
              }}
            >
              Clear all drawings
            </button>
            <button
              type="button"
              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-white hover:bg-white/10"
              onClick={() => {
                overlay.hideControls();
                setMenuOpen(false);
              }}
            >
              Hide controls
            </button>
          </div>
        )}

        <div className="pointer-events-auto mt-auto">
          <VideoFilmstripTimeline
            currentTime={player.currentTime}
            duration={player.duration}
            thumbnails={thumbnails}
            visible={controlsVisible && !drawingEnabled}
            disabled={drawingEnabled}
            onScrubStart={handleScrubStart}
            onScrub={handleScrub}
            onScrubEnd={handleScrubEnd}
            onInteraction={overlay.notifyActivity}
            frameLabel={`Frame ${Math.round(player.currentTime * player.fps)}`}
          />

          <div
            className={`flex items-center justify-center gap-8 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 ${overlayFadeClass(
              controlsVisible && !drawingEnabled,
            )}`}
          >
            <button
              type="button"
              aria-label="Previous frame"
              className={`${glassButtonClassName} h-9 w-9 text-sm`}
              onClick={() => {
                overlay.notifyActivity();
                player.stepFrames(-1);
              }}
            >
              ◀
            </button>

            <button
              type="button"
              aria-label="Jump back"
              className={`${glassButtonClassName} h-10 w-10 text-base`}
              onClick={() => {
                overlay.notifyActivity();
                player.stepFrames(-5);
              }}
            >
              ⏪
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
              aria-label="Jump forward"
              className={`${glassButtonClassName} h-10 w-10 text-base`}
              onClick={() => {
                overlay.notifyActivity();
                player.stepFrames(5);
              }}
            >
              ⏩
            </button>

            <button
              type="button"
              aria-label="Next frame"
              className={`${glassButtonClassName} h-9 w-9 text-sm`}
              onClick={() => {
                overlay.notifyActivity();
                player.stepFrames(1);
              }}
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      <VideoDrawingMenu
        activeTool={activeTool}
        annotationColor={annotationColor}
        controlsVisible={controlsVisible}
        onToolChange={handleToolChange}
        onColorChange={setAnnotationColor}
        onUndo={handleUndo}
        onClear={() =>
          setAnnotations((current) =>
            current.filter((annotation) => annotation.frame !== player.currentFrame),
          )
        }
        canUndo={canUndo}
        canClear={canUndo}
        onInteraction={overlay.notifyActivity}
      />
    </div>
  );
}
