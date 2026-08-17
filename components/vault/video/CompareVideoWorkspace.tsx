"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Card from "@/components/Card";
import VideoAnalysisHeader from "@/components/vault/video/VideoAnalysisHeader";
import VideoAnnotationToolbar from "@/components/vault/video/VideoAnnotationToolbar";
import VideoPlaybackControls from "@/components/vault/video/VideoPlaybackControls";
import VideoTimeline from "@/components/vault/video/VideoTimeline";
import VideoUploadZone from "@/components/vault/video/VideoUploadZone";
import VideoViewport from "@/components/vault/video/VideoViewport";
import { useVideoFocusMode } from "@/components/vault/video/VideoFocusModeContext";
import type { AnnotationTool, VideoAnnotation } from "@/lib/domain/videoAnalysis";
import {
  clampSyncOffset,
  createVideoObjectUrl,
  getSyncOffsetBounds,
  revokeVideoObjectUrl,
  seekToFrame,
} from "@/lib/domain/videoAnalysis";
import { useVideoPlayer } from "@/lib/hooks/useVideoPlayer";
import {
  primaryButtonClassName,
  segmentedIdleClassName,
  segmentedSelectedClassName,
  softButtonClassName,
} from "@/lib/ui/componentStyles";

type ActiveVideo = "A" | "B";

