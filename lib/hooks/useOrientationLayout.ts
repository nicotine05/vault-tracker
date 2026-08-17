"use client";

import { useEffect, useState } from "react";
import type { CompareLayoutMode } from "@/lib/domain/videoAnalysis";

function layoutFromViewport(): CompareLayoutMode {
  if (typeof window === "undefined") {
    return "side";
  }

  return window.innerHeight > window.innerWidth ? "stack" : "side";
}

export function useOrientationLayout() {
  const [layout, setLayout] = useState<CompareLayoutMode>(layoutFromViewport);

  useEffect(() => {
    const update = () => setLayout(layoutFromViewport());

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return layout;
}
