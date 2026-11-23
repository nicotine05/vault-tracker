"use client";

import { useEffect, useState } from "react";
import { seekToTime } from "@/lib/domain/videoAnalysis";

const THUMBNAIL_COUNT = 18;

async function waitForSeek(video: HTMLVideoElement, time: number) {
  const target = Math.max(
    0,
    Math.min(Number.isFinite(video.duration) ? video.duration : time, time),
  );

  if (Math.abs(video.currentTime - target) < 0.001) {
    return;
  }

  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      video.removeEventListener("seeked", finish);
      resolve();
    };

    video.addEventListener("seeked", finish);
    seekToTime(video, target, { smooth: true });

    // iOS can miss seeked for near-zero seeks — failsafe.
    window.setTimeout(finish, 400);
  });

  // Give Safari a beat to paint the frame before canvas capture.
  await new Promise<void>((resolve) => {
    if (typeof video.requestVideoFrameCallback === "function") {
      video.requestVideoFrameCallback(() => resolve());
      return;
    }
    window.setTimeout(() => resolve(), 32);
  });
}

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
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.preload = "auto";

    const generate = async () => {
      setIsGenerating(true);
      setThumbnails([]);

      await new Promise<void>((resolve) => {
        if (video.readyState >= 2) {
          resolve();
          return;
        }

        const onReady = () => resolve();
        video.addEventListener("loadeddata", onReady, { once: true });
        video.addEventListener("error", onReady, { once: true });
      });

      if (
        cancelled ||
        !Number.isFinite(video.duration) ||
        video.duration <= 0
      ) {
        setIsGenerating(false);
        return;
      }

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) {
        setIsGenerating(false);
        return;
      }

      const sourceWidth = video.videoWidth || 320;
      const sourceHeight = video.videoHeight || 180;
      const maxWidth = 160;
      const scale = Math.min(1, maxWidth / sourceWidth);
      canvas.width = Math.max(1, Math.round(sourceWidth * scale));
      canvas.height = Math.max(1, Math.round(sourceHeight * scale));

      const frames: string[] = [];
      const count = THUMBNAIL_COUNT;
      // Avoid exact 0.0 — iOS often returns a black first frame.
      const startPad = Math.min(0.04, video.duration * 0.01);
      const endPad = Math.min(0.04, video.duration * 0.01);

      for (let index = 0; index < count; index += 1) {
        if (cancelled) {
          break;
        }

        const ratio = count <= 1 ? 0 : index / (count - 1);
        const time =
          startPad + ratio * Math.max(0, video.duration - startPad - endPad);

        await waitForSeek(video, time);

        if (cancelled) {
          break;
        }

        context.fillStyle = "#111";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL("image/jpeg", 0.72));

        if (!cancelled && (frames.length === 1 || frames.length % 3 === 0)) {
          setThumbnails([...frames]);
        }
      }

      if (!cancelled) {
        setThumbnails(frames);
      }

      setIsGenerating(false);
    };

    void generate();

    return () => {
      cancelled = true;
      video.removeAttribute("src");
      video.load();
    };
  }, [videoUrl]);

  return { thumbnails, isGenerating };
}