export default function CompareVideoWorkspace() {
  const { focusMode, setFocusMode } = useVideoFocusMode();
  const lastAnnotationTarget = useRef<ActiveVideo>("A");
  const [videoUrlA, setVideoUrlA] = useState<string | null>(null);
  const [videoUrlB, setVideoUrlB] = useState<string | null>(null);
  const [fileNameA, setFileNameA] = useState<string | null>(null);
  const [fileNameB, setFileNameB] = useState<string | null>(null);
  const [annotationsA, setAnnotationsA] = useState<VideoAnnotation[]>([]);
  const [annotationsB, setAnnotationsB] = useState<VideoAnnotation[]>([]);
  const [activeTool, setActiveTool] = useState<AnnotationTool | null>(null);
  const [activeVideo, setActiveVideo] = useState<ActiveVideo>("A");
  const [takeoffFrameA, setTakeoffFrameA] = useState<number | null>(null);
  const [takeoffFrameB, setTakeoffFrameB] = useState<number | null>(null);
  const [isSynced, setIsSynced] = useState(false);
  const [syncOffset, setSyncOffset] = useState(0);

  const playerA = useVideoPlayer();
  const playerB = useVideoPlayer();

  useEffect(() => {
    return () => {
      setFocusMode(false);
    };
  }, [setFocusMode]);

  useEffect(() => {
    return () => {
      revokeVideoObjectUrl(videoUrlA);
      revokeVideoObjectUrl(videoUrlB);
    };
  }, [videoUrlA, videoUrlB]);

  const bothLoaded = Boolean(videoUrlA && videoUrlB);

  const syncBounds = useMemo(() => {
    if (
      takeoffFrameA === null ||
      takeoffFrameB === null ||
      !bothLoaded
    ) {
      return { min: 0, max: 0 };
    }

    return getSyncOffsetBounds(
      takeoffFrameA,
      takeoffFrameB,
      playerA.totalFrames,
      playerB.totalFrames,
    );
  }, [
    bothLoaded,
    playerA.totalFrames,
    playerB.totalFrames,
    takeoffFrameA,
    takeoffFrameB,
  ]);

  const applySyncOffset = useCallback(
    (offset: number) => {
      if (takeoffFrameA === null || takeoffFrameB === null) {
        return;
      }

      const clamped = clampSyncOffset(
        offset,
        takeoffFrameA,
        takeoffFrameB,
        playerA.totalFrames,
        playerB.totalFrames,
      );

      setSyncOffset(clamped);

      if (playerA.videoRef.current) {
        seekToFrame(playerA.videoRef.current, takeoffFrameA + clamped);
      }

      if (playerB.videoRef.current) {
        seekToFrame(playerB.videoRef.current, takeoffFrameB + clamped);
      }

      playerA.syncFrameFromVideo();
      playerB.syncFrameFromVideo();
    },
    [
      playerA,
      playerB,
      takeoffFrameA,
      takeoffFrameB,
    ],
  );

  const handleSync = useCallback(() => {
    if (takeoffFrameA === null || takeoffFrameB === null) {
      return;
    }

    setIsSynced(true);
    applySyncOffset(0);
  }, [applySyncOffset, takeoffFrameA, takeoffFrameB]);

  const activePlayer = activeVideo === "A" ? playerA : playerB;

  const timelineFrame = isSynced
    ? syncOffset - syncBounds.min
    : activePlayer.currentFrame;

  const timelineTotal = isSynced
    ? syncBounds.max - syncBounds.min
    : activePlayer.totalFrames;

  const handleScrub = useCallback(
    (frame: number) => {
      if (isSynced) {
        applySyncOffset(frame + syncBounds.min);
        return;
      }

      activePlayer.scrubToFrame(frame);
    },
    [activePlayer, applySyncOffset, isSynced, syncBounds.min],
  );

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
    if (isSynced) {
      const playing = playerA.isPlaying || playerB.isPlaying;

      if (playing) {
        playerA.pause();
        playerB.pause();
        return;
      }

      applySyncOffset(syncOffset);
      await Promise.all([playerA.play(), playerB.play()]);
      return;
    }

    await activePlayer.togglePlay();
  }, [
    activePlayer,
    applySyncOffset,
    isSynced,
    playerA,
    playerB,
    syncOffset,
  ]);

  const handleUploadA = useCallback(
    (file: File) => {
      revokeVideoObjectUrl(videoUrlA);
      setVideoUrlA(createVideoObjectUrl(file));
      setFileNameA(file.name);
      setAnnotationsA([]);
      setTakeoffFrameA(null);
      setIsSynced(false);
      setSyncOffset(0);
    },
    [videoUrlA],
  );

  const handleUploadB = useCallback(
    (file: File) => {
      revokeVideoObjectUrl(videoUrlB);
      setVideoUrlB(createVideoObjectUrl(file));
      setFileNameB(file.name);
      setAnnotationsB([]);
      setTakeoffFrameB(null);
      setIsSynced(false);
      setSyncOffset(0);
    },
    [videoUrlB],
  );

  const handleScrubStart = useCallback(() => {
    playerA.pause();
    playerB.pause();

    if (!isSynced) {
      activePlayer.beginScrub();
    }
  }, [activePlayer, isSynced, playerA, playerB]);

  const handleScrubEnd = useCallback(() => {
    if (!isSynced) {
      activePlayer.endScrub();
    }

    playerA.syncFrameFromVideo();
    playerB.syncFrameFromVideo();
  }, [activePlayer, isSynced, playerA, playerB]);

  const updateAnnotationsA = useCallback(
    (next: VideoAnnotation[]) => {
      if (next.length > annotationsA.length) {
        lastAnnotationTarget.current = "A";
      }
      setAnnotationsA(next);
    },
    [annotationsA.length],
  );

  const updateAnnotationsB = useCallback(
    (next: VideoAnnotation[]) => {
      if (next.length > annotationsB.length) {
        lastAnnotationTarget.current = "B";
      }
      setAnnotationsB(next);
    },
    [annotationsB.length],
  );

  const handleUndo = useCallback(() => {
    if (lastAnnotationTarget.current === "A") {
      setAnnotationsA((current) => current.slice(0, -1));
      return;
    }

    setAnnotationsB((current) => current.slice(0, -1));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!bothLoaded || focusMode) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

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
  }, [bothLoaded, focusMode, handleStep, handleTogglePlay]);

  if (!bothLoaded) {
    return (
      <main className="mx-auto max-w-md space-y-4 p-4 pb-20">
        <VideoAnalysisHeader title="Compare Videos" showFocusToggle={false} />

        {!videoUrlA ? (
          <VideoUploadZone
            label="Upload Video A"
            onFileSelected={handleUploadA}
          />
        ) : (
          <Card>
            <p className="text-sm font-semibold text-foreground">Video A ready</p>
            <p className="mt-1 truncate text-sm text-muted">{fileNameA}</p>
            <button
              type="button"
              onClick={() => {
                revokeVideoObjectUrl(videoUrlA);
                setVideoUrlA(null);
                setFileNameA(null);
              }}
              className={`${softButtonClassName} mt-3`}
            >
              Replace Video A
            </button>
          </Card>
        )}

        {!videoUrlB ? (
          <VideoUploadZone
            label="Upload Video B"
            onFileSelected={handleUploadB}
          />
        ) : (
          <Card>
            <p className="text-sm font-semibold text-foreground">Video B ready</p>
            <p className="mt-1 truncate text-sm text-muted">{fileNameB}</p>
            <button
              type="button"
              onClick={() => {
                revokeVideoObjectUrl(videoUrlB);
                setVideoUrlB(null);
                setFileNameB(null);
              }}
              className={`${softButtonClassName} mt-3`}
            >
              Replace Video B
            </button>
          </Card>
        )}
      </main>
    );
  }

  if (focusMode) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black p-2">
        <VideoAnalysisHeader title="Compare Videos" />
        <div className="grid h-full w-full max-w-6xl grid-cols-2 gap-2">
          <VideoViewport
            videoUrl={videoUrlA!}
            videoRef={playerA.videoRef}
            annotations={annotationsA}
            activeTool={null}
            onAnnotationsChange={updateAnnotationsA}
            compact
          />
          <VideoViewport
            videoUrl={videoUrlB!}
            videoRef={playerB.videoRef}
            annotations={annotationsB}
            activeTool={null}
            onAnnotationsChange={updateAnnotationsB}
            compact
          />
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-4 pb-24">
      <VideoAnalysisHeader title="Compare Videos" />

      {!isSynced && (
        <Card className="mb-4">
          <p className="text-sm text-muted">
            Scrub each video to takeoff, set the marker, then sync both videos.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveVideo("A")}
              className={`min-h-10 rounded-xl border px-3 text-xs font-semibold transition ${
                activeVideo === "A"
                  ? segmentedSelectedClassName
                  : segmentedIdleClassName
              }`}
            >
              Edit Video A
            </button>

            <button
              type="button"
              onClick={() => setActiveVideo("B")}
              className={`min-h-10 rounded-xl border px-3 text-xs font-semibold transition ${
                activeVideo === "B"
                  ? segmentedSelectedClassName
                  : segmentedIdleClassName
              }`}
            >
              Edit Video B
            </button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <VideoViewport
            videoUrl={videoUrlA!}
            videoRef={playerA.videoRef}
            annotations={annotationsA}
            activeTool={activeTool}
            onAnnotationsChange={updateAnnotationsA}
            label="Video A"
            compact
          />

          {!isSynced && (
            <button
              type="button"
              onClick={() => setTakeoffFrameA(playerA.currentFrame)}
              className={`${softButtonClassName} min-h-11`}
            >
              {takeoffFrameA === null
                ? "Set Takeoff"
                : `Takeoff: Frame ${takeoffFrameA}`}
            </button>
          )}
        </div>

        <div className="space-y-2">
          <VideoViewport
            videoUrl={videoUrlB!}
            videoRef={playerB.videoRef}
            annotations={annotationsB}
            activeTool={activeTool}
            onAnnotationsChange={updateAnnotationsB}
            label="Video B"
            compact
          />

          {!isSynced && (
            <button
              type="button"
              onClick={() => setTakeoffFrameB(playerB.currentFrame)}
              className={`${softButtonClassName} min-h-11`}
            >
              {takeoffFrameB === null
                ? "Set Takeoff"
                : `Takeoff: Frame ${takeoffFrameB}`}
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-4 rounded-2xl border border-border bg-surface p-4">
        {!isSynced && takeoffFrameA !== null && takeoffFrameB !== null && (
          <button
            type="button"
            onClick={handleSync}
            className={`${primaryButtonClassName} min-h-12`}
          >
            Sync Videos
          </button>
        )}

        {isSynced && (
          <p className="text-sm font-medium text-accent-text">
            Synced at takeoff — frame 0 = takeoff for both videos
          </p>
        )}

        <VideoTimeline
          currentFrame={timelineFrame}
          totalFrames={timelineTotal}
          onScrubStart={handleScrubStart}
          onScrub={handleScrub}
          onScrubEnd={handleScrubEnd}
          label={isSynced ? "Synced Timeline" : "Timeline"}
          syncLabel={
            isSynced
              ? `Frame ${syncOffset} (takeoff = 0)`
              : undefined
          }
        />

        <VideoPlaybackControls
          isPlaying={
            isSynced
              ? playerA.isPlaying || playerB.isPlaying
              : activePlayer.isPlaying
          }
          onTogglePlay={() => void handleTogglePlay()}
          onStepBack={() => handleStep(-1)}
          onStepForward={() => handleStep(1)}
          onJumpBack={() => handleStep(-5)}
          onJumpForward={() => handleStep(5)}
        />

        <VideoAnnotationToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          onUndo={handleUndo}
          onClearAll={() => {
            setAnnotationsA([]);
            setAnnotationsB([]);
          }}
          canUndo={annotationsA.length > 0 || annotationsB.length > 0}
          canClear={annotationsA.length > 0 || annotationsB.length > 0}
        />
      </div>
    </main>
  );
}
