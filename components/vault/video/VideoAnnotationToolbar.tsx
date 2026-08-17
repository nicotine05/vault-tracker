"use client";

import type { AnnotationTool } from "@/lib/domain/videoAnalysis";
import {
  segmentedIdleClassName,
  segmentedSelectedClassName,
  softButtonClassName,
} from "@/lib/ui/componentStyles";

const TOOLS: { id: AnnotationTool; label: string }[] = [
  { id: "arrow", label: "Arrow" },
  { id: "line", label: "Line" },
  { id: "circle", label: "Circle" },
  { id: "draw", label: "Draw" },
];

type VideoAnnotationToolbarProps = {
  activeTool: AnnotationTool | null;
  onToolChange: (tool: AnnotationTool | null) => void;
  onUndo: () => void;
  onClearAll: () => void;
  canUndo: boolean;
  canClear: boolean;
};

export default function VideoAnnotationToolbar({
  activeTool,
  onToolChange,
  onUndo,
  onClearAll,
  canUndo,
  canClear,
}: VideoAnnotationToolbarProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Analysis Tools
      </p>

      <div className="grid grid-cols-4 gap-2">
        {TOOLS.map((tool) => {
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onToolChange(isActive ? null : tool.id)}
              className={`min-h-11 rounded-xl border px-2 text-xs font-semibold transition ${
                isActive ? segmentedSelectedClassName : segmentedIdleClassName
              }`}
            >
              {tool.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={!canUndo}
          onClick={onUndo}
          className={`${softButtonClassName} min-h-11 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Undo
        </button>

        <button
          type="button"
          disabled={!canClear}
          onClick={onClearAll}
          className={`${softButtonClassName} min-h-11 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
