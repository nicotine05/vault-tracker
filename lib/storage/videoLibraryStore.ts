import type { VideoAnnotation } from "@/lib/domain/videoAnalysis";

const DB_NAME = "vault-tracker-video-library";
const DB_VERSION = 1;
const CLIP_STORE = "clips";

export type VideoClipMeta = {
  id: string;
  name: string;
  createdAt: string;
  duration: number;
  mimeType: string;
  size: number;
};

export type VideoClipRecord = VideoClipMeta & {
  blob: Blob;
  thumbnailBlob?: Blob;
  annotations: VideoAnnotation[];
};

export const VIDEO_LIBRARY_CHANGED = "vaultTracker:videoLibraryChanged";

function notifyLibraryChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(VIDEO_LIBRARY_CHANGED));
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CLIP_STORE)) {
        const store = db.createObjectStore(CLIP_STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Failed to open video library"));
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

export async function listVideoClips(): Promise<VideoClipMeta[]> {
  const db = await openDb();
  try {
    const tx = db.transaction(CLIP_STORE, "readonly");
    const store = tx.objectStore(CLIP_STORE);
    const rows = await requestToPromise(store.getAll());
    return (rows as VideoClipRecord[])
      .map((row) => ({
        id: row.id,
        name: row.name,
        createdAt: row.createdAt,
        duration: row.duration ?? 0,
        mimeType: row.mimeType,
        size: row.size ?? row.blob?.size ?? 0,
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } finally {
    db.close();
  }
}

export async function getVideoClip(
  id: string
): Promise<VideoClipRecord | null> {
  const db = await openDb();
  try {
    const tx = db.transaction(CLIP_STORE, "readonly");
    const store = tx.objectStore(CLIP_STORE);
    const row = await requestToPromise(store.get(id));
    return (row as VideoClipRecord | undefined) ?? null;
  } finally {
    db.close();
  }
}

export async function saveVideoClip(record: VideoClipRecord): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(CLIP_STORE, "readwrite");
    const store = tx.objectStore(CLIP_STORE);
    await requestToPromise(store.put(record));
  } finally {
    db.close();
  }
  notifyLibraryChanged();
}

export async function updateClipAnnotations(
  id: string,
  annotations: VideoAnnotation[]
): Promise<void> {
  const clip = await getVideoClip(id);
  if (!clip) {
    return;
  }

  await saveVideoClip({ ...clip, annotations });
}

export async function deleteVideoClip(id: string): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(CLIP_STORE, "readwrite");
    const store = tx.objectStore(CLIP_STORE);
    await requestToPromise(store.delete(id));
  } finally {
    db.close();
  }
  notifyLibraryChanged();
}

export async function getClipThumbnailUrl(
  id: string
): Promise<string | null> {
  const clip = await getVideoClip(id);
  if (!clip?.thumbnailBlob) {
    return null;
  }
  return URL.createObjectURL(clip.thumbnailBlob);
}

export function createClipId(): string {
  return `clip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function subscribeVideoLibrary(listener: () => void): () => void {
  const handler = () => listener();
  window.addEventListener(VIDEO_LIBRARY_CHANGED, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(VIDEO_LIBRARY_CHANGED, handler);
    window.removeEventListener("storage", handler);
  };
}

/** Capture a small JPEG poster from a video blob. */
export async function createVideoThumbnail(
  blob: Blob
): Promise<{ thumbnailBlob: Blob; duration: number }> {
  const objectUrl = URL.createObjectURL(blob);

  try {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error("Could not load video"));
    });

    const seekTime = Number.isFinite(video.duration)
      ? Math.min(0.2, Math.max(0, video.duration * 0.05))
      : 0;

    if (seekTime > 0) {
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
        video.currentTime = seekTime;
      });
    }

    const canvas = document.createElement("canvas");
    const maxWidth = 480;
    const scale =
      video.videoWidth > 0 ? Math.min(1, maxWidth / video.videoWidth) : 1;
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return {
        thumbnailBlob: blob.slice(0, 1, "image/jpeg"),
        duration: video.duration || 0,
      };
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const thumbnailBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) {
            resolve(result);
            return;
          }
          reject(new Error("Thumbnail encode failed"));
        },
        "image/jpeg",
        0.72
      );
    });

    return {
      thumbnailBlob,
      duration: Number.isFinite(video.duration) ? video.duration : 0,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
