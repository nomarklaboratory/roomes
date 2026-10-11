"use client";
import { useEffect, useRef, useState, type PointerEvent } from "react";

export function useInspectionImage() {
  const viewport = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const pan = useRef<{
    pointerId: number;
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  useEffect(() => {
    pan.current = null;
    const frame = requestAnimationFrame(() => {
      const element = viewport.current;
      if (!element) return;
      element.scrollLeft = zoomed
        ? (element.scrollWidth - element.clientWidth) / 2
        : 0;
      element.scrollTop = zoomed
        ? (element.scrollHeight - element.clientHeight) / 2
        : 0;
    });
    return () => cancelAnimationFrame(frame);
  }, [zoomed, attempt, failed]);
  const retry = () => {
    setFailed(false);
    setAttempt((value) => value + 1);
  };
  const startPan = (event: PointerEvent<HTMLDivElement>) => {
    if (!zoomed || event.pointerType !== "mouse" || event.button !== 0) return;
    event.preventDefault();
    const element = event.currentTarget;
    element.focus({ preventScroll: true });
    element.setPointerCapture(event.pointerId);
    pan.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: element.scrollLeft,
      top: element.scrollTop,
    };
  };
  const movePan = (event: PointerEvent<HTMLDivElement>) => {
    const origin = pan.current;
    if (!origin || origin.pointerId !== event.pointerId) return;
    event.currentTarget.scrollLeft = origin.left + origin.x - event.clientX;
    event.currentTarget.scrollTop = origin.top + origin.y - event.clientY;
  };
  const endPan = (event: PointerEvent<HTMLDivElement>) => {
    if (pan.current?.pointerId !== event.pointerId) return;
    pan.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return {
    viewport,
    zoomed,
    toggleZoom: () => setZoomed((value) => !value),
    failed,
    fail: () => setFailed(true),
    attempt,
    retry,
    panHandlers: {
      onPointerDown: startPan,
      onPointerMove: movePan,
      onPointerUp: endPan,
      onPointerCancel: endPan,
      onLostPointerCapture: endPan,
    },
  };
}

export function useInspectionVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const player = video.current;
    return () => {
      player?.pause();
    };
  }, [started]);
  const retry = () => {
    setFailed(false);
    setStarted(false);
  };
  return {
    video,
    started,
    failed,
    start: () => setStarted(true),
    fail: () => setFailed(true),
    retry,
  };
}
