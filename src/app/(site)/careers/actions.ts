"use server";

import { EMAIL_RE, cleanAttachments, isHuman, saveSubmission } from "@/lib/submissions";

export type ApplyState = { ok: boolean; message: string; errors?: Record<string, string> };

const THANKS = "Thanks — your application is in. Our HR team will be in touch.";

export async function submitApplication(_prev: ApplyState, form: FormData): Promise<ApplyState> {
  if (!(await isHuman(form))) return { ok: true, message: THANKS };

  const field = (k: string, max: number) => String(form.get(k) ?? "").trim().slice(0, max);
  const experience = field("experience", 60);
  const licenses = field("licenses", 300);
  const about = field("message", 4000);
  const name = field("name", 200);
  const email = field("email", 320);
  const phone = field("phone", 50);
  const position = field("position", 120) || "General application";
  const resume = cleanAttachments(form.get("resume"), "resumes", 1);

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Please enter your name.";
  if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email.";
  if (!phone) errors.phone = "Please enter a phone number.";
  if (!about) errors.message = "Tell us a little about yourself.";
  if (Object.keys(errors).length) return { ok: false, message: "Please fix the highlighted fields.", errors };

  const ok = await saveSubmission(
    {
      kind: "application",
      name,
      email,
      phone,
      position,
      message: about,
      details: { experience: experience || null, licenses: licenses || null },
      attachments: resume,
    },
    {
      fields: [
        ["Position", position],
        ["Phone", phone],
        ["Email", email],
        ["Experience", experience],
        ["Licenses", licenses],
        ["Resume", resume.length ? "Attached" : "Not attached"],
      ],
      message: about,
    },
  );
  return ok ? { ok: true, message: THANKS } : { ok: false, message: "Something went wrong. Please call the office instead." };
}
