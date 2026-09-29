"use server";

import { EMAIL_RE, isHuman, saveSubmission } from "@/lib/submissions";

export type ContactState = { ok: boolean; message: string; errors?: Record<string, string> };

const THANKS = "Thanks — your message is in. Our team will reach out shortly.";

export async function submitContact(_prev: ContactState, form: FormData): Promise<ContactState> {
  if (!(await isHuman(form))) return { ok: true, message: THANKS };

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
  if (!EMAIL_RE.test(data.email)) errors.email = "Please enter a valid email.";
  if (data.message.length < 10) errors.message = "Tell us a little about the project.";
  if (Object.keys(errors).length) return { ok: false, message: "Please fix the highlighted fields.", errors };

  const ok = await saveSubmission(
    { kind: "contact", ...data },
    {
      fields: [
        ["Company", data.company],
        ["Email", data.email],
        ["Phone", data.phone],
        ["Project type", data.project_type],
      ],
      message: data.message,
    },
  );
  return ok ? { ok: true, message: THANKS } : { ok: false, message: "Something went wrong sending your message. Please call us instead." };
}
