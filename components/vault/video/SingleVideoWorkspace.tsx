"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import VideoPlayerShell from "@/components/vault/video/VideoPlayerShell";
import type { VideoAnnotation } from "@/lib/domain/videoAnalysis";
import { revokeVideoObjectUrl } from "@/lib/domain/videoAnalysis";
import { useVideoLibrary } from "@/lib/hooks/useVideoLibrary";
import {
  primaryButtonClassName,
  linkTextClassName,
} from "@/lib/ui/componentStyles";

type LoadedClip = {
  id: string;
  name: string;
  url: string;
  annotations: VideoAnnotation[];
};

export default function SingleVideoWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clipId = searchParams.get("id");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importFile, loadClip } = useVideoLibrary();

  const [loaded, setLoaded] = useState<LoadedClip | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "missing" | "error">(
    clipId ? "loading" : "idle",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    const run = async () => {
      if (!clipId) {
        setLoaded(null);
        setStatus("idle");
        return;
      }

      setStatus("loading");
      setMessage(null);

      try {
        const clip = await loadClip(clipId);
        if (cancelled) {
          return;
        }

        if (!clip) {
          setLoaded(null);
          setStatus("missing");
          return;
        }

        objectUrl = URL.createObjectURL(clip.blob);
        setLoaded({
          id: clip.id,
          name: clip.name,
          url: objectUrl,
          annotations: clip.annotations ?? [],
        });
        setStatus("idle");
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setLoaded(null);
          setStatus("error");
          setMessage("Could not open this clip.");
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      if (objectUrl) {
        revokeVideoObjectUrl(objectUrl);
      }
    };
  }, [clipId, loadClip]);

  const handleImport = async (file: File | null) => {
    if (!file || busy) {
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const record = await importFile(file);
      router.replace(
        `/vault/video-analysis/single?id=${encodeURIComponent(record.id)}`,
      );
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error ? error.message : "Could not import video.",
      );
    } finally {
      setBusy(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (loaded) {
    return (
      <VideoPlayerShell
        videoUrl={loaded.url}
        title={loaded.name}
        clipId={loaded.id}
        initialAnnotations={loaded.annotations}
        backHref="/vault/video-analysis"
      />
    );
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-20">
      <Link href="/vault/video-analysis" className={linkTextClassName}>
        ← Library
      </Link>

      <h1 className="mt-2 mb-2 text-2xl font-bold text-foreground">
        Single Video
      </h1>

      <p className="mb-6 text-sm text-muted">
        {status === "loading"
          ? "Opening clip…"
          : status === "missing"
            ? "That clip wasn’t found in your library."
            : "Import a vault video to review frame-by-frame."}
      </p>

      {message && <p className="mb-4 text-sm text-red-500">{message}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/*,.mp4,.mov,.m4v"
        className="hidden"
        onChange={(event) => {
          void handleImport(event.target.files?.[0] ?? null);
        }}
      />

      <button
        type="button"
        disabled={busy || status === "loading"}
        className={`${primaryButtonClassName} flex min-h-14 w-full items-center justify-center text-[17px] disabled:opacity-60`}
        onClick={() => fileInputRef.current?.click()}
      >
        {busy ? "Importing…" : "Choose from Photos"}
      </button>
    </main>
  );
}
