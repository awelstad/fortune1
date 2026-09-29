"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Background video layered over the hero photo. The photo stays underneath as
 * the instant first paint (and LCP); the video fades in once it can play.
 * Skipped entirely for reduced-motion users and data-saver connections.
 */
export function HeroVideo({ src, poster }: { src: string; poster: string | null }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- depends on browser-only APIs
    if (!reduce && !saveData) setEnabled(true);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!enabled || !v) return;
    v.play().catch(() => {
      /* autoplay blocked — the photo remains */
    });
    // pause when off-screen to save battery/CPU
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
    io.observe(v);
    return () => io.disconnect();
  }, [enabled]);

  if (!enabled) return null;
  return (
    <video
      ref={ref}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
      src={src}
      poster={poster ?? undefined}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      aria-hidden
      tabIndex={-1}
      onCanPlay={() => setReady(true)}
    />
  );
}
