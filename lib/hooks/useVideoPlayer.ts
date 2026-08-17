"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_FPS,
  getTotalFrames,
  stepVideoFrames,
  timeToFrame,
} from "@/lib/domain/videoAnalysis";

type UseVideoPlayerOptions = {
  fps?: number;
  onFrameChange?: (frame: number) => void;
};

export function useVideoPlayer(options: UseVideoPlayerOptions = {}) {
  const fps = options.fps ?? DEFAULT_FPS;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const wasPlayingBeforeScrub = useRef(false);

  const syncFrameFromVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const frame = timeToFrame(video.currentTime, fps);
    setCurrentFrame(frame);
    options.onFrameChange?.(frame);
  }, [fps, options.onFrameChange]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    setDuration(video.duration);
    setTotalFrames(getTotalFrames(video.duration, fps));
    syncFrameFromVideo();
  }, [fps, syncFrameFromVideo]);

  const play = useCallback(async () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    try {
      await video.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }, []);

  const pause = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.pause();
    setIsPlaying(false);
    syncFrameFromVideo();
  }, [syncFrameFromVideo]);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      pause();
      return;
    }

    await play();
  }, [isPlaying, pause, play]);

  const seekToFrame = useCallback(
    (frame: number) => {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      video.pause();
      setIsPlaying(false);
      const next = stepVideoFrames(video, frame - timeToFrame(video.currentTime, fps), fps);
      setCurrentFrame(next);
      options.onFrameChange?.(next);
    },
    [fps, options.onFrameChange],
  );

  const stepFrames = useCallback(
    (delta: number) => {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      video.pause();
      setIsPlaying(false);
      const next = stepVideoFrames(video, delta, fps);
      setCurrentFrame(next);
      options.onFrameChange?.(next);
    },
    [fps, options.onFrameChange],
  );

  const beginScrub = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    wasPlayingBeforeScrub.current = isPlaying;
    video.pause();
    setIsPlaying(false);
    setIsScrubbing(true);
  }, [isPlaying]);

  const scrubToFrame = useCallback(
    (frame: number) => {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      video.pause();
      setIsPlaying(false);
      const clamped = Math.max(0, Math.min(totalFrames, frame));
      video.currentTime = clamped / fps;
      setCurrentFrame(clamped);
      options.onFrameChange?.(clamped);
    },
    [fps, options.onFrameChange, totalFrames],
  );

  const endScrub = useCallback(() => {
    setIsScrubbing(false);
    syncFrameFromVideo();
  }, [syncFrameFromVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const onTimeUpdate = () => {
      if (!isScrubbing) {
        syncFrameFromVideo();
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      setIsPlaying(false);
      syncFrameFromVideo();
    };
    const onEnded = () => {
      setIsPlaying(false);
      syncFrameFromVideo();
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [handleLoadedMetadata, isScrubbing, syncFrameFromVideo]);

  return {
    videoRef,
    isPlaying,
    currentFrame,
    totalFrames,
    duration,
    fps,
    isScrubbing,
    play,
    pause,
    togglePlay,
    seekToFrame,
    stepFrames,
    beginScrub,
    scrubToFrame,
    endScrub,
    syncFrameFromVideo,
  };
}
