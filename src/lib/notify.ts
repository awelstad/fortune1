import "server-only";
import { createServiceClient } from "./supabase/service";
import { SITE_URL } from "./site-url";

export type NotifyInput = {
  kind: "contact" | "application" | "bid" | "prequal";
  name: string;
  email: string;
  replyTo?: string;
  fields: [label: string, value: string | null | undefined][];
  message?: string | null;
  attachments?: number;
};

const SUBJECT: Record<NotifyInput["kind"], string> = {
  contact: "New website inquiry",
  application: "New job application",
  bid: "New bid invitation",
  prequal: "Prequalification packet request",
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function recipients(): Promise<string[]> {
  const db = createServiceClient();
  const fallback = process.env.NOTIFY_FALLBACK_EMAIL ? [process.env.NOTIFY_FALLBACK_EMAIL] : [];
  if (!db) return fallback;
  const { data } = await db.from("admin_settings").select("notification_emails").eq("id", 1).maybeSingle();
  const list = (data?.notification_emails ?? "")
    .split(/[,;\s]+/)
    .map((s: string) => s.trim())
    .filter((s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
  return list.length ? list.slice(0, 10) : fallback;
}

/**
 * Emails the team about a new submission via Resend. Silently does nothing when
 * RESEND_API_KEY isn't configured — submissions are always saved regardless.
 */
export async function notifySubmission(input: NotifyInput) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const to = await recipients();
  if (!to.length) return;

  const rows = input.fields
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#5d6572;font:12px/1.4 monospace;text-transform:uppercase;letter-spacing:.08em;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;font:15px/1.5 sans-serif;color:#07090d">${esc(String(v))}</td></tr>`,
    )
    .join("");
  const subject = `${SUBJECT[input.kind]} — ${input.name}${input.kind === "bid" && input.fields[0]?.[1] ? ` (${input.fields[0][1]})` : ""}`;
  const html = `<div style="max-width:600px;font-family:sans-serif">
    <p style="font:12px monospace;letter-spacing:.12em;text-transform:uppercase;color:#2f7bea">Fortune Electrical — website</p>
    <h1 style="font:700 24px/1.2 sans-serif;margin:8px 0 20px">${esc(SUBJECT[input.kind])}</h1>
    <table style="border-collapse:collapse">${rows}</table>
    ${input.message ? `<p style="white-space:pre-wrap;font:15px/1.6 sans-serif;border-left:3px solid #d5d2ca;padding-left:12px;margin:20px 0">${esc(input.message)}</p>` : ""}
    ${input.attachments ? `<p style="font:14px sans-serif">📎 ${input.attachments} attached file(s) — open in the admin to download.</p>` : ""}
    <p style="margin-top:28px"><a href="${SITE_URL}/admin/inquiries" style="background:#07090d;color:#fff;padding:12px 18px;text-decoration:none;font:13px monospace;letter-spacing:.1em;text-transform:uppercase">Open in admin</a></p>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "Fortune Website <onboarding@resend.dev>",
        to,
        reply_to: input.replyTo || input.email,
        subject,
        html,
      }),
    });
    if (!res.ok) console.error("[notify]", res.status, await res.text());
  } catch (e) {
    console.error("[notify]", e instanceof Error ? e.message : e);
  }
}
