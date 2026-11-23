"use client";

import { useCallback, useEffect, useState } from "react";
import { isVideoFile } from "@/lib/domain/videoAnalysis";
import {
  createClipId,
  createVideoThumbnail,
  deleteVideoClip,
  getVideoClip,
  listVideoClips,
  saveVideoClip,
  subscribeVideoLibrary,
  withTimeout,
  type VideoClipMeta,
  type VideoClipRecord,
} from "@/lib/storage/videoLibraryStore";

function friendlyImportError(error: unknown): string {
  if (error instanceof DOMException && error.name === "QuotaExceededError") {
    return "Not enough on-device storage for this clip. Delete older clips and try again.";
  }

  if (error instanceof Error) {
    if (/timed out/i.test(error.message)) {
      return "Import took too long on this clip. Try a shorter export or re-pick from Photos.";
    }
    return error.message;
  }

  return "Could not import video.";
}

function clipDisplayName(file: File): string {
  const raw = file.name.replace(/\.[^.]+$/, "").trim();
  if (!raw) {
    return "Vault clip";
  }

  // iOS Photos sometimes hands us opaque asset ids — keep a short friendly label.
  if (/^[a-f0-9-]{16,}$/i.test(raw)) {
    return "Vault clip";
  }

  return raw;
}

export function useVideoLibrary() {
  const [clips, setClips] = useState<VideoClipMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await listVideoClips();
      setClips(next);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Could not load video library.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    return subscribeVideoLibrary(() => {
      void refresh();
    });
  }, [refresh]);

  const importFile = useCallback(async (file: File) => {
    if (!isVideoFile(file)) {
      throw new Error("Choose a video file (mp4, mov, webm).");
    }

    // Thumbnail capture is best-effort. Some iPhone HEVC/MOV clips stall
    // forever in Safari — never block the import on that.
    let thumbnailBlob: Blob | undefined;
    let duration = 0;

    try {
      const thumb = await withTimeout(
        createVideoThumbnail(file),
        12000,
        "Thumbnail"
      );
      thumbnailBlob = thumb.thumbnailBlob;
      duration = thumb.duration;
    } catch (error) {
      console.warn("Skipping thumbnail during import:", error);
    }

    const record: VideoClipRecord = {
      id: createClipId(),
      name: clipDisplayName(file),
      createdAt: new Date().toISOString(),
      duration,
      mimeType: file.type || "video/mp4",
      size: file.size,
      blob: file,
      thumbnailBlob,
      annotations: [],
    };

    try {
      await withTimeout(saveVideoClip(record), 45000, "Save clip");
    } catch (error) {
      throw new Error(friendlyImportError(error));
    }

    return record;
  }, []);

  const removeClip = useCallback(async (id: string) => {
    await deleteVideoClip(id);
  }, []);

  const loadClip = useCallback(async (id: string) => {
    return getVideoClip(id);
  }, []);

  return {
    clips,
    loading,
    error,
    refresh,
    importFile,
    removeClip,
    loadClip,
  };
}
