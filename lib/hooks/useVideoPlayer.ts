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
  const [isMuted, setIsMuted] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const isScrubbingRef = useRef(false);
  const fpsRef = useRef(fps);
  const onFrameChangeRef = useRef(options.onFrameChange);

  fpsRef.current = fps;
  onFrameChangeRef.current = options.onFrameChange;

  const syncTimeFromVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const time = video.currentTime;
    const frame = timeToFrame(time, fpsRef.current);
    setCurrentTime(time);
    setCurrentFrame(frame);
    onFrameChangeRef.current?.(frame);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    setDuration(video.duration);
    setTotalFrames(getTotalFrames(video.duration, fpsRef.current));
    syncTimeFromVideo();
  }, [syncTimeFromVideo]);

  /** Force Safari/iOS to paint the first frame (avoids black poster until reload). */
  const primeFirstFrame = useCallback(async (video: HTMLVideoElement) => {
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, ms);
      });

    const waitForEvent = (type: string, ms: number) =>
      new Promise<void>((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) {
            return;
          }
          settled = true;
          video.removeEventListener(type, finish);
          resolve();
        };
        video.addEventListener(type, finish);
        window.setTimeout(finish, ms);
      });

    try {
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        await waitForEvent("loadeddata", 2000);
      }

      try {
        await video.play();
        video.pause();
      } catch {
        try {
          video.pause();
        } catch {
          // ignore
        }
      }

      // Nudge off exact 0 — iOS often keeps a black frame at t=0 until seek.
      const nudge =
        Number.isFinite(video.duration) && video.duration > 0
          ? Math.min(0.04, video.duration * 0.01)
          : 0.04;

      if (nudge > 0) {
        video.currentTime = nudge;
        await waitForEvent("seeked", 800);
        await wait(16);
        video.currentTime = 0;
        await waitForEvent("seeked", 800);
      }

      syncTimeFromVideo();
    } catch (error) {
      console.warn("First-frame prime failed:", error);
    }
  }, [syncTimeFromVideo]);

  const play = useCallback(async () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.muted = isMuted;

    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      await new Promise<void>((resolve) => {
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          resolve();
          return;
        }

        video.addEventListener("loadeddata", () => resolve(), { once: true });
      });
    }

    const ended =
      video.ended ||
      (Number.isFinite(video.duration) &&
        video.duration > 0 &&
        video.currentTime >= video.duration - 0.05);

    if (ended) {
      video.currentTime = 0;
      setCurrentTime(0);
      setCurrentFrame(0);
    }

    try {
      await video.play();
      setIsPlaying(true);
    } catch {
      // Autoplay with sound often fails — retry muted once.
      if (!video.muted) {
        video.muted = true;
        setIsMuted(true);
        try {
          await video.play();
          setIsPlaying(true);
          return;
        } catch {
          setIsPlaying(false);
          return;
        }
      }
      setIsPlaying(false);
    }
  }, [isMuted]);

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

  const setMuted = useCallback((muted: boolean) => {
    const video = videoRef.current;
    setIsMuted(muted);
    if (video) {
      video.muted = muted;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(!isMuted);
  }, [isMuted, setMuted]);

  const seekToFrame = useCallback(
    (frame: number) => {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      video.pause();
      setIsPlaying(false);
      const next = stepVideoFrames(
        video,
        frame - timeToFrame(video.currentTime, fpsRef.current),
        fpsRef.current,
      );
      setCurrentFrame(next);
      setCurrentTime(video.currentTime);
      onFrameChangeRef.current?.(next);
    },
    [],
  );

  const stepFrames = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.pause();
    setIsPlaying(false);
    const next = stepVideoFrames(video, delta, fpsRef.current);
    setCurrentFrame(next);
    setCurrentTime(video.currentTime);
    onFrameChangeRef.current?.(next);
  }, []);

  const beginScrub = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.pause();
    setIsPlaying(false);
    isScrubbingRef.current = true;
    setIsScrubbing(true);
  }, []);

  const scrubToTime = useCallback((time: number) => {
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
    setCurrentFrame(timeToFrame(clamped, fpsRef.current));
  }, [duration]);

  const scrubToFrame = useCallback(
    (frame: number) => {
      scrubToTime(frame / fpsRef.current);
    },
    [scrubToTime],
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
        setCurrentFrame(timeToFrame(time, fpsRef.current));
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

    let primedFor: HTMLVideoElement | null = null;

    const attachListeners = (element: HTMLVideoElement) => {
      element.muted = true;
      element.addEventListener("timeupdate", onTimeUpdate);
      element.addEventListener("seeking", onSeeking);
      element.addEventListener("play", onPlay);
      element.addEventListener("pause", onPause);
      element.addEventListener("ended", onEnded);
      element.addEventListener("loadedmetadata", handleLoadedMetadata);
      element.addEventListener("loadeddata", onLoadedData);
    };

    const onLoadedData = () => {
      handleLoadedMetadata();
      if (activeVideo && primedFor !== activeVideo && !cancelled) {
        primedFor = activeVideo;
        void primeFirstFrame(activeVideo);
      }
    };

    const detachListeners = (element: HTMLVideoElement) => {
      element.removeEventListener("timeupdate", onTimeUpdate);
      element.removeEventListener("seeking", onSeeking);
      element.removeEventListener("play", onPlay);
      element.removeEventListener("pause", onPause);
      element.removeEventListener("ended", onEnded);
      element.removeEventListener("loadedmetadata", handleLoadedMetadata);
      element.removeEventListener("loadeddata", onLoadedData);
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
        setIsMuted(true);
        setIsPlaying(false);
        setCurrentFrame(0);
        setCurrentTime(0);
        primedFor = null;
        try {
          video.load();
        } catch {
          // ignore
        }
      }

      if (activeVideo.readyState >= 1) {
        handleLoadedMetadata();
      }

      if (
        activeVideo.readyState >= 2 &&
        primedFor !== activeVideo &&
        !cancelled
      ) {
        primedFor = activeVideo;
        void primeFirstFrame(activeVideo);
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
  }, [videoUrl, handleLoadedMetadata, primeFirstFrame, syncTimeFromVideo]);

  useEffect(() => {
    setTotalFrames(getTotalFrames(duration, fps));
  }, [duration, fps]);

  return {
    videoRef,
    isPlaying,
    currentFrame,
    currentTime,
    totalFrames,
    duration,
    fps,
    isMuted,
    isScrubbing,
    play,
    pause,
    togglePlay,
    setMuted,
    toggleMute,
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
