"use client";

import { createClient } from "@/lib/supabase/client";

export const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
export const MAX_BYTES = 20 * 1024 * 1024;
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export function validateImage(file: File): string | null {
  if (!ACCEPT.includes(file.type)) return `${file.name}: only JPG, PNG, WebP, AVIF or GIF images are allowed.`;
  if (file.size > MAX_BYTES) return `${file.name}: larger than 20 MB.`;
  return null;
}

async function dimensions(file: File): Promise<{ width: number; height: number }> {
  try {
    const bmp = await createImageBitmap(file);
    const d = { width: bmp.width, height: bmp.height };
    bmp.close();
    return d;
  } catch {
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = URL.createObjectURL(file);
    });
  }
}

/** Uploads to the `media` bucket under `folder/`. Storage RLS only allows admins. */
export async function uploadImage(file: File, folder: string) {
  const err = validateImage(file);
  if (err) throw new Error(err);
  const { width, height } = await dimensions(file);
  const path = `${folder}/${crypto.randomUUID()}.${EXT[file.type]}`;
  const { error } = await createClient().storage.from("media").upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`${file.name}: ${error.message}`);
  return { path, width, height };
}
