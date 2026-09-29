"use client";

import { useActionState, useState } from "react";
import { requestPrequal, type PrequalState } from "@/app/(site)/prequalification/actions";
import { ArrowRight } from "./Icons";
import { Turnstile } from "./Turnstile";

const input =
  "mt-2 block w-full border-0 border-b border-rule bg-transparent px-0 py-3 text-lg text-ink placeholder:text-mute/60 focus:border-ink focus:outline-none focus:ring-0";

export function PrequalForm({ documents }: { documents: string[] }) {
  const [state, action, pending] = useActionState<PrequalState, FormData>(requestPrequal, { ok: false, message: "" });
  const [started] = useState(() => Date.now());
  const err = state.errors ?? {};

  if (state.ok) {
    return (
      <div className="border border-ink bg-white p-8 sm:p-12" role="status">
        <p className="font-display text-5xl">Request received.</p>
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

      <fieldset className="sm:col-span-2">
        <legend className="label text-mute">Documents needed</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {documents.map((d) => (
            <label
              key={d}
              className="flex min-h-12 cursor-pointer items-center gap-3 border border-rule bg-white px-4 py-3 transition-colors has-[:checked]:border-ink has-[:checked]:font-medium"
            >
              <input type="checkbox" name="docs" value={d} defaultChecked className="size-4 accent-signal" />
              <span className="text-sm">{d}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <F label="Company" id="pq-company" error={err.company} required>
        <input id="pq-company" name="company" autoComplete="organization" className={input} aria-invalid={!!err.company} />
      </F>
      <F label="Your name" id="pq-name" error={err.name} required>
        <input id="pq-name" name="name" autoComplete="name" className={input} aria-invalid={!!err.name} />
      </F>
      <F label="Email" id="pq-email" error={err.email} required>
        <input id="pq-email" name="email" type="email" autoComplete="email" className={input} aria-invalid={!!err.email} />
      </F>
      <F label="Phone" id="pq-phone">
        <input id="pq-phone" name="phone" type="tel" autoComplete="tel" className={input} />
      </F>
      <F label="For which project? (optional)" id="pq-project" wide>
        <input id="pq-project" name="project" className={input} />
      </F>
      <F label="Anything specific?" id="pq-notes" wide>
        <textarea id="pq-notes" name="notes" rows={3} placeholder="Your prequal portal, required forms, deadlines…" className={`${input} resize-y`} />
      </F>

      <Turnstile />
      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className={`text-sm ${state.message ? "text-red-700" : "text-mute"}`} role={state.message ? "alert" : undefined}>
          {state.message || (
            <>
              Documents are sent directly to you by our team.{" "}
              <a href="/privacy" className="underline hover:text-ink">
                Privacy policy
              </a>
            </>
          )}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="label group inline-flex min-h-14 items-center justify-between gap-6 bg-ink px-7 py-5 text-white transition-colors hover:bg-signal disabled:opacity-60"
        >
          {pending ? "Sending…" : "Request Packet"}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  );
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
