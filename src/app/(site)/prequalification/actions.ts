"use server";

import { EMAIL_RE, isHuman, saveSubmission } from "@/lib/submissions";

export type PrequalState = { ok: boolean; message: string; errors?: Record<string, string> };

const THANKS = "Thanks — we'll send the requested documents shortly.";

export async function requestPrequal(_prev: PrequalState, form: FormData): Promise<PrequalState> {
  if (!(await isHuman(form))) return { ok: true, message: THANKS };

  const f = (k: string, max: number) => String(form.get(k) ?? "").trim().slice(0, max);
  const name = f("name", 200);
  const company = f("company", 200);
  const email = f("email", 320);
  const phone = f("phone", 50);
  const project = f("project", 200);
  const notes = f("notes", 3000);
  const docs = form
    .getAll("docs")
    .map((d) => String(d).slice(0, 80))
    .filter(Boolean)
    .slice(0, 12);

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Your name is required.";
  if (!company) errors.company = "Company is required.";
  if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email.";
  if (Object.keys(errors).length) return { ok: false, message: "Please fix the highlighted fields.", errors };

  const docList = docs.length ? docs.join(", ") : "Full packet";
  const ok = await saveSubmission(
    {
      kind: "prequal",
      name,
      email,
      phone: phone || null,
      company,
      position: docs.length ? `${docs.length} document${docs.length === 1 ? "" : "s"} requested` : "Full packet",
      message: notes || "(no notes)",
      details: { documents: docList, project: project || null },
    },
    {
      fields: [
        ["Company", company],
        ["Requested", docList],
        ["For project", project],
        ["Contact", `${name}${phone ? ` · ${phone}` : ""}`],
        ["Email", email],
      ],
      message: notes,
    },
  );
  return ok ? { ok: true, message: THANKS } : { ok: false, message: "Something went wrong. Please call the office." };
}
