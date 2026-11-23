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
  type VideoClipMeta,
  type VideoClipRecord,
} from "@/lib/storage/videoLibraryStore";

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

    const { thumbnailBlob, duration } = await createVideoThumbnail(file);
    const record: VideoClipRecord = {
      id: createClipId(),
      name: file.name.replace(/\.[^.]+$/, "") || "Vault clip",
      createdAt: new Date().toISOString(),
      duration,
      mimeType: file.type || "video/mp4",
      size: file.size,
      blob: file,
      thumbnailBlob,
      annotations: [],
    };

    await saveVideoClip(record);
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
