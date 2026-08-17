"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_TIMEOUT_MS = 1000;

export function useOverlayVisibility(timeoutMs = DEFAULT_TIMEOUT_MS) {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setVisible(false);
    }, timeoutMs);
  }, [clearTimer, timeoutMs]);

  const showControls = useCallback(() => {
    setVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  const hideControls = useCallback(() => {
    clearTimer();
    setVisible(false);
  }, [clearTimer]);

  const toggleControls = useCallback(() => {
    setVisible((current) => {
      if (current) {
        clearTimer();
        return false;
      }

      scheduleHide();
      return true;
    });
  }, [clearTimer, scheduleHide]);

  useEffect(() => {
    scheduleHide();
    return clearTimer;
  }, [clearTimer, scheduleHide]);

  return {
    controlsVisible: visible,
    showControls,
    hideControls,
    toggleControls,
    notifyActivity: showControls,
  };
}
