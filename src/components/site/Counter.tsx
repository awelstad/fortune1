"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts up the first number inside `value` ("$331M+", "2.1M", "1,791+")
 * when scrolled into view, preserving its decimals and thousands separators.
 * Server-renders the final value so it's correct without JS.
 */
export function Counter({ value, duration = 1600 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(value);

  useEffect(() => {
    const match = value.match(/[\d,]*\.?\d+/);
    const el = ref.current;
    if (!match || !el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const raw = match[0];
    const target = parseFloat(raw.replace(/,/g, ""));
    const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
    const commas = raw.includes(",");
    const fmt = (n: number) => {
      const s = n.toFixed(decimals);
      return commas ? Number(s).toLocaleString("en-US", { minimumFractionDigits: decimals }) : s;
    };
    const render = (n: number) => value.replace(raw, fmt(n));

    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 4);
          setText(render(target * eased));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        setText(render(0));
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} aria-label={value}>
      <span aria-hidden>{text}</span>
    </span>
  );
}
