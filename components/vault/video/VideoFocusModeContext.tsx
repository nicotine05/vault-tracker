"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type VideoImmersiveContextValue = {
  isImmersive: boolean;
  setImmersive: (value: boolean) => void;
};

const VideoImmersiveContext = createContext<VideoImmersiveContextValue | null>(
  null,
);

/** @deprecated Use VideoImmersiveProvider semantics via focusMode alias */
export function VideoFocusModeProvider({ children }: { children: ReactNode }) {
  const [isImmersive, setImmersive] = useState(false);

  const value = useMemo(
    () => ({
      isImmersive,
      setImmersive,
      focusMode: isImmersive,
      setFocusMode: setImmersive,
      toggleFocusMode: () => setImmersive((current) => !current),
    }),
    [isImmersive],
  );

  return (
    <VideoImmersiveContext.Provider value={value}>
      {children}
    </VideoImmersiveContext.Provider>
  );
}

export function useVideoImmersive() {
  const context = useContext(VideoImmersiveContext);
  if (!context) {
    throw new Error("useVideoImmersive must be used within VideoFocusModeProvider");
  }

  return context;
}

export function useOptionalVideoImmersive() {
  return useContext(VideoImmersiveContext);
}

/** @deprecated */
export function useVideoFocusMode() {
  const { isImmersive, setImmersive } = useVideoImmersive();
  return {
    focusMode: isImmersive,
    setFocusMode: setImmersive,
    toggleFocusMode: () => setImmersive(!isImmersive),
  };
}

/** @deprecated */
export function useOptionalVideoFocusMode() {
  const context = useOptionalVideoImmersive();
  if (!context) {
    return null;
  }

  return {
    focusMode: context.isImmersive,
    setFocusMode: context.setImmersive,
    toggleFocusMode: () => context.setImmersive(!context.isImmersive),
  };
}
