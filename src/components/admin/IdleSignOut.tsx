"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const IDLE_MS = 30 * 60 * 1000;
const KEY = "fortune-admin-last-active";

/**
 * Signs the admin out after 30 minutes without mouse, keyboard or touch input.
 * Activity is shared across tabs (localStorage), so working in one tab keeps
 * the others signed in; a background tab can't outlive the idle limit.
 */
export function IdleSignOut() {
  useEffect(() => {
    const now = () => Date.now();
    const mark = () => {
      try {
        localStorage.setItem(KEY, String(now()));
      } catch {
        /* storage blocked — the in-memory timer below still applies */
      }
      last = now();
    };
    let last = now();
    mark();

    let throttled = false;
    const onActivity = () => {
      if (throttled) return;
      throttled = true;
      setTimeout(() => (throttled = false), 15_000);
      mark();
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart", "mousemove"] as const;
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    const check = async () => {
      let shared = last;
      try {
        shared = Math.max(last, Number(localStorage.getItem(KEY)) || 0);
      } catch {
        /* ignore */
      }
      if (now() - shared < IDLE_MS) return;
      clearInterval(timer);
      await createClient().auth.signOut();
      // Full reload on purpose: drops any admin data held in the client-side router cache.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/admin/login?error=timeout");
    };
    const timer = setInterval(check, 30_000);
    document.addEventListener("visibilitychange", check);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
      events.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, []);

  return null;
}
