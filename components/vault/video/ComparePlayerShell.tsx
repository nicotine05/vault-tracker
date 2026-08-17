"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ImmersiveVideoViewport from "@/components/vault/video/ImmersiveVideoViewport";
import VideoDrawingMenu from "@/components/vault/video/VideoDrawingMenu";
import VideoFilmstripTimeline from "@/components/vault/video/VideoFilmstripTimeline";
import { useVideoImmersive } from "@/components/vault/video/VideoFocusModeContext";
import {
  glassButtonClassName,
  glassPanelClassName,
  glassPillClassName,
  overlayFadeClass,
} from "@/components/vault/video/videoStyles";
import type {
  AnnotationTool,
  CompareLayoutMode,
  SyncPoint,
  SyncPointLabel,
  VideoAnnotation,
} from "@/lib/domain/videoAnalysis";
import {
  ANNOTATION_COLOR,
  SYNC_POINT_LABELS,
  clampSyncOffset,
  getSyncOffsetBounds,
  seekToFrame,
  seekToTime,
} from "@/lib/domain/videoAnalysis";
import { useFilmstripThumbnails } from "@/lib/hooks/useFilmstripThumbnails";
import { useOverlayVisibility } from "@/lib/hooks/useOverlayVisibility";
import { useVideoPlayer } from "@/lib/hooks/useVideoPlayer";

type ComparePlayerShellProps = {
  videoUrlA: string;
  videoUrlB: string;
  titleA: string;
  titleB: string;
  backHref?: string;
};

type ActiveVideo = "A" | "B";

