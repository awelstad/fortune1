"use server";

import { createPublicClient } from "@/lib/supabase/public";

export type ApplyState = { ok: boolean; message: string; errors?: Record<string, string> };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const THANKS = "Thanks — your application is in. Our HR team will be in touch.";

export async function submitApplication(_prev: ApplyState, form: FormData): Promise<ApplyState> {
  // Honeypot + minimum fill time
  if (form.get("website")) return { ok: true, message: THANKS };
  const started = Number(form.get("started"));
  if (started && Date.now() - started < 2500) return { ok: true, message: THANKS };

  const field = (k: string, max: number) => String(form.get(k) ?? "").trim().slice(0, max);
  const experience = field("experience", 60);
  const licenses = field("licenses", 300);
  const about = field("message", 4000);

  const data = {
    kind: "application" as const,
    name: field("name", 200),
    email: field("email", 320),
    phone: field("phone", 50) || null,
    position: field("position", 120) || "General application",
    project_type: null,
    company: null,
    message: [
      experience && `Experience: ${experience}`,
      licenses && `Licenses / certifications: ${licenses}`,
      about,
    ]
      .filter(Boolean)
      .join("\n\n"),
  };

  const errors: Record<string, string> = {};
  if (!data.name) errors.name = "Please enter your name.";
  if (!EMAIL.test(data.email)) errors.email = "Please enter a valid email.";
  if (!data.phone) errors.phone = "Please enter a phone number.";
  if (!about) errors.message = "Tell us a little about yourself.";
  if (Object.keys(errors).length) return { ok: false, message: "Please fix the highlighted fields.", errors };

  const { error } = await createPublicClient().from("contact_submissions").insert(data);
  if (error) {
    console.error("[apply]", error.message);
    return { ok: false, message: "Something went wrong. Please call the office instead." };
  }
  return { ok: true, message: THANKS };
}
