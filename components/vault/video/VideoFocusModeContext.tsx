"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type VideoFocusModeContextValue = {
  focusMode: boolean;
  setFocusMode: (value: boolean) => void;
  toggleFocusMode: () => void;
};

const VideoFocusModeContext = createContext<VideoFocusModeContextValue | null>(
  null,
);

export function VideoFocusModeProvider({ children }: { children: ReactNode }) {
  const [focusMode, setFocusMode] = useState(false);

  const toggleFocusMode = useCallback(() => {
    setFocusMode((current) => !current);
  }, []);

  const value = useMemo(
    () => ({
      focusMode,
      setFocusMode,
      toggleFocusMode,
    }),
    [focusMode, toggleFocusMode],
  );

  return (
    <VideoFocusModeContext.Provider value={value}>
      {children}
    </VideoFocusModeContext.Provider>
  );
}

export function useVideoFocusMode() {
  const context = useContext(VideoFocusModeContext);
  if (!context) {
    throw new Error("useVideoFocusMode must be used within VideoFocusModeProvider");
  }

  return context;
}

export function useOptionalVideoFocusMode() {
  return useContext(VideoFocusModeContext);
}
