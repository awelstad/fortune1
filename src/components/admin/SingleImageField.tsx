"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ACCEPT, uploadImage } from "@/lib/admin/upload";
import { mediaUrl } from "@/lib/media";
import { Badge, Button } from "./ui";

/** Uploads one image to `folder/` and writes its storage path into a hidden input. */
export function SingleImageField({
  name,
  folder,
  initialPath,
  aspect = "aspect-[16/9]",
  minWidth = 2000,
  onChange,
}: {
  name: string;
  folder: string;
  initialPath: string | null;
  aspect?: string;
  minWidth?: number;
  onChange?: (path: string | null) => void;
}) {
  const [path, setPath] = useState(initialPath);
  const [width, setWidth] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const src = mediaUrl(path);

  async function onFile(f: File) {
    setBusy(true);
    setError("");
    try {
      const up = await uploadImage(f, folder);
      setPath(up.path);
      setWidth(up.width);
      onChange?.(up.path);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={path ?? ""} />
      <div className={`relative overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 ${aspect}`}>
        {src ? (
          <Image src={src} alt="" fill sizes="480px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-xs text-zinc-400">No image</div>
        )}
        {width !== null && width < minWidth && (
          <div className="absolute left-2 top-2">
            <Badge tone="warn">{width}px — larger recommended</Badge>
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button variant="secondary" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? "Uploading…" : src ? "Replace" : "Upload"}
        </Button>
        {src && (
          <Button
            variant="ghost"
            onClick={() => {
              setPath(null);
              onChange?.(null);
            }}
          >
            Remove
          </Button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <input
        ref={input}
        type="file"
        accept={ACCEPT.join(",")}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
