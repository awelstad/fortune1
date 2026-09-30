"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Sends one anonymous page-view beacon per page (see /api/v). */
export function PageTracker({ notFound = false }: { notFound?: boolean }) {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (!pathname) return;
    const qs = new URLSearchParams(window.location.search);
    const payload = JSON.stringify({
      p: pathname,
      // Only the landing page carries the external referrer; later navigations are internal.
      r: first.current ? document.referrer : "",
      u: {
        source: qs.get("utm_source") ?? undefined,
        medium: qs.get("utm_medium") ?? undefined,
        campaign: qs.get("utm_campaign") ?? undefined,
      },
      nf: notFound,
    });
    first.current = false;
    try {
      if (!navigator.sendBeacon?.("/api/v", payload)) {
        fetch("/api/v", { method: "POST", body: payload, keepalive: true }).catch(() => {});
      }
    } catch {
      /* never break the page for analytics */
    }
  }, [pathname, notFound]);

  return null;
}
