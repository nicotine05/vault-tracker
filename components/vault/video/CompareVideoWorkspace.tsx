"use client";

import { useCallback, useEffect, useState } from "react";
import ComparePlayerShell from "@/components/vault/video/ComparePlayerShell";
import VideoUploadZone from "@/components/vault/video/VideoUploadZone";
import {
  createVideoObjectUrl,
  revokeVideoObjectUrl,
} from "@/lib/domain/videoAnalysis";
import Link from "next/link";
import { linkTextClassName } from "@/lib/ui/componentStyles";

export default function CompareVideoWorkspace() {
  const [videoUrlA, setVideoUrlA] = useState<string | null>(null);
  const [videoUrlB, setVideoUrlB] = useState<string | null>(null);
  const [fileNameA, setFileNameA] = useState("Video A");
  const [fileNameB, setFileNameB] = useState("Video B");

  useEffect(() => {
    return () => {
      revokeVideoObjectUrl(videoUrlA);
      revokeVideoObjectUrl(videoUrlB);
    };
  }, [videoUrlA, videoUrlB]);

  const handleUploadA = useCallback(
    (file: File) => {
      revokeVideoObjectUrl(videoUrlA);
      setVideoUrlA(createVideoObjectUrl(file));
      setFileNameA(file.name.replace(/\.[^.]+$/, ""));
    },
    [videoUrlA],
  );

  const handleUploadB = useCallback(
    (file: File) => {
      revokeVideoObjectUrl(videoUrlB);
      setVideoUrlB(createVideoObjectUrl(file));
      setFileNameB(file.name.replace(/\.[^.]+$/, ""));
    },
    [videoUrlB],
  );

  if (videoUrlA && videoUrlB) {
    return (
      <ComparePlayerShell
        videoUrlA={videoUrlA}
        videoUrlB={videoUrlB}
        titleA={fileNameA}
        titleB={fileNameB}
      />
    );
  }

  return (
    <main className="mx-auto max-w-md space-y-4 p-4 pb-20">
      <Link href="/vault/video-analysis" className={linkTextClassName}>
        ← Back
      </Link>
      <h1 className="text-2xl font-bold text-foreground">Compare Videos</h1>

      {!videoUrlA ? (
        <VideoUploadZone label="Upload Video A" onFileSelected={handleUploadA} />
      ) : (
        <VideoUploadZone
          label={`${fileNameA} ready — upload Video B`}
          onFileSelected={handleUploadB}
        />
      )}
    </main>
  );
}
