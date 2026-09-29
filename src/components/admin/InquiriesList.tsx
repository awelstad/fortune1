"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteInquiry, getAttachmentUrl, setInquiryStatus } from "@/app/admin/(panel)/content-actions";
import type { ContactSubmission } from "@/lib/types";
import { Badge, Button, Select } from "./ui";

type Kind = ContactSubmission["kind"];
const KIND: Record<Kind, { label: string; tone: "live" | "upcoming" | "current" | "completed" }> = {
  bid: { label: "Bid invite", tone: "current" },
  prequal: { label: "Prequal request", tone: "live" },
  application: { label: "Application", tone: "upcoming" },
  contact: { label: "Inquiry", tone: "completed" },
};

const DETAIL_LABELS: Record<string, string> = {
  project: "Project",
  bid_due: "Bid due",
  location: "Location",
  size: "Size / value",
  plans_link: "Plans",
  documents: "Documents requested",
  experience: "Experience",
  licenses: "Licenses",
};

function fmtDue(d: string) {
  const date = new Date(`${d}T12:00:00Z`);
  const days = Math.round((date.getTime() - Date.now()) / 86400000);
  const label = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
  return { label, days };
}

export function InquiriesList({ items }: { items: ContactSubmission[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"active" | "archived">("active");
  const [kind, setKind] = useState<"all" | Kind>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [, start] = useTransition();
  const shown = items
    .filter((i) => (filter === "archived" ? i.status === "archived" : i.status !== "archived"))
    .filter((i) => kind === "all" || i.kind === kind);
  const count = (k: Kind) => items.filter((i) => i.kind === k && i.status !== "archived").length;

  const act = (fn: () => Promise<unknown>) =>
    start(async () => {
      await fn();
      router.refresh();
    });

  const download = async (path: string) => {
    const res = await getAttachmentUrl(path);
    if (res.ok && res.data) window.location.assign(res.data.url);
    else alert(res.message ?? "Could not open the file.");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="w-40!" aria-label="Inbox or archived">
          <option value="active">Inbox</option>
          <option value="archived">Archived</option>
        </Select>
        <Select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className="w-60!" aria-label="Filter by type">
          <option value="all">All messages</option>
          <option value="bid">Bid invites ({count("bid")})</option>
          <option value="prequal">Prequal requests ({count("prequal")})</option>
          <option value="contact">Project inquiries ({count("contact")})</option>
          <option value="application">Job applications ({count("application")})</option>
        </Select>
      </div>
      {shown.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500">Nothing here.</p>
      ) : (
        <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
          {shown.map((i) => {
            const k = KIND[i.kind] ?? KIND.contact;
            const details = Object.entries(i.details ?? {}).filter(([, v]) => v);
            const due = i.kind === "bid" && i.details?.bid_due ? fmtDue(i.details.bid_due) : null;
            const headline = i.kind === "bid" ? i.details?.project || i.position : i.kind === "application" ? i.position : null;
            return (
              <li key={i.id} className="p-4">
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-4 text-left"
                  aria-expanded={open === i.id}
                  onClick={() => {
                    setOpen(open === i.id ? null : i.id);
                    if (i.status === "new") act(() => setInquiryStatus(i.id, "read"));
                  }}
                >
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      {i.status === "new" && <Badge tone="live">New</Badge>}
                      <Badge tone={k.tone}>{k.label}</Badge>
                      {headline && <span>{headline}</span>}
                      {!headline && i.name}
                      {i.company && <span className="font-normal text-zinc-500">· {i.company}</span>}
                      {i.attachments?.length > 0 && <span className="text-xs text-zinc-500">📎 {i.attachments.length}</span>}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-zinc-500">
                      {headline ? `${i.name} — ` : ""}
                      {i.message}
                    </p>
                  </div>
                  <span className="shrink-0 text-right text-xs text-zinc-400">
                    {due && (
                      <span className={`mb-1 block font-medium ${due.days <= 3 && due.days >= 0 ? "text-red-600" : "text-zinc-700"}`}>
                        Due {due.label}
                      </span>
                    )}
                    {new Date(i.created_at).toLocaleString()}
                  </span>
                </button>
                {open === i.id && (
                  <div className="mt-4 space-y-4 rounded-md bg-zinc-50 p-4 text-sm">
                    <dl className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <dt className="text-xs text-zinc-500">From</dt>
                        <dd>{i.name}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-zinc-500">Email</dt>
                        <dd>
                          <a className="text-signal hover:underline" href={`mailto:${i.email}`}>
                            {i.email}
                          </a>
                        </dd>
                      </div>
                      {i.phone && (
                        <div>
                          <dt className="text-xs text-zinc-500">Phone</dt>
                          <dd>
                            <a className="text-signal hover:underline" href={`tel:${i.phone}`}>
                              {i.phone}
                            </a>
                          </dd>
                        </div>
                      )}
                      {i.project_type && (
                        <div>
                          <dt className="text-xs text-zinc-500">Type</dt>
                          <dd>{i.project_type}</dd>
                        </div>
                      )}
                      {details.map(([key, v]) => (
                        <div key={key}>
                          <dt className="text-xs text-zinc-500">{DETAIL_LABELS[key] ?? key}</dt>
                          <dd className="break-words">
                            {key === "plans_link" ? (
                              <a className="text-signal hover:underline" href={String(v)} target="_blank" rel="noopener noreferrer">
                                Open plans ↗
                              </a>
                            ) : key === "bid_due" ? (
                              fmtDue(String(v)).label
                            ) : (
                              String(v)
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <p className="whitespace-pre-wrap">{i.message}</p>
                    {i.attachments?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {i.attachments.map((p) => (
                          <Button key={p} variant="secondary" onClick={() => download(p)}>
                            ⬇ {p.split("/").pop()}
                          </Button>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => act(() => setInquiryStatus(i.id, i.status === "archived" ? "read" : "archived"))}>
                        {i.status === "archived" ? "Move to inbox" : "Archive"}
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => {
                          if (confirm("Delete this message and any attached files permanently?")) act(() => deleteInquiry(i.id));
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
