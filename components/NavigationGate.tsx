"use client";

import { useOptionalVideoFocusMode } from "@/components/vault/video/VideoFocusModeContext";
import Navigation from "@/app/Navigation";

export default function NavigationGate() {
  const focusMode = useOptionalVideoFocusMode();

  if (focusMode?.focusMode) {
    return null;
  }

  return <Navigation />;
}
