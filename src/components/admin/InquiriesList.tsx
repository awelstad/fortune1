"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteInquiry, setInquiryStatus } from "@/app/admin/(panel)/content-actions";
import type { ContactSubmission } from "@/lib/types";
import { Badge, Button, Select } from "./ui";

export function InquiriesList({ items }: { items: ContactSubmission[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"active" | "archived">("active");
  const [kind, setKind] = useState<"all" | "contact" | "application">("all");
  const [open, setOpen] = useState<string | null>(null);
  const [, start] = useTransition();
  const shown = items
    .filter((i) => (filter === "archived" ? i.status === "archived" : i.status !== "archived"))
    .filter((i) => kind === "all" || i.kind === kind);

  const act = (fn: () => Promise<unknown>) =>
    start(async () => {
      await fn();
      router.refresh();
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="w-48!" aria-label="Filter inquiries">
          <option value="active">Inbox</option>
          <option value="archived">Archived</option>
        </Select>
        <Select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className="w-56!" aria-label="Filter by type">
          <option value="all">All messages</option>
          <option value="contact">Project inquiries</option>
          <option value="application">Job applications</option>
        </Select>
      </div>
      {shown.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500">No inquiries.</p>
      ) : (
        <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
          {shown.map((i) => (
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
                  <p className="flex items-center gap-2 font-medium">
                    {i.status === "new" && <Badge tone="live">New</Badge>}
                    {i.kind === "application" && <Badge tone="upcoming">Application · {i.position ?? "General"}</Badge>}
                    {i.name}
                    {i.company && <span className="font-normal text-zinc-500">· {i.company}</span>}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-zinc-500">{i.message}</p>
                </div>
                <span className="shrink-0 text-xs text-zinc-400">{new Date(i.created_at).toLocaleString()}</span>
              </button>
              {open === i.id && (
                <div className="mt-4 space-y-3 rounded-md bg-zinc-50 p-4 text-sm">
                  <dl className="grid gap-2 sm:grid-cols-3">
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
                        <dt className="text-xs text-zinc-500">Project type</dt>
                        <dd>{i.project_type}</dd>
                      </div>
                    )}
                  </dl>
                  <p className="whitespace-pre-wrap">{i.message}</p>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => act(() => setInquiryStatus(i.id, i.status === "archived" ? "read" : "archived"))}>
                      {i.status === "archived" ? "Move to inbox" : "Archive"}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        if (confirm("Delete this inquiry permanently?")) act(() => deleteInquiry(i.id));
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
