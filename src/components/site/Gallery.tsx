"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectImage } from "@/lib/types";
import { isHiRes, mediaUrl } from "@/lib/media";
import { ChevronLeft, ChevronRight, CloseIcon, PlusIcon } from "./Icons";

/** Masonry gallery with a keyboard-accessible full-screen viewer. */
export function Gallery({ images, name }: { images: ProjectImage[]; name: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const open = (i: number, el: HTMLElement) => {
    opener.current = el;
    setIndex(i);
  };
  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (index !== null && !d.open) d.showModal();
    if (index === null && d.open) {
      d.close();
      opener.current?.focus();
    }
  }, [index]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, step]);

  // swipe on touch devices
  const touchX = useRef<number | null>(null);

  if (!images.length) return null;
  const current = index === null ? null : images[index];

  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
        {images.map((img, i) => {
          const src = mediaUrl(img.storage_path)!;
          const w = img.width ?? 1200;
          const h = img.height ?? 800;
          return (
            <li key={img.id} className="break-inside-avoid" data-reveal style={{ ["--reveal-delay" as string]: `${(i % 3) * 80}ms` }}>
              <button
                type="button"
                onClick={(e) => open(i, e.currentTarget)}
                className={`group relative block w-full overflow-hidden bg-graphite ${isHiRes(img, 600) ? "" : "grain"}`}
                aria-label={`View image ${i + 1} of ${images.length}${img.alt ? `: ${img.alt}` : ""}`}
              >
                <Image
                  src={src}
                  alt={img.alt || `${name} — image ${i + 1}`}
                  width={w}
                  height={h}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full transition-transform duration-1000 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                />
                <span className="absolute right-3 top-3 grid size-9 place-items-center bg-ink/70 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <PlusIcon />
                </span>
              </button>
              {img.caption && <p className="label mt-2 text-mute">{img.caption}</p>}
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialog}
        onClose={close}
        onCancel={close}
        aria-label={`${name} image viewer`}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-ink/97 p-0 text-white backdrop:bg-ink/90"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {current && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
              <p className="label text-fog" aria-live="polite">
                {String((index ?? 0) + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </p>
              <button type="button" onClick={close} className="grid size-11 place-items-center hover:bg-white/10" aria-label="Close viewer">
                <CloseIcon />
              </button>
            </div>
            <div className="relative flex-1">
              <Image
                key={current.id}
                src={mediaUrl(current.storage_path)!}
                alt={current.alt || name}
                fill
                sizes="100vw"
                quality={85}
                className="animate-fade-up object-contain"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    className="absolute left-2 top-1/2 grid size-12 -translate-y-1/2 place-items-center bg-ink/60 hover:bg-white hover:text-ink sm:left-6"
                    aria-label="Previous image"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    className="absolute right-2 top-1/2 grid size-12 -translate-y-1/2 place-items-center bg-ink/60 hover:bg-white hover:text-ink sm:right-6"
                    aria-label="Next image"
                  >
                    <ChevronRight />
                  </button>
                </>
              )}
            </div>
            <p className="min-h-12 px-4 py-4 text-center text-sm text-fog sm:px-6">{current.caption}</p>
          </div>
        )}
      </dialog>
    </>
  );
}
