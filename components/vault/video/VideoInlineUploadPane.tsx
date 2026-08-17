"use client";

import { useRef } from "react";
import { isVideoFile } from "@/lib/domain/videoAnalysis";
import { glassButtonClassName, glassPillClassName } from "@/components/vault/video/videoStyles";

type VideoInlineUploadPaneProps = {
  label: string;
  onFileSelected: (file: File) => void;
};

export default function VideoInlineUploadPane({
  label,
  onFileSelected,
}: VideoInlineUploadPaneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-zinc-950 p-6">
      <span className={glassPillClassName}>{label}</span>
      <p className="max-w-[220px] text-center text-sm text-white/60">
        Choose a video to load into this pane.
      </p>
      <button
        type="button"
        className={`${glassButtonClassName} min-h-11 px-5 text-sm font-semibold`}
        onClick={() => inputRef.current?.click()}
      >
        Choose Video
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm,.m4v"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file && isVideoFile(file)) {
            onFileSelected(file);
          }
          event.target.value = "";
        }}
      />
    </div>
  );
}
