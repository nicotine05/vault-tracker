"use client";

import { useCallback, useRef, useState } from "react";

const MIN_SCALE = 1;
const MAX_SCALE = 4;

export function useVideoZoom() {
  const [scale, setScale] = useState(MIN_SCALE);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const pinchStartDistance = useRef(0);
  const pinchStartScale = useRef(MIN_SCALE);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const isPanning = useRef(false);

  const resetZoom = useCallback(() => {
    setScale(MIN_SCALE);
    setPanX(0);
    setPanY(0);
  }, []);

  const clampPan = useCallback(
    (nextScale: number, nextPanX: number, nextPanY: number) => {
      const limit = Math.max(0, (nextScale - 1) * 120);
      return {
        panX: Math.max(-limit, Math.min(limit, nextPanX)),
        panY: Math.max(-limit, Math.min(limit, nextPanY)),
      };
    },
    [],
  );

  const handlePinchStart = useCallback(
    (distance: number) => {
      pinchStartDistance.current = distance;
      pinchStartScale.current = scale;
    },
    [scale],
  );

  const handlePinchMove = useCallback((distance: number) => {
    if (pinchStartDistance.current <= 0) {
      return;
    }

    const ratio = distance / pinchStartDistance.current;
    const nextScale = Math.max(
      MIN_SCALE,
      Math.min(MAX_SCALE, pinchStartScale.current * ratio),
    );
    setScale(nextScale);

    if (nextScale <= MIN_SCALE) {
      setPanX(0);
      setPanY(0);
    }
  }, []);

  const handlePanStart = useCallback(
    (clientX: number, clientY: number) => {
      if (scale <= MIN_SCALE) {
        return;
      }

      isPanning.current = true;
      panStart.current = { x: clientX, y: clientY, panX, panY };
    },
    [panX, panY, scale],
  );

  const handlePanMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isPanning.current || scale <= MIN_SCALE) {
        return;
      }

      const deltaX = clientX - panStart.current.x;
      const deltaY = clientY - panStart.current.y;
      const next = clampPan(
        scale,
        panStart.current.panX + deltaX,
        panStart.current.panY + deltaY,
      );
      setPanX(next.panX);
      setPanY(next.panY);
    },
    [clampPan, scale],
  );

  const handlePanEnd = useCallback(() => {
    isPanning.current = false;
  }, []);

  const transformStyle = {
    transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
  };

  return {
    scale,
    transformStyle,
    resetZoom,
    handlePinchStart,
    handlePinchMove,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
  };
}
