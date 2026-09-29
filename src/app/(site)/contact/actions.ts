"use server";

import { createPublicClient } from "@/lib/supabase/public";

export type ContactState = { ok: boolean; message: string; errors?: Record<string, string> };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const THANKS = "Thanks — your message is in. Our team will reach out shortly.";

export async function submitContact(_prev: ContactState, form: FormData): Promise<ContactState> {
  // Honeypot + minimum fill time: cheap bot filtering without a captcha.
  if (form.get("website")) return { ok: true, message: THANKS };
  const started = Number(form.get("started"));
  if (started && Date.now() - started < 2500) return { ok: true, message: THANKS };

  const field = (k: string, max: number) => String(form.get(k) ?? "").trim().slice(0, max);
  const data = {
    name: field("name", 200),
    email: field("email", 320),
    company: field("company", 200) || null,
    phone: field("phone", 50) || null,
    project_type: field("project_type", 100) || null,
    message: field("message", 5000),
  };

  const errors: Record<string, string> = {};
  if (!data.name) errors.name = "Please enter your name.";
  if (!EMAIL.test(data.email)) errors.email = "Please enter a valid email.";
  if (data.message.length < 10) errors.message = "Tell us a little about the project.";
  if (Object.keys(errors).length) return { ok: false, message: "Please fix the highlighted fields.", errors };

  const { error } = await createPublicClient().from("contact_submissions").insert(data);
  if (error) {
    console.error("[contact]", error.message);
    return { ok: false, message: "Something went wrong sending your message. Please call us instead." };
  }
  return { ok: true, message: THANKS };
}
