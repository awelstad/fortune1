"use client";

import { useRef, useState } from "react";
import { VIDEO_ACCEPT, uploadVideo } from "@/lib/admin/upload";
import { mediaUrl } from "@/lib/media";
import { Button } from "./ui";

/** Hero background video picker; writes the storage path into a hidden input. */
export function VideoField({ name, initialPath }: { name: string; initialPath: string | null }) {
  const [path, setPath] = useState(initialPath);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const src = mediaUrl(path);

  return (
    <div>
      <input type="hidden" name={name} value={path ?? ""} />
      <div className="relative aspect-video overflow-hidden rounded-md border border-zinc-200 bg-zinc-900">
        {src ? (
          <video src={src} muted loop autoPlay playsInline className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-xs text-zinc-400">No video — the hero photo is used</div>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <Button variant="secondary" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? "Uploading…" : src ? "Replace video" : "Upload video"}
        </Button>
        {src && (
          <Button variant="ghost" onClick={() => setPath(null)}>
            Remove
          </Button>
        )}
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        MP4 or WebM, up to 50 MB. Best: 10–20 second silent loop, 1920px wide. Click “Save homepage” after uploading.
      </p>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <input
        ref={input}
        type="file"
        accept={VIDEO_ACCEPT.join(",")}
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setBusy(true);
          setError("");
          try {
            setPath((await uploadVideo(f)).path);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed.");
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
