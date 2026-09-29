"use server";

import { EMAIL_RE, cleanAttachments, isHuman, saveSubmission } from "@/lib/submissions";

export type BidState = { ok: boolean; message: string; errors?: Record<string, string> };

const THANKS = "Thanks — your bid invitation is in. Our preconstruction team will confirm shortly.";

export async function submitBid(_prev: BidState, form: FormData): Promise<BidState> {
  if (!(await isHuman(form))) return { ok: true, message: THANKS };

  const f = (k: string, max: number) => String(form.get(k) ?? "").trim().slice(0, max);
  const project = f("project", 200);
  const company = f("company", 200);
  const name = f("name", 200);
  const email = f("email", 320);
  const phone = f("phone", 50);
  const due = f("bid_due", 10);
  const location = f("location", 160);
  const type = f("project_type", 80);
  const size = f("size", 160);
  let plans = f("plans_link", 500);
  const notes = f("notes", 4000);
  const files = cleanAttachments(form.get("files"), "bids", 5);

  const errors: Record<string, string> = {};
  if (!project) errors.project = "Project name is required.";
  if (!company) errors.company = "Company is required.";
  if (!name) errors.name = "Your name is required.";
  if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email.";
  if (due && !/^\d{4}-\d{2}-\d{2}$/.test(due)) errors.bid_due = "Use a valid date.";
  if (plans) {
    try {
      const u = new URL(plans.startsWith("http") ? plans : `https://${plans}`);
      plans = u.toString();
    } catch {
      errors.plans_link = "Enter a valid link.";
    }
  }
  if (Object.keys(errors).length) return { ok: false, message: "Please fix the highlighted fields.", errors };

  const dueLabel = due
    ? new Date(`${due}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    : null;

  const ok = await saveSubmission(
    {
      kind: "bid",
      name,
      email,
      phone: phone || null,
      company,
      project_type: type || null,
      position: project.slice(0, 120), // shown as the headline in the inbox
      message: notes || "(no notes)",
      details: { project, bid_due: due || null, location: location || null, size: size || null, plans_link: plans || null },
      attachments: files,
    },
    {
      fields: [
        ["Project", project],
        ["Bid due", dueLabel],
        ["Location", location],
        ["Type", type],
        ["Size / value", size],
        ["Company", company],
        ["Contact", `${name}${phone ? ` · ${phone}` : ""}`],
        ["Email", email],
        ["Plans", plans],
      ],
      message: notes,
    },
  );
  return ok ? { ok: true, message: THANKS } : { ok: false, message: "Something went wrong. Please call or email us the invitation." };
}
