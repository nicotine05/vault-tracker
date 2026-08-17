"use client";

import { useEffect, useState, type RefObject } from "react";
import { seekToTime } from "@/lib/domain/videoAnalysis";

const THUMBNAIL_COUNT = 14;

async function waitForVideoElement(
  videoRef: RefObject<HTMLVideoElement | null>,
  isCancelled: () => boolean,
): Promise<HTMLVideoElement | null> {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (isCancelled()) {
      return null;
    }

    const video = videoRef.current;
    if (video) {
      if (video.readyState >= 1) {
        return video;
      }

      await new Promise<void>((resolve) => {
        video.addEventListener("loadedmetadata", () => resolve(), { once: true });
      });

      return video;
    }

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }

  return null;
}

export function useFilmstripThumbnails(
  videoUrl: string | null,
  sourceVideoRef?: RefObject<HTMLVideoElement | null>,
) {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!videoUrl) {
      setThumbnails([]);
      return;
    }

    let cancelled = false;
    const isCancelled = () => cancelled;

    const ownedVideo = sourceVideoRef ? null : document.createElement("video");
    if (ownedVideo) {
      ownedVideo.src = videoUrl;
      ownedVideo.muted = true;
      ownedVideo.playsInline = true;
      ownedVideo.preload = "auto";
    }

    const generate = async () => {
      setIsGenerating(true);

      const video = sourceVideoRef
        ? await waitForVideoElement(sourceVideoRef, isCancelled)
        : ownedVideo;

      if (
        !video ||
        isCancelled() ||
        !Number.isFinite(video.duration) ||
        video.duration <= 0
      ) {
        setIsGenerating(false);
        return;
      }

      const savedTime = video.currentTime;
      const wasPaused = video.paused;

      const onPlay = () => {
        cancelled = true;
      };

      if (sourceVideoRef) {
        video.addEventListener("play", onPlay);
      }

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        if (sourceVideoRef) {
          video.removeEventListener("play", onPlay);
        }
        setIsGenerating(false);
        return;
      }

      canvas.width = 96;
      canvas.height = 54;
      const frames: string[] = [];

      for (let index = 0; index < THUMBNAIL_COUNT; index += 1) {
        if (isCancelled()) {
          break;
        }

        const time =
          (index / Math.max(THUMBNAIL_COUNT - 1, 1)) * video.duration;

        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener("seeked", onSeeked);
            resolve();
          };

          video.addEventListener("seeked", onSeeked);
          seekToTime(video, time);
        });

        if (isCancelled()) {
          break;
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL("image/jpeg", 0.65));
      }

      if (sourceVideoRef) {
        video.removeEventListener("play", onPlay);
      }

      if (!isCancelled()) {
        setThumbnails(frames);
      }

      if (sourceVideoRef && !isCancelled()) {
        seekToTime(video, savedTime);
        if (!wasPaused) {
          video.muted = true;
          void video.play();
        }
      }

      setIsGenerating(false);
    };

    void generate();

    return () => {
      cancelled = true;
      if (ownedVideo) {
        ownedVideo.src = "";
      }
    };
  }, [videoUrl, sourceVideoRef]);

  return { thumbnails, isGenerating };
}
