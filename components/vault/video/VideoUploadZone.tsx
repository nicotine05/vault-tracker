"use client";

import { useRef } from "react";
import Card from "@/components/Card";
import { isVideoFile } from "@/lib/domain/videoAnalysis";
import { primaryButtonClassName } from "@/lib/ui/componentStyles";

type VideoUploadZoneProps = {
  label: string;
  onFileSelected: (file: File) => void;
  acceptMultiple?: boolean;
};

export default function VideoUploadZone({
  label,
  onFileSelected,
  acceptMultiple = false,
}: VideoUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    if (!isVideoFile(file)) {
      return;
    }

    onFileSelected(file);
  };

  return (
    <Card className="text-center">
      <p className="text-sm text-muted">{label}</p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`${primaryButtonClassName} mt-4 min-h-12`}
      >
        Upload Video
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm,.m4v"
        multiple={acceptMultiple}
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <p className="mt-3 text-xs text-muted">
        MP4, MOV, and other browser-supported formats. Stored in session only.
      </p>
    </Card>
  );
}
