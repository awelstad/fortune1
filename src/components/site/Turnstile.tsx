"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Cloudflare Turnstile (invisible/managed human check). Adds a hidden
 * `cf-turnstile-response` field to the surrounding form. Renders nothing until
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is configured.
 */
export function Turnstile() {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(() => typeof window !== "undefined" && !!window.turnstile);

  useEffect(() => {
    if (!SITE_KEY || !loaded || !ref.current || !window.turnstile) return;
    const id = window.turnstile.render(ref.current, { sitekey: SITE_KEY, theme: "light", appearance: "interaction-only" });
    return () => window.turnstile?.remove(id);
  }, [loaded]);

  if (!SITE_KEY) return null;
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setLoaded(true)}
      />
      <div ref={ref} className="sm:col-span-2" />
    </>
  );
}
