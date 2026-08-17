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
  onFrameChange?: (frame: number) => void;
};

export function useVideoPlayer(options: UseVideoPlayerOptions = {}) {
  const fps = options.fps ?? DEFAULT_FPS;
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

    try {
      video.muted = true;
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
    },
    [duration],
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
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const onTimeUpdate = () => {
      if (!isScrubbingRef.current) {
        syncTimeFromVideo();
      }
    };

    const onSeeking = () => {
      if (isScrubbingRef.current) {
        setCurrentTime(video.currentTime);
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

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("seeking", onSeeking);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("seeking", onSeeking);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [handleLoadedMetadata, syncTimeFromVideo]);

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
