"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  addProjectImages,
  deleteProjectImage,
  reorderProjectImages,
  replaceProjectImage,
  setHeroImage,
  updateProjectImage,
} from "@/app/admin/(panel)/projects/actions";
import { ACCEPT, uploadImage, validateImage } from "@/lib/admin/upload";
import { mediaUrl } from "@/lib/media";
import type { ProjectImage } from "@/lib/types";
import { Badge, Button, Input, Notice } from "./ui";

const HERO_MIN = 1600;

export function ImageManager({
  projectId,
  projectName,
  images: initial,
  heroId,
}: {
  projectId: string;
  projectName: string;
  images: ProjectImage[];
  heroId: string | null;
}) {
  const router = useRouter();
  const [images, setImages] = useState(initial);
  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setImages(initial);
  }
  const [dragOver, setDragOver] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<string | null>(null);

  const folder = `projects/${projectId}`;

  async function upload(files: File[]) {
    const errors = files.map(validateImage).filter(Boolean) as string[];
    const ok = files.filter((f) => !validateImage(f));
    if (errors.length) setMessage({ tone: "error", text: errors.join(" ") });
    if (!ok.length) return;

    const done: { path: string; width: number; height: number; alt: string }[] = [];
    for (const [i, f] of ok.entries()) {
      setProgress(`Uploading ${i + 1} of ${ok.length}…`);
      try {
        const up = await uploadImage(f, folder);
        done.push({ ...up, alt: projectName });
      } catch (e) {
        setMessage({ tone: "error", text: e instanceof Error ? e.message : "Upload failed." });
      }
    }
    setProgress(null);
    if (!done.length) return;
    start(async () => {
      const res = await addProjectImages(projectId, done);
      setMessage({ tone: res.ok ? "success" : "error", text: res.message ?? "Uploaded." });
      router.refresh();
    });
  }

  async function replace(file: File) {
    const id = replaceTarget.current;
    if (!id) return;
    setProgress("Uploading replacement…");
    try {
      const up = await uploadImage(file, folder);
      start(async () => {
        const res = await replaceProjectImage(id, up);
        setMessage({ tone: res.ok ? "success" : "error", text: res.message ?? "Replaced." });
        router.refresh();
      });
    } catch (e) {
      setMessage({ tone: "error", text: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setProgress(null);
    }
  }

  const act = (fn: () => Promise<{ ok: boolean; message?: string }>) =>
    start(async () => {
      const res = await fn();
      if (res.message || !res.ok) setMessage({ tone: res.ok ? "success" : "error", text: res.message ?? "Error" });
      router.refresh();
    });

  function reorder(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    const ids = images.map((i) => i.id).filter((id) => id !== sourceId);
    ids.splice(ids.indexOf(targetId), 0, sourceId);
    setImages(ids.map((id) => images.find((i) => i.id === id)!));
    act(() => reorderProjectImages(projectId, ids));
  }

  function move(id: string, dir: -1 | 1) {
    const idx = images.findIndex((i) => i.id === id);
    const j = idx + dir;
    if (j < 0 || j >= images.length) return;
    const ids = images.map((i) => i.id);
    [ids[idx], ids[j]] = [ids[j], ids[idx]];
    setImages(ids.map((x) => images.find((i) => i.id === x)!));
    act(() => reorderProjectImages(projectId, ids));
  }

  const hero = images.find((i) => i.id === heroId) ?? images[0];

  return (
    <div className="space-y-4">
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
      {hero && (hero.width ?? 0) < HERO_MIN && (
        <Notice tone="warn">
          The hero image is {hero.width}px wide. For full-screen display, upload professional photography at least{" "}
          {HERO_MIN}px wide (2400px+ ideal).
        </Notice>
      )}

      <div
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setDragOver(true);
          }
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          if (!e.dataTransfer.files.length) return;
          e.preventDefault();
          setDragOver(false);
          upload([...e.dataTransfer.files]);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragOver ? "border-signal bg-blue-50" : "border-zinc-300 bg-zinc-50"
        }`}
      >
        <p className="text-sm font-medium text-zinc-800">{progress ?? "Drag & drop photos here"}</p>
        <p className="text-xs text-zinc-500">JPG, PNG, WebP or AVIF · up to 20 MB each · multiple files OK</p>
        <Button variant="secondary" className="mt-2" disabled={!!progress || pending} onClick={() => fileInput.current?.click()}>
          Choose files
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPT.join(",")}
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) upload([...e.target.files]);
            e.target.value = "";
          }}
        />
        <input
          ref={replaceInput}
          type="file"
          accept={ACCEPT.join(",")}
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) replace(f);
            e.target.value = "";
          }}
        />
      </div>

      {images.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((img, i) => {
            const isHero = img.id === hero?.id;
            return (
              <li
                key={img.id}
                draggable
                onDragStart={(e) => {
                  setDragId(img.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => {
                  if (dragId) e.preventDefault();
                }}
                onDrop={(e) => {
                  if (!dragId) return;
                  e.preventDefault();
                  e.stopPropagation();
                  reorder(dragId, img.id);
                }}
                className={`overflow-hidden rounded-lg border bg-white ${isHero ? "border-signal ring-2 ring-signal/20" : "border-zinc-200"} ${
                  dragId === img.id ? "opacity-40" : ""
                }`}
              >
                <div className="relative aspect-[4/3] cursor-grab bg-zinc-100">
                  <Image src={mediaUrl(img.storage_path)!} alt={img.alt ?? ""} fill sizes="(min-width: 1280px) 20vw, 50vw" className="object-cover" />
                  <div className="absolute left-2 top-2 flex gap-1.5">
                    {isHero && <Badge tone="live">Hero</Badge>}
                    <Badge tone={(img.width ?? 0) < 1200 ? "warn" : "completed"}>
                      {img.width}×{img.height}
                    </Badge>
                  </div>
                  <span className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">{i + 1}</span>
                </div>
                <div className="space-y-2 p-3">
                  <Input
                    defaultValue={img.alt ?? ""}
                    placeholder="Alt text (describe the photo)"
                    aria-label={`Alt text for image ${i + 1}`}
                    onBlur={(e) => {
                      if (e.target.value !== (img.alt ?? "")) act(() => updateProjectImage(img.id, { alt: e.target.value, caption: img.caption ?? "" }));
                    }}
                  />
                  <Input
                    defaultValue={img.caption ?? ""}
                    placeholder="Caption (optional)"
                    aria-label={`Caption for image ${i + 1}`}
                    onBlur={(e) => {
                      if (e.target.value !== (img.caption ?? "")) act(() => updateProjectImage(img.id, { alt: img.alt ?? "", caption: e.target.value }));
                    }}
                  />
                  <div className="flex flex-wrap gap-1">
                    <Button variant="ghost" className="px-2 py-1 text-xs" disabled={i === 0} onClick={() => move(img.id, -1)} aria-label="Move earlier">
                      ←
                    </Button>
                    <Button variant="ghost" className="px-2 py-1 text-xs" disabled={i === images.length - 1} onClick={() => move(img.id, 1)} aria-label="Move later">
                      →
                    </Button>
                    {!isHero && (
                      <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => act(() => setHeroImage(projectId, img.id))}>
                        Set as hero
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="px-2 py-1 text-xs"
                      onClick={() => {
                        replaceTarget.current = img.id;
                        replaceInput.current?.click();
                      }}
                    >
                      Replace
                    </Button>
                    <Button
                      variant="ghost"
                      className="ml-auto px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (confirm("Delete this image?")) {
                          setImages((x) => x.filter((y) => y.id !== img.id));
                          act(() => deleteProjectImage(img.id));
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
