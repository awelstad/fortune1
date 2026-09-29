"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Public document drop (resumes, bid documents) into the PRIVATE `uploads`
 * bucket. Storage policies allow the public to write here but never to read or
 * list; only admins can download.
 */
export const DOC_TYPES: Record<string, string> = {
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/zip": "ZIP",
  "application/x-zip-compressed": "ZIP",
  "image/jpeg": "JPG",
  "image/png": "PNG",
};

export function checkDoc(file: File, allowed: string[], maxMB: number): string | null {
  if (!allowed.includes(file.type)) return `${file.name}: file type not allowed.`;
  if (file.size > maxMB * 1024 * 1024) return `${file.name}: larger than ${maxMB} MB.`;
  return null;
}

export async function uploadDoc(file: File, folder: "resumes" | "bids") {
  const safe = file.name.replace(/[^\w.\- ()]/g, "_").slice(-100) || "file";
  const path = `${folder}/${crypto.randomUUID()}/${safe}`;
  const { error } = await createClient().storage.from("uploads").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(`${file.name}: ${error.message}`);
  return path;
}
