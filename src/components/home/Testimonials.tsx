"use client";

import { useState } from "react";
import type { Testimonial } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "@/components/site/Icons";

/** One quote at a time; arrows only when there's more than one. */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const t = items[i];
  const attribution = [t.author_name, [t.author_title, t.company].filter(Boolean).join(", ")].filter(Boolean);

  return (
    <figure data-reveal>
      <blockquote key={t.id} className="animate-fade-up">
        <p className="font-display-wide text-xl leading-snug text-balance sm:text-2xl">
          <span className="text-signal" aria-hidden>
            “
          </span>
          {t.quote}
          <span className="text-signal" aria-hidden>
            ”
          </span>
        </p>
      </blockquote>
      <figcaption className="mt-6 flex items-center justify-between gap-4">
        <span>
          {attribution[0] && <span className="block font-medium">{attribution[0]}</span>}
          {attribution[1] && <span className="label mt-1 block text-mute">{attribution[1]}</span>}
        </span>
        {items.length > 1 && (
          <span className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setI((i - 1 + items.length) % items.length)}
              className="grid size-11 place-items-center border border-rule hover:border-ink"
              aria-label="Previous testimonial"
            >
              <ChevronLeft />
            </button>
            <span className="label w-12 text-center text-mute" aria-live="polite">
              {i + 1}/{items.length}
            </span>
            <button
              type="button"
              onClick={() => setI((i + 1) % items.length)}
              className="grid size-11 place-items-center border border-rule hover:border-ink"
              aria-label="Next testimonial"
            >
              <ChevronRight />
            </button>
          </span>
        )}
      </figcaption>
    </figure>
  );
}
