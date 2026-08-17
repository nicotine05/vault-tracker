"use client";

import { useEffect, useState } from "react";
import { seekToTime } from "@/lib/domain/videoAnalysis";

const THUMBNAIL_COUNT = 14;

export function useFilmstripThumbnails(videoUrl: string | null) {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!videoUrl) {
      setThumbnails([]);
      return;
    }

    let cancelled = false;
    const video = document.createElement("video");
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    const generate = async () => {
      setIsGenerating(true);

      await new Promise<void>((resolve) => {
        if (video.readyState >= 1) {
          resolve();
          return;
        }

        video.addEventListener("loadedmetadata", () => resolve(), { once: true });
      });

      if (cancelled || !Number.isFinite(video.duration) || video.duration <= 0) {
        setIsGenerating(false);
        return;
      }

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        setIsGenerating(false);
        return;
      }

      canvas.width = 96;
      canvas.height = 54;
      const frames: string[] = [];

      for (let index = 0; index < THUMBNAIL_COUNT; index += 1) {
        if (cancelled) {
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

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL("image/jpeg", 0.65));
      }

      if (!cancelled) {
        setThumbnails(frames);
      }

      setIsGenerating(false);
    };

    void generate();

    return () => {
      cancelled = true;
      video.src = "";
    };
  }, [videoUrl]);

  return { thumbnails, isGenerating };
}
