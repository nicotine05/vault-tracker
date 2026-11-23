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

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(`${label} timed out`));
    }, ms);

    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      }
    );
  });
}

/**
 * Capture a small JPEG poster from a video blob.
 * Never hangs forever — times out and returns a placeholder on iOS decode stalls.
 */
export async function createVideoThumbnail(
  blob: Blob
): Promise<{ thumbnailBlob?: Blob; duration: number }> {
  const objectUrl = URL.createObjectURL(blob);
  const video = document.createElement("video");

  try {
    video.preload = "auto";
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.src = objectUrl;

    await withTimeout(
      new Promise<void>((resolve, reject) => {
        const succeed = () => resolve();
        const fail = () => reject(new Error("Could not load video"));

        if (video.readyState >= 2) {
          succeed();
          return;
        }

        video.addEventListener("loadeddata", succeed, { once: true });
        video.addEventListener("loadedmetadata", () => {
          // Metadata alone is enough to know duration; keep waiting for data briefly.
        });
        video.addEventListener("error", fail, { once: true });
        try {
          video.load();
        } catch {
          // ignore
        }
      }),
      8000,
      "Video load"
    );

    // Force a decoded frame on stubborn iOS HEVC/MOV clips.
    try {
      await withTimeout(video.play().then(() => undefined), 2500, "Video play");
      video.pause();
    } catch {
      // Autoplay/decode may fail — continue with whatever frame we have.
      try {
        video.pause();
      } catch {
        // ignore
      }
    }

    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const seekTime =
      duration > 0 ? Math.min(0.25, Math.max(0.05, duration * 0.04)) : 0;

    if (seekTime > 0) {
      try {
        await withTimeout(
          new Promise<void>((resolve) => {
            const done = () => resolve();
            video.addEventListener("seeked", done, { once: true });
            try {
              video.currentTime = seekTime;
            } catch {
              resolve();
            }
          }),
          3000,
          "Video seek"
        );
      } catch {
        // Keep current frame.
      }
    }

    if (video.videoWidth <= 0 || video.videoHeight <= 0) {
      return { duration };
    }

    const canvas = document.createElement("canvas");
    const maxWidth = 480;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return { duration };
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const thumbnailBlob = await withTimeout(
      new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result && result.size > 0) {
              resolve(result);
              return;
            }
            reject(new Error("Thumbnail encode failed"));
          },
          "image/jpeg",
          0.7
        );
      }),
      4000,
      "Thumbnail encode"
    );

    return { thumbnailBlob, duration };
  } catch (error) {
    console.warn("Video thumbnail skipped:", error);
    return { duration: 0 };
  } finally {
    try {
      video.removeAttribute("src");
      video.load();
    } catch {
      // ignore
    }
    URL.revokeObjectURL(objectUrl);
  }
}

export { withTimeout };
