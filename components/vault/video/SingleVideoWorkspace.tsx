"use client";

import { useCallback, useEffect, useState } from "react";
import VideoAnalysisHeader from "@/components/vault/video/VideoAnalysisHeader";
import VideoAnnotationToolbar from "@/components/vault/video/VideoAnnotationToolbar";
import VideoPlaybackControls from "@/components/vault/video/VideoPlaybackControls";
import VideoTimeline from "@/components/vault/video/VideoTimeline";
import VideoUploadZone from "@/components/vault/video/VideoUploadZone";
import VideoViewport from "@/components/vault/video/VideoViewport";
import { useVideoFocusMode } from "@/components/vault/video/VideoFocusModeContext";
import type { AnnotationTool, VideoAnnotation } from "@/lib/domain/videoAnalysis";
import {
  createVideoObjectUrl,
  revokeVideoObjectUrl,
} from "@/lib/domain/videoAnalysis";
import { useVideoPlayer } from "@/lib/hooks/useVideoPlayer";

export default function SingleVideoWorkspace() {
  const { focusMode, setFocusMode } = useVideoFocusMode();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<VideoAnnotation[]>([]);
  const [activeTool, setActiveTool] = useState<AnnotationTool | null>(null);

  const player = useVideoPlayer();

  useEffect(() => {
    return () => {
      setFocusMode(false);
    };
  }, [setFocusMode]);

  useEffect(() => {
    return () => {
      revokeVideoObjectUrl(videoUrl);
    };
  }, [videoUrl]);

  const handleUpload = useCallback((file: File) => {
    revokeVideoObjectUrl(videoUrl);
    setVideoUrl(createVideoObjectUrl(file));
    setFileName(file.name);
    setAnnotations([]);
    setActiveTool(null);
  }, [videoUrl]);

  const handleUndo = useCallback(() => {
    setAnnotations((current) => current.slice(0, -1));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!videoUrl || focusMode) {
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
  }, [focusMode, player, videoUrl]);

  if (!videoUrl) {
    return (
      <main className="mx-auto max-w-md p-4 pb-20">
        <VideoAnalysisHeader title="Single Video" showFocusToggle={false} />
        <VideoUploadZone
          label="Upload a vault video to review frame-by-frame."
          onFileSelected={handleUpload}
        />
      </main>
    );
  }

  if (focusMode) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black p-2">
        <VideoAnalysisHeader title="Single Video" />
        <div className="h-full w-full max-w-5xl">
          <VideoViewport
            videoUrl={videoUrl}
            videoRef={player.videoRef}
            annotations={annotations}
            activeTool={null}
            onAnnotationsChange={setAnnotations}
          />
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-4 pb-24">
      <VideoAnalysisHeader title="Single Video" />

      {fileName && (
        <p className="mb-3 truncate text-sm text-muted">{fileName}</p>
      )}

      <VideoViewport
        videoUrl={videoUrl}
        videoRef={player.videoRef}
        annotations={annotations}
        activeTool={activeTool}
        onAnnotationsChange={setAnnotations}
      />

      <div className="mt-4 space-y-4 rounded-2xl border border-border bg-surface p-4">
        <VideoTimeline
          currentFrame={player.currentFrame}
          totalFrames={player.totalFrames}
          onScrubStart={player.beginScrub}
          onScrub={player.scrubToFrame}
          onScrubEnd={player.endScrub}
        />

        <VideoPlaybackControls
          isPlaying={player.isPlaying}
          onTogglePlay={() => void player.togglePlay()}
          onStepBack={() => player.stepFrames(-1)}
          onStepForward={() => player.stepFrames(1)}
          onJumpBack={() => player.stepFrames(-5)}
          onJumpForward={() => player.stepFrames(5)}
        />

        <VideoAnnotationToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          onUndo={handleUndo}
          onClearAll={() => setAnnotations([])}
          canUndo={annotations.length > 0}
          canClear={annotations.length > 0}
        />
      </div>
    </main>
  );
}
