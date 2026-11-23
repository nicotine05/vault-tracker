"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useVideoLibrary } from "@/lib/hooks/useVideoLibrary";
import {
  getClipThumbnailUrl,
  type VideoClipMeta,
} from "@/lib/storage/videoLibraryStore";
import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/lib/ui/componentStyles";

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "—";
  }

  const whole = Math.floor(seconds);
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatAdded(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function ClipCard({
  clip,
  onOpen,
  onDelete,
}: {
  clip: VideoClipMeta;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    void getClipThumbnailUrl(clip.id).then((url) => {
      if (!active) {
        if (url) {
          URL.revokeObjectURL(url);
        }
        return;
      }

      objectUrl = url;
      setThumbUrl(url);
    });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [clip.id]);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="relative aspect-video bg-black/80">
          {thumbUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/50">
              Video
            </div>
          )}
          <span className="absolute bottom-2 right-2 rounded-md bg-black/65 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {formatDuration(clip.duration)}
          </span>
        </div>

        <div className="px-3 py-2.5">
          <p className="truncate text-sm font-semibold text-foreground">
            {clip.name}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Added {formatAdded(clip.createdAt)}
          </p>
        </div>
      </button>

      <div className="flex border-t border-border">
        <button
          type="button"
          onClick={onOpen}
          className="flex-1 px-3 py-2.5 text-sm font-medium text-accent-text"
        >
          Open
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex-1 border-l border-border px-3 py-2.5 text-sm text-muted"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default function VideoAnalysisLanding() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { clips, loading, error, importFile, removeClip } = useVideoLibrary();
  const [busy, setBusy] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleImport = async (file: File | null) => {
    if (!file) {
      return;
    }

    setBusy(true);
    setImportError(null);

    try {
      const record = await importFile(file);
      router.push(`/vault/video-analysis/single?id=${encodeURIComponent(record.id)}`);
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : "Could not import video.",
      );
    } finally {
      setBusy(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <main className="mx-auto max-w-md p-4 pb-20">
      <div className="mb-6">
        <Link
          href="/vault"
          className="text-sm text-accent-text transition hover:opacity-80"
        >
          ← Vault
        </Link>

        <h1 className="mt-2 text-3xl font-bold text-foreground">
          Video Analysis
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-muted">
          Import a vault clip, mark key frames, and reopen it later on this
          device.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,.mp4,.mov,.webm,.m4v"
        className="hidden"
        onChange={(event) => {
          void handleImport(event.target.files?.[0] ?? null);
        }}
      />

      <button
        type="button"
        disabled={busy}
        className={`${primaryButtonClassName} mb-3 flex min-h-14 w-full items-center justify-center text-base disabled:opacity-60`}
        onClick={() => fileInputRef.current?.click()}
      >
        {busy ? "Importing…" : "Import Video"}
      </button>

      {(importError || error) && (
        <p className="mb-4 text-sm text-red-500">{importError || error}</p>
      )}

      <section className="mt-2">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Library</h2>
          <p className="text-xs text-muted">
            {loading ? "Loading…" : `${clips.length} clip${clips.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {!loading && clips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center">
            <p className="text-sm font-medium text-foreground">No clips yet</p>
            <p className="mt-1 text-sm text-muted">
              Import a video from your camera roll to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {clips.map((clip) => (
              <ClipCard
                key={clip.id}
                clip={clip}
                onOpen={() =>
                  router.push(
                    `/vault/video-analysis/single?id=${encodeURIComponent(clip.id)}`,
                  )
                }
                onDelete={() => {
                  void removeClip(clip.id);
                }}
              />
            ))}
          </div>
        )}
      </section>

      <p className="mt-8 text-center text-xs text-muted">
        Clips stay on this device in browser storage. Clearing site data removes
        them.
      </p>

      <div className="mt-4">
        <Link href="/vault/video-analysis/compare" className="block">
          <span
            className={`${secondaryButtonClassName} flex min-h-11 items-center justify-center text-sm opacity-70`}
          >
            Compare (coming polish)
          </span>
        </Link>
      </div>
    </main>
  );
}
