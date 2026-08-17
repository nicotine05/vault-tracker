"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import VideoPlayerShell from "@/components/vault/video/VideoPlayerShell";
import VideoUploadZone from "@/components/vault/video/VideoUploadZone";
import {
  createVideoObjectUrl,
  revokeVideoObjectUrl,
} from "@/lib/domain/videoAnalysis";
import { linkTextClassName } from "@/lib/ui/componentStyles";

export default function SingleVideoWorkspace() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("Vault Video");

  useEffect(() => {
    return () => {
      revokeVideoObjectUrl(videoUrl);
    };
  }, [videoUrl]);

  const handleUpload = useCallback(
    (file: File) => {
      revokeVideoObjectUrl(videoUrl);
      setVideoUrl(createVideoObjectUrl(file));
      setFileName(file.name.replace(/\.[^.]+$/, ""));
    },
    [videoUrl],
  );

  if (videoUrl) {
    return <VideoPlayerShell videoUrl={videoUrl} title={fileName} />;
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-20">
      <Link href="/vault/video-analysis" className={linkTextClassName}>
        ← Back
      </Link>
      <h1 className="mt-2 mb-4 text-2xl font-bold text-foreground">
        Single Video
      </h1>
      <VideoUploadZone
        label="Upload a vault video to review frame-by-frame."
        onFileSelected={handleUpload}
      />
    </main>
  );
}
