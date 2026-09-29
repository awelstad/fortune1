"use client";

import { useState } from "react";
import { youtubeId } from "@/lib/youtube";
import { Input } from "./ui";

/** YouTube link input with a live check + thumbnail preview. */
export function YouTubeField({ name, initialUrl, error }: { name: string; initialUrl: string | null; error?: string }) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const id = youtubeId(url);
  const invalid = url.trim() !== "" && !id;

  return (
    <div className="space-y-2">
      <Input
        name={name}
        type="url"
        value={url}
        placeholder="https://www.youtube.com/watch?v=…"
        aria-label="YouTube video link"
        aria-invalid={invalid}
        onChange={(e) => setUrl(e.target.value)}
      />
      {id ? (
        <div className="relative aspect-video overflow-hidden rounded-md border border-zinc-200 bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin-only preview from YouTube's thumbnail CDN */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" className="h-full w-full object-cover" />
          <span className="absolute left-2 top-2 rounded bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
            ✓ Video found
          </span>
        </div>
      ) : (
        <p className={`text-xs ${invalid || error ? "text-red-600" : "text-zinc-500"}`}>
          {invalid || error ? "That doesn't look like a YouTube video link." : "Paste any YouTube link (watch, youtu.be, shorts or embed)."}
        </p>
      )}
      <p className="text-xs text-zinc-500">
        Plays muted and looping with no controls. If a video file is also uploaded above, the file is used instead. Choose a video with no
        text or logos in the opening seconds — YouTube briefly shows its own title while loading.
      </p>
    </div>
  );
}
