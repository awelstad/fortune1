"use client";

import { useRef, useState, type ReactNode } from "react";

/**
 * Shows one featured project at a time with numbered tabs to switch between
 * the starred projects. Slides are server-rendered; this only toggles them.
 */
export function FeaturedSwitcher({ names, children }: { names: string[]; children: ReactNode[] }) {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  if (children.length === 1) return <>{children[0]}</>;

  const show = (i: number) => {
    setActive(i);
    // Hidden slides never scrolled into view, so reveal their content on switch.
    requestAnimationFrame(() =>
      root.current?.querySelectorAll(`[data-slide="${i}"] [data-reveal]`).forEach((el) => el.classList.add("is-in")),
    );
  };

  return (
    <div ref={root} className="bg-ink">
      {children.map((slide, i) => (
        <div key={i} data-slide={i} id={`featured-slide-${i}`} role="tabpanel" hidden={i !== active} className="animate-fade-up">
          {slide}
        </div>
      ))}
      <div className="border-t border-white/10">
        <div role="tablist" aria-label="Featured projects" className="shell scrollbar-none flex overflow-x-auto">
          {names.map((n, i) => {
            const on = i === active;
            return (
              <button
                key={n}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls={`featured-slide-${i}`}
                onClick={() => show(i)}
                className={`group relative flex min-h-16 shrink-0 items-center gap-4 py-4 pr-10 text-left transition-colors ${
                  on ? "text-white" : "text-white/45 hover:text-white/80"
                }`}
              >
                <span className={`absolute inset-x-0 top-0 h-0.5 origin-left transition-transform duration-500 ${on ? "scale-x-100 bg-signal-bright" : "scale-x-0 bg-white/40 group-hover:scale-x-100"}`} aria-hidden />
                <span className="label">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display-wide max-w-[22ch] truncate text-sm sm:text-base">{n}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
