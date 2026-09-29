import "server-only";
import { after } from "next/server";
import { createPublicClient } from "./supabase/public";
import { notifySubmission, type NotifyInput } from "./notify";
import { verifyTurnstile } from "./turnstile";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UPLOAD_PATH = /^(resumes|bids)\/[0-9a-f-]{36}\/[\w.\- ()]{1,120}$/i;

/** Honeypot, fill-time and Turnstile checks. Returns false for likely bots. */
export async function isHuman(form: FormData): Promise<boolean> {
  if (form.get("website")) return false;
  const started = Number(form.get("started"));
  if (started && Date.now() - started < 2500) return false;
  return verifyTurnstile(form.get("cf-turnstile-response"));
}

/** Upload paths posted by the browser, restricted to our private drop folders. */
export function cleanAttachments(raw: FormDataEntryValue | null, folder: "resumes" | "bids", max: number): string[] {
  try {
    const list = JSON.parse(String(raw ?? "[]"));
    if (!Array.isArray(list)) return [];
    return list.map(String).filter((p) => UPLOAD_PATH.test(p) && p.startsWith(`${folder}/`)).slice(0, max);
  } catch {
    return [];
  }
}

type Row = {
  kind: NotifyInput["kind"];
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  project_type?: string | null;
  position?: string | null;
  message: string;
  details?: Record<string, string | null>;
  attachments?: string[];
};

/** Saves to the inbox and emails the team after the response is sent. */
export async function saveSubmission(row: Row, notify: Omit<NotifyInput, "kind" | "name" | "email" | "attachments">) {
  const { error } = await createPublicClient()
    .from("contact_submissions")
    .insert({ ...row, details: row.details ?? {}, attachments: row.attachments ?? [] });
  if (error) {
    console.error(`[${row.kind}]`, error.message);
    return false;
  }
  after(() =>
    notifySubmission({ kind: row.kind, name: row.name, email: row.email, attachments: row.attachments?.length, ...notify }),
  );
  return true;
}