export default function ComparePlayerShell({
  videoUrlA,
  videoUrlB,
  titleA,
  titleB,
  backHref = "/vault/video-analysis",
}: ComparePlayerShellProps) {
  const { setImmersive } = useVideoImmersive();
  const playerA = useVideoPlayer();
  const playerB = useVideoPlayer();
  const overlay = useOverlayVisibility();
  const lastAnnotationTarget = useRef<ActiveVideo>("A");

  const { thumbnails: thumbnailsA } = useFilmstripThumbnails(videoUrlA);

  const [annotationsA, setAnnotationsA] = useState<VideoAnnotation[]>([]);
  const [annotationsB, setAnnotationsB] = useState<VideoAnnotation[]>([]);
  const [activeTool, setActiveTool] = useState<AnnotationTool | null>(null);
  const [annotationColor, setAnnotationColor] = useState(ANNOTATION_COLOR);
  const [layoutMode, setLayoutMode] = useState<CompareLayoutMode>("side");
  const [swipePosition, setSwipePosition] = useState(50);
  const [activeVideo, setActiveVideo] = useState<ActiveVideo>("A");
  const [syncPointA, setSyncPointA] = useState<SyncPoint | null>(null);
  const [syncPointB, setSyncPointB] = useState<SyncPoint | null>(null);
  const [isSynced, setIsSynced] = useState(false);
  const [syncOffset, setSyncOffset] = useState(0);
  const [syncMenuOpen, setSyncMenuOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const drawingEnabled = activeTool !== null;
  const isScrubbing = playerA.isScrubbing || playerB.isScrubbing;
  const controlsVisible =
    overlay.controlsVisible ||
    isScrubbing ||
    optionsOpen ||
    syncMenuOpen;

  useEffect(() => {
    setImmersive(true);
    return () => setImmersive(false);
  }, [setImmersive]);

  const syncBounds = useMemo(() => {
    if (!syncPointA || !syncPointB || syncPointA.label !== syncPointB.label) {
      return { min: 0, max: 0 };
    }

    return getSyncOffsetBounds(
      syncPointA.frame,
      syncPointB.frame,
      playerA.totalFrames,
      playerB.totalFrames,
    );
  }, [playerA.totalFrames, playerB.totalFrames, syncPointA, syncPointB]);

  const applySyncOffset = useCallback(
    (offset: number) => {
      if (!syncPointA || !syncPointB) {
        return;
      }

      const clamped = clampSyncOffset(
        offset,
        syncPointA.frame,
        syncPointB.frame,
        playerA.totalFrames,
        playerB.totalFrames,
      );

      setSyncOffset(clamped);

      if (playerA.videoRef.current) {
        seekToFrame(playerA.videoRef.current, syncPointA.frame + clamped);
      }

      if (playerB.videoRef.current) {
        seekToFrame(playerB.videoRef.current, syncPointB.frame + clamped);
      }

      playerA.syncFrameFromVideo();
      playerB.syncFrameFromVideo();
    },
    [playerA, playerB, syncPointA, syncPointB],
  );

  const applySyncOffsetSmooth = useCallback(
    (offset: number) => {
      if (!syncPointA || !syncPointB) {
        return;
      }

      const clamped = clampSyncOffset(
        offset,
        syncPointA.frame,
        syncPointB.frame,
        playerA.totalFrames,
        playerB.totalFrames,
      );

      setSyncOffset(clamped);

      if (playerA.videoRef.current) {
        seekToTime(
          playerA.videoRef.current,
          (syncPointA.frame + clamped) / playerA.fps,
          { smooth: true },
        );
      }

      if (playerB.videoRef.current) {
        seekToTime(
          playerB.videoRef.current,
          (syncPointB.frame + clamped) / playerB.fps,
          { smooth: true },
        );
      }
    },
    [playerA, playerB, syncPointA, syncPointB],
  );

  const activePlayer = activeVideo === "A" ? playerA : playerB;

  const timelineTime = isSynced
    ? (syncOffset - syncBounds.min) / activePlayer.fps
    : activePlayer.currentTime;

  const timelineDuration = isSynced
    ? (syncBounds.max - syncBounds.min) / activePlayer.fps
    : activePlayer.duration;

  const handleScrubStart = useCallback(() => {
    playerA.pause();
    playerB.pause();
    playerA.beginScrub();
    playerB.beginScrub();
  }, [playerA, playerB]);

  const handleScrub = useCallback(
    (time: number) => {
      if (isSynced) {
        applySyncOffsetSmooth(time * activePlayer.fps + syncBounds.min);
        return;
      }

      activePlayer.scrubToTime(time);
    },
    [activePlayer, applySyncOffsetSmooth, isSynced, syncBounds.min],
  );

  const handleScrubEnd = useCallback(() => {
    if (isSynced) {
      applySyncOffset(syncOffset);
    }

    playerA.endScrub();
    playerB.endScrub();
    playerA.pause();
    playerB.pause();
    playerA.syncTimeFromVideo();
    playerB.syncTimeFromVideo();
  }, [applySyncOffset, isSynced, playerA, playerB, syncOffset]);

  const handleStep = useCallback(
    (delta: number) => {
      if (isSynced) {
        applySyncOffset(syncOffset + delta);
        return;
      }

      activePlayer.stepFrames(delta);
    },
    [activePlayer, applySyncOffset, isSynced, syncOffset],
  );

  const handleTogglePlay = useCallback(async () => {
    const playing = playerA.isPlaying || playerB.isPlaying;

    if (playing) {
      playerA.pause();
      playerB.pause();
      return;
    }

    if (isSynced) {
      applySyncOffset(syncOffset);
    }

    await Promise.all([playerA.play(), playerB.play()]);
  }, [applySyncOffset, isSynced, playerA, playerB, syncOffset]);

  const setSyncPointForActive = (label: SyncPointLabel) => {
    const point = { label, frame: activePlayer.currentFrame };

    if (activeVideo === "A") {
      setSyncPointA(point);
    } else {
      setSyncPointB(point);
    }

    setSyncMenuOpen(false);
    overlay.notifyActivity();
  };

  const handleSync = () => {
    if (
      !syncPointA ||
      !syncPointB ||
      syncPointA.label !== syncPointB.label
    ) {
      return;
    }

    setIsSynced(true);
    applySyncOffset(0);
    setSyncMenuOpen(false);
  };

  const updateAnnotationsA = (next: VideoAnnotation[]) => {
    if (next.length > annotationsA.length) {
      lastAnnotationTarget.current = "A";
    }
    setAnnotationsA(next);
  };

  const updateAnnotationsB = (next: VideoAnnotation[]) => {
    if (next.length > annotationsB.length) {
      lastAnnotationTarget.current = "B";
    }
    setAnnotationsB(next);
  };

  const handleUndo = () => {
    const frame =
      lastAnnotationTarget.current === "A"
        ? playerA.currentFrame
        : playerB.currentFrame;

    const setter =
      lastAnnotationTarget.current === "A"
        ? setAnnotationsA
        : setAnnotationsB;

    setter((current) => {
      for (let index = current.length - 1; index >= 0; index -= 1) {
        if (current[index].frame === frame) {
          return [...current.slice(0, index), ...current.slice(index + 1)];
        }
      }
      return current;
    });
  };

  const canUndo =
    annotationsA.some((a) => a.frame === playerA.currentFrame) ||
    annotationsB.some((a) => a.frame === playerB.currentFrame);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      overlay.notifyActivity();

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleStep(event.shiftKey ? -5 : -1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleStep(event.shiftKey ? 5 : 1);
      }

      if (event.key === " ") {
        event.preventDefault();
        void handleTogglePlay();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleStep, handleTogglePlay, overlay]);

  const renderViewport = (
    video: ActiveVideo,
    url: string,
    player: ReturnType<typeof useVideoPlayer>,
    label: string,
    annotations: VideoAnnotation[],
    onAnnotationsChange: (next: VideoAnnotation[]) => void,
  ) => (
    <div
      className={`relative h-full min-h-0 ${
        layoutMode === "side" ? "flex-1" : "w-full flex-1"
      }`}
      onPointerDown={() => setActiveVideo(video)}
    >
      <div className="absolute left-3 top-3 z-10">
        <span className={glassPillClassName}>{label}</span>
      </div>
      <ImmersiveVideoViewport
        videoUrl={url}
        videoRef={player.videoRef}
        annotations={annotations}
        currentFrame={player.currentFrame}
        activeTool={activeTool}
        annotationColor={annotationColor}
        drawingEnabled={drawingEnabled && activeVideo === video}
        onAnnotationsChange={onAnnotationsChange}
        onSingleTap={overlay.toggleControls}
        onDoubleTapLeft={() => handleStep(-5)}
        onDoubleTapRight={() => handleStep(5)}
        onInteraction={overlay.notifyActivity}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <div
        className={`absolute inset-0 pt-[max(3rem,calc(env(safe-area-inset-top)+2.5rem))] pb-[max(8.5rem,calc(env(safe-area-inset-bottom)+7rem))] ${
          layoutMode === "side"
            ? "flex flex-row gap-0.5"
            : layoutMode === "stack"
              ? "flex flex-col gap-0.5"
              : "relative overflow-hidden"
        }`}
      >
        {layoutMode === "swipe" ? (
          <>
            <div className="absolute inset-0">
              <ImmersiveVideoViewport
                videoUrl={videoUrlB}
                videoRef={playerB.videoRef}
                annotations={annotationsB}
                currentFrame={playerB.currentFrame}
                activeTool={activeTool}
                annotationColor={annotationColor}
                drawingEnabled={drawingEnabled && activeVideo === "B"}
                onAnnotationsChange={updateAnnotationsB}
                onSingleTap={overlay.toggleControls}
                onDoubleTapLeft={() => handleStep(-5)}
                onDoubleTapRight={() => handleStep(5)}
                onInteraction={overlay.notifyActivity}
              />
            </div>
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - swipePosition}% 0 0)` }}
            >
              <ImmersiveVideoViewport
                videoUrl={videoUrlA}
                videoRef={playerA.videoRef}
                annotations={annotationsA}
                currentFrame={playerA.currentFrame}
                activeTool={activeTool}
                annotationColor={annotationColor}
                drawingEnabled={drawingEnabled && activeVideo === "A"}
                onAnnotationsChange={updateAnnotationsA}
                onSingleTap={overlay.toggleControls}
                onDoubleTapLeft={() => handleStep(-5)}
                onDoubleTapRight={() => handleStep(5)}
                onInteraction={overlay.notifyActivity}
              />
            </div>
            <div
              className="absolute bottom-0 top-0 z-10 w-1 cursor-ew-resize bg-white/80"
              style={{ left: `${swipePosition}%` }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
                  return;
                }

                const ratio = Math.max(
                  10,
                  Math.min(90, (event.clientX / window.innerWidth) * 100),
                );
                setSwipePosition(ratio);
                overlay.notifyActivity();
              }}
            />
          </>
        ) : (
          <>
            {renderViewport(
              "A",
              videoUrlA,
              playerA,
              titleA,
              annotationsA,
              updateAnnotationsA,
            )}
            {renderViewport(
              "B",
              videoUrlB,
              playerB,
              titleB,
              annotationsB,
              updateAnnotationsB,
            )}
          </>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
        <div
          className={`pointer-events-auto flex items-center justify-between px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] ${overlayFadeClass(
            controlsVisible,
          )}`}
        >
          <Link
            href={backHref}
            className={`${glassButtonClassName} h-10 w-10 text-base`}
            aria-label="Back"
          >
            ←
          </Link>

          <p className={`${glassPillClassName} max-w-[44%] truncate`}>
            Compare
          </p>

          <div className="relative">
            <button
              type="button"
              className={`${glassButtonClassName} h-10 w-10 text-base`}
              onClick={() => {
                overlay.notifyActivity();
                setSyncMenuOpen(false);
                setOptionsOpen((current) => !current);
              }}
            >
              •••
            </button>

            {optionsOpen && controlsVisible && (
              <div
                className={`absolute right-0 top-full z-50 mt-2 min-w-[190px] rounded-2xl ${glassPanelClassName} p-2 shadow-xl`}
              >
                {(["side", "stack", "swipe"] as CompareLayoutMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`block w-full rounded-xl px-3 py-2 text-left text-sm capitalize text-white hover:bg-white/10 ${
                      layoutMode === mode ? "bg-white/10 font-semibold" : ""
                    }`}
                    onClick={() => {
                      setLayoutMode(mode);
                      setOptionsOpen(false);
                      overlay.notifyActivity();
                    }}
                  >
                    {mode === "side"
                      ? "Side-by-Side"
                      : mode === "stack"
                        ? "Vertical Stack"
                        : "Swipe Compare"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {!isSynced && controlsVisible && !optionsOpen && (
          <div className="pointer-events-auto absolute left-1/2 top-[max(4.5rem,calc(env(safe-area-inset-top)+3.5rem))] z-30 -translate-x-1/2">
            <div className="flex gap-2">
              {(["A", "B"] as ActiveVideo[]).map((video) => (
                <button
                  key={video}
                  type="button"
                  className={`${glassPillClassName} ${
                    activeVideo === video ? "bg-white/20" : ""
                  }`}
                  onClick={() => {
                    setActiveVideo(video);
                    overlay.notifyActivity();
                  }}
                >
                  Video {video}
                </button>
              ))}
              <button
                type="button"
                className={`${glassPillClassName} bg-white/20`}
                onClick={() => {
                  setSyncMenuOpen((current) => !current);
                  overlay.notifyActivity();
                }}
              >
                Set Sync Point
              </button>
            </div>

            {syncMenuOpen && (
              <div
                className={`mt-2 overflow-hidden rounded-2xl ${glassPanelClassName}`}
              >
                {SYNC_POINT_LABELS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="block w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/10"
                    onClick={() => setSyncPointForActive(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {syncPointA && syncPointB && syncPointA.label === syncPointB.label && (
              <button
                type="button"
                className="mt-2 w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
                onClick={handleSync}
              >
                Sync at {syncPointA.label}
              </button>
            )}
          </div>
        )}

        {isSynced && controlsVisible && !optionsOpen && (
          <p className="pointer-events-none absolute left-1/2 top-[max(4.5rem,calc(env(safe-area-inset-top)+3.5rem))] z-30 -translate-x-1/2 text-xs font-medium text-white/80">
            Synced · {syncPointA?.label} = frame 0
          </p>
        )}

        <div className="pointer-events-auto mt-auto">
          <VideoFilmstripTimeline
            currentTime={timelineTime}
            duration={timelineDuration}
            thumbnails={thumbnailsA}
            visible={controlsVisible && !drawingEnabled}
            disabled={drawingEnabled}
            onScrubStart={handleScrubStart}
            onScrub={handleScrub}
            onScrubEnd={handleScrubEnd}
            onInteraction={overlay.notifyActivity}
            frameLabel={
              isSynced
                ? `Frame ${syncOffset} · takeoff = 0`
                : `Video ${activeVideo} · Frame ${activePlayer.currentFrame}`
            }
          />

          <div
            className={`flex items-center justify-center gap-8 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 ${overlayFadeClass(
              controlsVisible && !drawingEnabled,
            )}`}
          >
            <button
              type="button"
              className={`${glassButtonClassName} h-9 w-9 text-sm`}
              onClick={() => {
                overlay.notifyActivity();
                handleStep(-1);
              }}
            >
              ◀
            </button>
            <button
              type="button"
              className={`${glassButtonClassName} h-10 w-10 text-base`}
              onClick={() => {
                overlay.notifyActivity();
                handleStep(-5);
              }}
            >
              ⏪
            </button>
            <button
              type="button"
              className={`${glassButtonClassName} h-14 w-14 text-2xl`}
              onClick={() => {
                overlay.notifyActivity();
                void handleTogglePlay();
              }}
            >
              {playerA.isPlaying || playerB.isPlaying ? "⏸" : "▶️"}
            </button>
            <button
              type="button"
              className={`${glassButtonClassName} h-10 w-10 text-base`}
              onClick={() => {
                overlay.notifyActivity();
                handleStep(5);
              }}
            >
              ⏩
            </button>
            <button
              type="button"
              className={`${glassButtonClassName} h-9 w-9 text-sm`}
              onClick={() => {
                overlay.notifyActivity();
                handleStep(1);
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
        onToolChange={(tool) => {
          playerA.pause();
          playerB.pause();
          setActiveTool(tool);
        }}
        onColorChange={setAnnotationColor}
        onUndo={handleUndo}
        onClear={() => {
          if (lastAnnotationTarget.current === "A") {
            setAnnotationsA((current) =>
              current.filter((a) => a.frame !== playerA.currentFrame),
            );
          } else {
            setAnnotationsB((current) =>
              current.filter((a) => a.frame !== playerB.currentFrame),
            );
          }
        }}
        canUndo={canUndo}
        canClear={canUndo}
        onInteraction={overlay.notifyActivity}
      />
    </div>
  );
}
