"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Adds `.is-in` to every [data-reveal] element as it scrolls into view. */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    // A fully clipped mask element has zero visible area, so browsers never report it
    // as intersecting. Watch its parent instead and reveal the mask through it.
    const proxyOf = new Map<Element, Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (proxyOf.get(e.target) ?? e.target).classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const scan = () =>
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)").forEach((el) => {
        const watch = el.dataset.reveal === "mask" && el.parentElement ? el.parentElement : el;
        if (watch !== el) proxyOf.set(watch, el);
        io.observe(watch);
      });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
