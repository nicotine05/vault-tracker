"use client";

import { useState } from "react";
import type { AnnotationTool } from "@/lib/domain/videoAnalysis";
import {
  ANNOTATION_COLORS,
  glassButtonClassName,
  glassPanelClassName,
  overlayFadeClass,
} from "@/components/vault/video/videoStyles";

const TOOL_OPTIONS: { id: AnnotationTool; label: string }[] = [
  { id: "draw", label: "Free Draw" },
  { id: "arrow", label: "Arrow" },
  { id: "line", label: "Line" },
  { id: "circle", label: "Circle" },
];

type VideoDrawingMenuProps = {
  activeTool: AnnotationTool | null;
  annotationColor: string;
  controlsVisible: boolean;
  onToolChange: (tool: AnnotationTool | null) => void;
  onColorChange: (color: string) => void;
  onUndo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canClear: boolean;
  onInteraction: () => void;
};

export default function VideoDrawingMenu({
  activeTool,
  annotationColor,
  controlsVisible,
  onToolChange,
  onColorChange,
  onUndo,
  onClear,
  canUndo,
  canClear,
  onInteraction,
}: VideoDrawingMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const selectTool = (tool: AnnotationTool) => {
    onInteraction();
    onToolChange(activeTool === tool ? null : tool);
    setMenuOpen(false);
  };

  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className={`pointer-events-auto absolute bottom-24 right-4 z-20 ${overlayFadeClass(
          controlsVisible,
        )}`}
      >
        {menuOpen && (
          <div
            className={`mb-3 min-w-[168px] overflow-hidden rounded-2xl ${glassPanelClassName}`}
          >
            {TOOL_OPTIONS.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => selectTool(tool.id)}
                className={`block w-full px-4 py-3 text-left text-sm text-white transition hover:bg-white/10 ${
                  activeTool === tool.id ? "bg-white/10 font-semibold" : ""
                }`}
              >
                {tool.label}
              </button>
            ))}

            <div className="border-t border-white/10 px-4 py-3">
              <p className="mb-2 text-[11px] uppercase tracking-wide text-white/60">
                Color
              </p>
              <div className="flex gap-2">
                {ANNOTATION_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Use ${color}`}
                    onClick={() => {
                      onInteraction();
                      onColorChange(color);
                    }}
                    className={`h-6 w-6 rounded-full border-2 ${
                      annotationColor === color
                        ? "border-white"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={!canUndo}
              onClick={() => {
                onInteraction();
                onUndo();
                setMenuOpen(false);
              }}
              className="block w-full border-t border-white/10 px-4 py-3 text-left text-sm text-white transition hover:bg-white/10 disabled:opacity-40"
            >
              Undo
            </button>

            <button
              type="button"
              disabled={!canClear}
              onClick={() => {
                onInteraction();
                onClear();
                setMenuOpen(false);
              }}
              className="block w-full border-t border-white/10 px-4 py-3 text-left text-sm text-white transition hover:bg-white/10 disabled:opacity-40"
            >
              Clear
            </button>
          </div>
        )}

        <button
          type="button"
          aria-label="Drawing tools"
          onClick={() => {
            onInteraction();
            setMenuOpen((current) => !current);
          }}
          className={`${glassButtonClassName} h-12 w-12 text-lg ${
            activeTool || menuOpen ? "bg-white/25" : ""
          }`}
        >
          ✏️
        </button>
      </div>
    </div>
  );
}
