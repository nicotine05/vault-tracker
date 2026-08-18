"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_FPS,
  getTotalFrames,
  seekToTime,
  stepVideoFrames,
  timeToFrame,
} from "@/lib/domain/videoAnalysis";

type UseVideoPlayerOptions = {
  fps?: number;
  videoUrl?: string | null;
  onFrameChange?: (frame: number) => void;
};

export function useVideoPlayer(options: UseVideoPlayerOptions = {}) {
  const fps = options.fps ?? DEFAULT_FPS;
  const videoUrl = options.videoUrl ?? null;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const isScrubbingRef = useRef(false);
  const wasPlayingBeforeScrub = useRef(false);

  const syncTimeFromVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const time = video.currentTime;
    const frame = timeToFrame(time, fps);
    setCurrentTime(time);
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
    syncTimeFromVideo();
  }, [fps, syncTimeFromVideo]);

  const play = useCallback(async () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.muted = true;
    video.playsInline = true;

    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      await new Promise<void>((resolve) => {
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          resolve();
          return;
        }

        video.addEventListener("loadeddata", () => resolve(), { once: true });
      });
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
    syncTimeFromVideo();
  }, [syncTimeFromVideo]);

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
      setCurrentTime(video.currentTime);
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
      setCurrentTime(video.currentTime);
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
    isScrubbingRef.current = true;
    setIsScrubbing(true);
  }, [isPlaying]);

  const scrubToTime = useCallback(
    (time: number) => {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      const max = duration || video.duration || 0;
      const clamped = Math.max(0, Math.min(max, time));

      video.pause();
      setIsPlaying(false);
      seekToTime(video, clamped, { smooth: isScrubbingRef.current });
      setCurrentTime(clamped);
      setCurrentFrame(timeToFrame(clamped, fps));
    },
    [duration, fps],
  );

  const scrubToFrame = useCallback(
    (frame: number) => {
      scrubToTime(frame / fps);
    },
    [fps, scrubToTime],
  );

  const endScrub = useCallback(() => {
    isScrubbingRef.current = false;
    setIsScrubbing(false);
    syncTimeFromVideo();
  }, [syncTimeFromVideo]);

  useEffect(() => {
    if (!videoUrl) {
      return;
    }

    let activeVideo: HTMLVideoElement | null = null;
    let rafId = 0;
    let cancelled = false;

    const onTimeUpdate = () => {
      if (!isScrubbingRef.current) {
        syncTimeFromVideo();
      }
    };

    const onSeeking = () => {
      if (isScrubbingRef.current && activeVideo) {
        const time = activeVideo.currentTime;
        setCurrentTime(time);
        setCurrentFrame(timeToFrame(time, fps));
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      setIsPlaying(false);
      if (!isScrubbingRef.current) {
        syncTimeFromVideo();
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      syncTimeFromVideo();
    };

    const attachListeners = (element: HTMLVideoElement) => {
      element.addEventListener("timeupdate", onTimeUpdate);
      element.addEventListener("seeking", onSeeking);
      element.addEventListener("play", onPlay);
      element.addEventListener("pause", onPause);
      element.addEventListener("ended", onEnded);
      element.addEventListener("loadedmetadata", handleLoadedMetadata);
    };

    const detachListeners = (element: HTMLVideoElement) => {
      element.removeEventListener("timeupdate", onTimeUpdate);
      element.removeEventListener("seeking", onSeeking);
      element.removeEventListener("play", onPlay);
      element.removeEventListener("pause", onPause);
      element.removeEventListener("ended", onEnded);
      element.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };

    const bindVideo = () => {
      const video = videoRef.current;
      if (!video) {
        return false;
      }

      if (video !== activeVideo) {
        if (activeVideo) {
          detachListeners(activeVideo);
        }

        activeVideo = video;
        attachListeners(activeVideo);
      }

      if (activeVideo.readyState >= 1) {
        handleLoadedMetadata();
      }

      return true;
    };

    const tryBind = () => {
      if (cancelled) {
        return;
      }

      if (!bindVideo()) {
        rafId = requestAnimationFrame(tryBind);
      }
    };

    tryBind();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);

      if (activeVideo) {
        detachListeners(activeVideo);
      }
    };
  }, [videoUrl, fps, handleLoadedMetadata, syncTimeFromVideo]);

  return {
    videoRef,
    isPlaying,
    currentFrame,
    currentTime,
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
    scrubToTime,
    endScrub,
    syncFrameFromVideo: syncTimeFromVideo,
    syncTimeFromVideo,
  };
}
