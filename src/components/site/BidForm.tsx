"use client";

import { useActionState, useState } from "react";
import { submitBid, type BidState } from "@/app/(site)/bid/actions";
import { ArrowRight } from "./Icons";
import { FileDrop } from "./FileDrop";
import { Turnstile } from "./Turnstile";

const input =
  "mt-2 block w-full border-0 border-b border-rule bg-transparent px-0 py-3 text-lg text-ink placeholder:text-mute/60 focus:border-ink focus:outline-none focus:ring-0";

export function BidForm({ types }: { types: string[] }) {
  const [state, action, pending] = useActionState<BidState, FormData>(submitBid, { ok: false, message: "" });
  const [started] = useState(() => Date.now());
  const [uploading, setUploading] = useState(false);
  const err = state.errors ?? {};

  if (state.ok) {
    return (
      <div className="border border-ink bg-white p-8 sm:p-12" role="status">
        <p className="font-display text-5xl">Invitation received.</p>
        <p className="mt-4 text-lg text-mute">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-8 sm:grid-cols-2" noValidate>
      <input type="hidden" name="started" value={started} />
      <div className="hidden" aria-hidden>
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Legend>The project</Legend>
      <F label="Project name" id="project" error={err.project} required wide>
        <input id="project" name="project" className={input} aria-invalid={!!err.project} />
      </F>
      <F label="Bid due date" id="bid_due" error={err.bid_due}>
        <input id="bid_due" name="bid_due" type="date" className={input} />
      </F>
      <F label="Project location" id="location">
        <input id="location" name="location" placeholder="City, FL" className={input} />
      </F>
      <F label="Project type" id="project_type">
        <select id="project_type" name="project_type" className={input} defaultValue="">
          <option value="">Select…</option>
          {types.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </F>
      <F label="Approx. size or value" id="size">
        <input id="size" name="size" placeholder="e.g. 220,000 SF · $45M" className={input} />
      </F>

      <Legend>Plans &amp; specs</Legend>
      <F label="Link to plans" id="plans_link" error={err.plans_link} wide>
        <input
          id="plans_link"
          name="plans_link"
          type="url"
          inputMode="url"
          placeholder="BuildingConnected, Procore, Dropbox, Box…"
          className={input}
          aria-invalid={!!err.plans_link}
        />
      </F>
      <div className="sm:col-span-2">
        <FileDrop
          name="files"
          folder="bids"
          label="Or upload documents (optional)"
          hint="Bid form, scope sheet or drawings. For full plan sets, a link is faster."
          accept={["application/pdf", "application/zip", "application/x-zip-compressed", "image/jpeg", "image/png"]}
          maxFiles={5}
          maxMB={50}
          onBusyChange={setUploading}
        />
      </div>

      <Legend>Your details</Legend>
      <F label="Company" id="company" error={err.company} required>
        <input id="company" name="company" autoComplete="organization" className={input} aria-invalid={!!err.company} />
      </F>
      <F label="Your name" id="name" error={err.name} required>
        <input id="name" name="name" autoComplete="name" className={input} aria-invalid={!!err.name} />
      </F>
      <F label="Email" id="email" error={err.email} required>
        <input id="email" name="email" type="email" autoComplete="email" className={input} aria-invalid={!!err.email} />
      </F>
      <F label="Phone" id="phone">
        <input id="phone" name="phone" type="tel" autoComplete="tel" className={input} />
      </F>
      <F label="Notes" id="notes" wide>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="Scope, phasing, pre-bid meeting, alternates…"
          className={`${input} resize-y`}
        />
      </F>

      <Turnstile />
      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className={`text-sm ${state.message ? "text-red-700" : "text-mute"}`} role={state.message ? "alert" : undefined}>
          {state.message || (
            <>
              We’ll confirm receipt by email or phone.{" "}
              <a href="/privacy" className="underline hover:text-ink">
                Privacy policy
              </a>
            </>
          )}
        </p>
        <button
          type="submit"
          disabled={pending || uploading}
          className="label group inline-flex min-h-14 items-center justify-between gap-6 bg-ink px-7 py-5 text-white transition-colors hover:bg-signal disabled:opacity-60"
        >
          {uploading ? "Uploading…" : pending ? "Sending…" : "Send Invitation"}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  );
}

function Legend({ children }: { children: React.ReactNode }) {
  return <p className="label border-b border-ink pb-3 text-ink sm:col-span-2">{children}</p>;
}

function F({
  label,
  id,
  error,
  required,
  wide,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="label text-mute">
        {label}
        {required && <span className="text-signal"> *</span>}
      </label>
      {children}
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
