"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ImmersiveVideoViewport, {
  type PlayerInteractionMode,
} from "@/components/vault/video/ImmersiveVideoViewport";
import VideoFilmstripTimeline from "@/components/vault/video/VideoFilmstripTimeline";
import VideoInlineUploadPane from "@/components/vault/video/VideoInlineUploadPane";
import { useVideoImmersive } from "@/components/vault/video/VideoFocusModeContext";
import VideoMarkupBar from "@/components/vault/video/VideoMarkupBar";
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
  VideoAnnotation,
} from "@/lib/domain/videoAnalysis";
import {
  ANNOTATION_COLOR,
  clampSyncOffset,
  getSyncOffsetBounds,
  seekToFrame,
  seekToTime,
} from "@/lib/domain/videoAnalysis";
import { annotationVisibleOnFrame } from "@/lib/domain/videoAnnotations";
import { useOrientationLayout } from "@/lib/hooks/useOrientationLayout";
import { useOverlayVisibility } from "@/lib/hooks/useOverlayVisibility";
import { useVideoPlayer } from "@/lib/hooks/useVideoPlayer";

type ComparePlayerShellProps = {
  videoUrlA: string | null;
  videoUrlB: string | null;
  titleA: string;
  titleB: string;
  onUploadA: (file: File) => void;
  onUploadB: (file: File) => void;
  backHref?: string;
};

type ActiveVideo = "A" | "B";

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
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="6" y="4.5" width="4.5" height="15" rx="1.5" fill="currentColor" />
        <rect x="13.5" y="4.5" width="4.5" height="15" rx="1.5" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8.2 4.8c-.7-.4-1.5.1-1.5.9v12.6c0 .8.8 1.3 1.5.9l11-6.3c.7-.4.7-1.4 0-1.8l-11-6.3z"
        fill="currentColor"
      />
    </svg>
  );
}

function MarkupIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M15.2 4.3c.5-.5 1.3-.5 1.8 0l2.7 2.7c.5.5.5 1.3 0 1.8L9.2 19.3c-.2.2-.5.3-.8.4l-3.6.8c-.6.1-1.1-.4-1-.1l.8-3.6c.1-.3.2-.6.4-.8L15.2 4.3z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function ComparePlayerShell({
  videoUrlA,
  videoUrlB,
  titleA,
  titleB,
  onUploadA,
  onUploadB,
  backHref = "/vault/video-analysis",
}: ComparePlayerShellProps) {
  const { setImmersive } = useVideoImmersive();
  const playerA = useVideoPlayer({ videoUrl: videoUrlA });
  const playerB = useVideoPlayer({ videoUrl: videoUrlB });
  const overlay = useOverlayVisibility(5000);
  const orientationLayout = useOrientationLayout();
  const lastAnnotationTarget = useRef<ActiveVideo>("A");
  const syncOffsetRef = useRef(0);

  const bothVideosReady = Boolean(videoUrlA && videoUrlB);

  const [mode, setMode] = useState<PlayerInteractionMode>("watch");
  const [annotationsA, setAnnotationsA] = useState<VideoAnnotation[]>([]);
  const [annotationsB, setAnnotationsB] = useState<VideoAnnotation[]>([]);
  const [activeTool, setActiveTool] = useState<AnnotationTool>("draw");
  const [color, setColor] = useState(ANNOTATION_COLOR);
  const [persistentDrawing, setPersistentDrawing] = useState(false);
  const [layoutOverride, setLayoutOverride] = useState<CompareLayoutMode | null>(
    null,
  );
  const [swipePosition, setSwipePosition] = useState(50);
  const [activeVideo, setActiveVideo] = useState<ActiveVideo>("A");
  const [syncPointA, setSyncPointA] = useState<SyncPoint | null>(null);
  const [syncPointB, setSyncPointB] = useState<SyncPoint | null>(null);
  const [isSynced, setIsSynced] = useState(false);
  const [syncOffset, setSyncOffset] = useState(0);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const layoutMode = layoutOverride ?? orientationLayout;
  const drawingEnabled = mode === "mark";
  const isScrubbing = playerA.isScrubbing || playerB.isScrubbing;
  const controlsVisible =
    mode === "mark" ||
    overlay.controlsVisible ||
    isScrubbing ||
    optionsOpen;

  useEffect(() => {
    setImmersive(true);
    return () => setImmersive(false);
  }, [setImmersive]);

  useEffect(() => {
    syncOffsetRef.current = syncOffset;
  }, [syncOffset]);

  const syncBounds = useMemo(() => {
    if (!syncPointA || !syncPointB) {
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

      syncOffsetRef.current = clamped;
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

      syncOffsetRef.current = clamped;
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
    overlay.notifyActivity();
  }, [overlay, playerA, playerB]);

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
      applySyncOffset(syncOffsetRef.current);
    }

    playerA.endScrub();
    playerB.endScrub();
    playerA.pause();
    playerB.pause();
    playerA.syncTimeFromVideo();
    playerB.syncTimeFromVideo();
  }, [applySyncOffset, isSynced, playerA, playerB]);

  const handleStep = useCallback(
    (delta: number) => {
      if (isSynced) {
        applySyncOffset(syncOffsetRef.current + delta);
        return;
      }

      activePlayer.stepFrames(delta);
    },
    [activePlayer, applySyncOffset, isSynced],
  );

  const handleTogglePlay = useCallback(async () => {
    if (!bothVideosReady) {
      return;
    }

    const playing = playerA.isPlaying || playerB.isPlaying;

    if (playing) {
      playerA.pause();
      playerB.pause();
      return;
    }

    if (isSynced) {
      applySyncOffset(syncOffsetRef.current);
    }

    await playerA.play();
    await playerB.play();
  }, [applySyncOffset, bothVideosReady, isSynced, playerA, playerB]);

  const setFrameForActive = useCallback(() => {
    playerA.pause();
    playerB.pause();

    const point: SyncPoint = {
      label: "Custom",
      frame: activePlayer.currentFrame,
    };

    setIsSynced(false);
    setSyncOffset(0);
    syncOffsetRef.current = 0;

    if (activeVideo === "A") {
      setSyncPointA(point);
    } else {
      setSyncPointB(point);
    }

    overlay.notifyActivity();
  }, [activePlayer.currentFrame, activeVideo, overlay, playerA, playerB]);

  const unsync = useCallback(() => {
    setIsSynced(false);
    setSyncOffset(0);
    syncOffsetRef.current = 0;
    setSyncPointA(null);
    setSyncPointB(null);
    setOptionsOpen(false);
    overlay.notifyActivity();
  }, [overlay]);

  useEffect(() => {
    if (!isSynced && syncPointA && syncPointB) {
      setIsSynced(true);
      applySyncOffset(0);
    }
  }, [applySyncOffset, isSynced, syncPointA, syncPointB]);

  const enterMarkMode = useCallback(() => {
    playerA.pause();
    playerB.pause();
    setMode("mark");
    setOptionsOpen(false);
    overlay.showControls();
  }, [overlay, playerA, playerB]);

  const exitMarkMode = useCallback(() => {
    setMode("watch");
    overlay.notifyActivity();
  }, [overlay]);

  const updateAnnotationsA = useCallback((next: VideoAnnotation[]) => {
    if (next.length > annotationsA.length) {
      lastAnnotationTarget.current = "A";
    }
    setAnnotationsA(next);
  }, [annotationsA.length]);

  const updateAnnotationsB = useCallback((next: VideoAnnotation[]) => {
    if (next.length > annotationsB.length) {
      lastAnnotationTarget.current = "B";
    }
    setAnnotationsB(next);
  }, [annotationsB.length]);

  const handleUndo = useCallback(() => {
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
        if (
          annotationVisibleOnFrame(current[index], frame) ||
          current[index].frame === frame
        ) {
          return [...current.slice(0, index), ...current.slice(index + 1)];
        }
      }
      return current;
    });
  }, [playerA.currentFrame, playerB.currentFrame]);

  const handleClearVisible = useCallback(() => {
    const target = lastAnnotationTarget.current;
    const frame =
      target === "A" ? playerA.currentFrame : playerB.currentFrame;
    const setter = target === "A" ? setAnnotationsA : setAnnotationsB;

    setter((current) =>
      current.filter(
        (annotation) =>
          !(
            annotationVisibleOnFrame(annotation, frame) ||
            annotation.frame === frame
          ),
      ),
    );
  }, [playerA.currentFrame, playerB.currentFrame]);

  const canUndo =
    annotationsA.some(
      (a) =>
        annotationVisibleOnFrame(a, playerA.currentFrame) ||
        a.frame === playerA.currentFrame,
    ) ||
    annotationsB.some(
      (a) =>
        annotationVisibleOnFrame(a, playerB.currentFrame) ||
        a.frame === playerB.currentFrame,
    );

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

  const markModeFor = (video: ActiveVideo): PlayerInteractionMode =>
    drawingEnabled && activeVideo === video ? "mark" : "watch";

  const renderPane = (
    video: ActiveVideo,
    url: string | null,
    player: ReturnType<typeof useVideoPlayer>,
    label: string,
    annotations: VideoAnnotation[],
    onAnnotationsChange: (next: VideoAnnotation[]) => void,
    onUpload: (file: File) => void,
  ) => (
    <div
      className={`relative h-full min-h-0 ${
        layoutMode === "side" ? "flex-1" : "w-full flex-1"
      }`}
      onPointerDown={() => {
        if (url) {
          setActiveVideo(video);
        }
      }}
    >
      {url ? (
        <>
          <div className="absolute left-3 top-3 z-10">
            <span
              className={`${glassPillClassName} ${
                activeVideo === video && bothVideosReady ? "bg-white/20" : ""
              }`}
            >
              {label}
            </span>
          </div>
          <ImmersiveVideoViewport
            videoUrl={url}
            videoRef={player.videoRef}
            annotations={annotations}
            currentFrame={player.currentFrame}
            activeTool={activeTool}
            annotationColor={color}
            mode={markModeFor(video)}
            persistentDrawing={persistentDrawing}
            muted={player.isMuted}
            controlsVisible={controlsVisible}
            isPlaying={player.isPlaying}
            onAnnotationsChange={onAnnotationsChange}
            onTogglePlay={() => {
              overlay.toggleControls();
            }}
            onStepFrames={handleStep}
            onInteraction={overlay.notifyActivity}
          />
        </>
      ) : (
        <VideoInlineUploadPane label={label} onFileSelected={onUpload} />
      )}
    </div>
  );

  const isPlaying = playerA.isPlaying || playerB.isPlaying;
  const frameLabel = isSynced
    ? `Synced · Δ ${syncOffset >= 0 ? "+" : ""}${syncOffset}`
    : `Video ${activeVideo} · ${formatClock(activePlayer.currentTime)} · Frame ${activePlayer.currentFrame}`;

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <div
        className={`absolute inset-0 pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] pt-[max(3rem,calc(env(safe-area-inset-top)+2.5rem))] ${
          layoutMode === "side"
            ? "flex flex-row gap-0.5"
            : layoutMode === "stack"
              ? "flex flex-col gap-0.5"
              : "relative overflow-hidden"
        }`}
      >
        {layoutMode === "swipe" && bothVideosReady && videoUrlA && videoUrlB ? (
          <>
            <div className="absolute inset-0">
              <ImmersiveVideoViewport
                videoUrl={videoUrlB}
                videoRef={playerB.videoRef}
                annotations={annotationsB}
                currentFrame={playerB.currentFrame}
                activeTool={activeTool}
                annotationColor={color}
                mode={markModeFor("B")}
                persistentDrawing={persistentDrawing}
                muted={playerB.isMuted}
                controlsVisible={controlsVisible}
                isPlaying={playerB.isPlaying}
                onAnnotationsChange={updateAnnotationsB}
                onTogglePlay={() => {
                  overlay.toggleControls();
                }}
                onStepFrames={handleStep}
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
                annotationColor={color}
                mode={markModeFor("A")}
                persistentDrawing={persistentDrawing}
                muted={playerA.isMuted}
                controlsVisible={controlsVisible}
                isPlaying={playerA.isPlaying}
                onAnnotationsChange={updateAnnotationsA}
                onTogglePlay={() => {
                  overlay.toggleControls();
                }}
                onStepFrames={handleStep}
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
            {renderPane(
              "A",
              videoUrlA,
              playerA,
              titleA,
              annotationsA,
              updateAnnotationsA,
              onUploadA,
            )}
            {renderPane(
              "B",
              videoUrlB,
              playerB,
              titleB,
              annotationsB,
              updateAnnotationsB,
              onUploadB,
            )}
          </>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between">
        <div className="pointer-events-auto">
          <div
            className={`flex items-center justify-between gap-3 px-3 pb-2 pt-[max(0.85rem,env(safe-area-inset-top))] ${overlayFadeClass(
              controlsVisible,
            )}`}
          >
            {mode === "watch" ? (
              <>
                <a
                  href={backHref}
                  className={`${glassButtonClassName} h-11 min-w-11 px-3 text-[17px] font-semibold`}
                  aria-label="Done"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    playerA.pause();
                    playerB.pause();
                    setImmersive(false);
                    window.location.assign(backHref);
                  }}
                >
                  Done
                </a>

                <p className={`${glassPillClassName} max-w-[50%] truncate`}>
                  Compare
                </p>

                <div className="relative">
                  <button
                    type="button"
                    className={`${glassButtonClassName} h-11 w-11 text-base`}
                    aria-label="Options"
                    onClick={() => {
                      overlay.notifyActivity();
                      setOptionsOpen((current) => !current);
                    }}
                  >
                    •••
                  </button>

                  {optionsOpen && (
                    <div
                      className={`absolute right-0 top-full z-50 mt-2 min-w-[190px] rounded-2xl ${glassPanelClassName} p-2 shadow-xl`}
                    >
                      {(["side", "stack", "swipe"] as CompareLayoutMode[]).map(
                        (layout) => (
                          <button
                            key={layout}
                            type="button"
                            className={`block w-full rounded-xl px-3 py-2 text-left text-sm capitalize text-white hover:bg-white/10 ${
                              layoutMode === layout
                                ? "bg-white/10 font-semibold"
                                : ""
                            }`}
                            onClick={() => {
                              setLayoutOverride(layout);
                              setOptionsOpen(false);
                              overlay.notifyActivity();
                            }}
                          >
                            {layout === "side"
                              ? "Side-by-Side"
                              : layout === "stack"
                                ? "Vertical Stack"
                                : "Swipe Compare"}
                          </button>
                        ),
                      )}
                      {isSynced && (
                        <button
                          type="button"
                          className="block w-full rounded-xl px-3 py-2 text-left text-sm text-white hover:bg-white/10"
                          onClick={unsync}
                        >
                          Unsync Videos
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <span className={`${glassPillClassName} tabular-nums`}>
                  Video {activeVideo} · Frame {activePlayer.currentFrame}
                </span>
                <p className={`${glassPillClassName} max-w-[42%] truncate`}>
                  Compare
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

          {bothVideosReady && mode === "watch" && !optionsOpen && (
            <div
              className={`px-3 ${overlayFadeClass(controlsVisible)}`}
            >
              <div className="mx-auto flex max-w-lg flex-wrap items-center justify-center gap-2">
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

                {!isSynced ? (
                  <button
                    type="button"
                    className={`${glassPillClassName} bg-white/20`}
                    onClick={setFrameForActive}
                  >
                    Set Frame
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`${glassPillClassName} bg-white/15`}
                    onClick={unsync}
                  >
                    Synced · Unsync
                  </button>
                )}
              </div>

              {(syncPointA || syncPointB) && !isSynced && (
                <p className="mt-1.5 text-center text-[11px] text-white/65">
                  {syncPointA
                    ? `A: frame ${syncPointA.frame}`
                    : "A: not set"}
                  {" · "}
                  {syncPointB
                    ? `B: frame ${syncPointB.frame}`
                    : "B: not set"}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="pointer-events-auto mt-auto">
          {bothVideosReady && mode === "watch" && (
            <div
              className={`px-3 pt-1 pb-[max(0.75rem,env(safe-area-inset-bottom))] ${overlayFadeClass(
                controlsVisible,
              )}`}
            >
              <p className="mb-1.5 text-center text-[11px] font-medium tabular-nums text-white/70">
                {frameLabel}
              </p>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-[0_6px_20px_rgba(0,0,0,0.35)] transition active:scale-95 touch-manipulation"
                  onClick={() => {
                    overlay.notifyActivity();
                    void handleTogglePlay();
                  }}
                >
                  <span className={isPlaying ? "" : "translate-x-[1px]"}>
                    <PlayPauseIcon playing={isPlaying} />
                  </span>
                </button>

                <VideoFilmstripTimeline
                  currentTime={timelineTime}
                  duration={timelineDuration}
                  compact
                  onScrubStart={handleScrubStart}
                  onScrub={handleScrub}
                  onScrubEnd={handleScrubEnd}
                  onInteraction={overlay.notifyActivity}
                />

                <button
                  type="button"
                  aria-label="Open markup"
                  className={`${glassButtonClassName} h-11 w-11 shrink-0 text-white`}
                  onClick={enterMarkMode}
                >
                  <MarkupIcon />
                </button>
              </div>
            </div>
          )}

          {bothVideosReady && mode === "mark" && (
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
