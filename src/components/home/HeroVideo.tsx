"use client";

import { useEffect, useRef, useState } from "react";
import { youtubeBackgroundSrc } from "@/lib/youtube";

/**
 * Background video layered over the hero photo — either an uploaded file or a
 * YouTube video. The photo stays underneath as the instant first paint (and
 * LCP); the video fades in once it's playing. Skipped entirely for
 * reduced-motion users and data-saver connections.
 */
export function HeroVideo({
  src,
  youtubeId,
  poster,
}: {
  src?: string | null;
  youtubeId?: string | null;
  poster: string | null;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    // YouTube pulls ~1 MB of player code; phones and tablets keep the fast photo hero instead.
    const tooSmallForYouTube = !src && !window.matchMedia("(min-width: 1024px)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- depends on browser-only APIs
    if (!reduce && !saveData && !tooSmallForYouTube) setEnabled(true);
  }, [src]);

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

  if (src) {
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

  if (youtubeId) {
    // A 16:9 iframe scaled to always cover the hero, cropped at the edges like object-cover.
    // YouTube shows its title/branding for a moment on load, so the fade-in waits a beat.
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <iframe
          src={youtubeBackgroundSrc(youtubeId)}
          title="Background video"
          tabIndex={-1}
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setTimeout(() => setReady(true), 1800)}
          className={`absolute left-1/2 top-1/2 h-[max(100%,56.25vw)] w-[max(100%,177.78svh)] -translate-x-1/2 -translate-y-1/2 scale-[1.15] border-0 transition-opacity duration-1000 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
    );
  }

  return null;
}
