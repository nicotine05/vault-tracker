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
    <div className="pointer-events-auto w-full px-2 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-2">
      <div
        className={`mx-auto max-w-lg rounded-[24px] px-3 py-3 ${glassPanelClassName}`}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="pl-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
            Markup
          </p>
          <button
            type="button"
            onClick={onDone}
            className="flex h-11 min-w-[4.75rem] items-center justify-center rounded-full bg-white px-4 text-[15px] font-semibold text-black active:scale-95 touch-manipulation"
          >
            Done
          </button>
        </div>

        <div className="mb-3 grid grid-cols-4 gap-2">
          {TOOL_OPTIONS.map((tool) => {
            const selected = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                aria-label={tool.label}
                aria-pressed={selected}
                onClick={() => onToolChange(tool.id)}
                className={`${glassButtonClassName} h-14 flex-col gap-0.5 rounded-2xl ${
                  selected ? "bg-white/28 ring-2 ring-white/50" : ""
                }`}
              >
                <span className="text-[22px] leading-none">{tool.glyph}</span>
                <span className="text-[11px] font-medium">{tool.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {ANNOTATION_COLORS.map((swatch) => {
              const selected = color === swatch;
              return (
                <button
                  key={swatch}
                  type="button"
                  aria-label={`Color ${swatch}`}
                  onClick={() => onColorChange(swatch)}
                  className={`h-11 w-11 rounded-full border-2 transition active:scale-95 touch-manipulation ${
                    selected
                      ? "border-white scale-105"
                      : "border-white/20 opacity-90"
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
              className={`${glassButtonClassName} h-11 rounded-full px-4 text-[13px] font-semibold disabled:opacity-35`}
            >
              Undo
            </button>
            <button
              type="button"
              disabled={!canClear}
              onClick={onClear}
              className={`${glassButtonClassName} h-11 rounded-full px-4 text-[13px] font-semibold disabled:opacity-35`}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
