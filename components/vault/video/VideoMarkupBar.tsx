"use client";

import type { AnnotationTool } from "@/lib/domain/videoAnalysis";
import {
  ANNOTATION_COLORS,
  glassButtonClassName,
  glassPanelClassName,
} from "@/components/vault/video/videoStyles";

const TOOL_OPTIONS: { id: AnnotationTool; label: string; glyph: string }[] = [
  { id: "draw", label: "Pen", glyph: "✎" },
  { id: "arrow", label: "Arrow", glyph: "➤" },
  { id: "line", label: "Line", glyph: "/" },
  { id: "circle", label: "Circle", glyph: "○" },
];

type VideoMarkupBarProps = {
  activeTool: AnnotationTool;
  color: string;
  canUndo: boolean;
  canClear: boolean;
  onToolChange: (tool: AnnotationTool) => void;
  onColorChange: (color: string) => void;
  onUndo: () => void;
  onClear: () => void;
  onDone: () => void;
};

export default function VideoMarkupBar({
  activeTool,
  color,
  canUndo,
  canClear,
  onToolChange,
  onColorChange,
  onUndo,
  onClear,
  onDone,
}: VideoMarkupBarProps) {
  return (
    <div className="pointer-events-auto w-full px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <div className={`mx-auto max-w-lg rounded-[22px] px-3 py-3 ${glassPanelClassName}`}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
            Markup
          </p>
          <button
            type="button"
            onClick={onDone}
            className="rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-black"
          >
            Done
          </button>
        </div>

        <div className="mb-3 flex items-center justify-between gap-2">
          {TOOL_OPTIONS.map((tool) => {
            const selected = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                aria-label={tool.label}
                aria-pressed={selected}
                onClick={() => onToolChange(tool.id)}
                className={`${glassButtonClassName} h-11 flex-1 gap-1 rounded-2xl text-sm ${
                  selected ? "bg-white/25 ring-1 ring-white/40" : ""
                }`}
              >
                <span className="text-base leading-none">{tool.glyph}</span>
                <span className="text-[11px] font-medium">{tool.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {ANNOTATION_COLORS.map((swatch) => {
              const selected = color === swatch;
              return (
                <button
                  key={swatch}
                  type="button"
                  aria-label={`Color ${swatch}`}
                  onClick={() => onColorChange(swatch)}
                  className={`h-7 w-7 rounded-full border transition ${
                    selected
                      ? "scale-110 border-white"
                      : "border-white/25 opacity-85"
                  }`}
                  style={{ backgroundColor: swatch }}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canUndo}
              onClick={onUndo}
              className={`${glassButtonClassName} h-9 rounded-full px-3 text-xs font-medium disabled:opacity-35`}
            >
              Undo
            </button>
            <button
              type="button"
              disabled={!canClear}
              onClick={onClear}
              className={`${glassButtonClassName} h-9 rounded-full px-3 text-xs font-medium disabled:opacity-35`}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
