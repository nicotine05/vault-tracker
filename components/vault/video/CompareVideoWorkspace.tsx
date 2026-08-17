"use client";

import { useCallback, useEffect, useState } from "react";
import ComparePlayerShell from "@/components/vault/video/ComparePlayerShell";
import {
  createVideoObjectUrl,
  revokeVideoObjectUrl,
} from "@/lib/domain/videoAnalysis";

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

  return (
    <ComparePlayerShell
      videoUrlA={videoUrlA}
      videoUrlB={videoUrlB}
      titleA={fileNameA}
      titleB={fileNameB}
      onUploadA={handleUploadA}
      onUploadB={handleUploadB}
    />
  );
}
