"use client";

import { useActionState, useState } from "react";
import { submitContact, type ContactState } from "@/app/(site)/contact/actions";
import { ArrowRight } from "./Icons";

const TYPES = ["New construction", "Renovation / tenant improvement", "Fire alarm / low voltage", "Service", "Other"];

const input =
  "mt-2 block w-full border-0 border-b border-rule bg-transparent px-0 py-3 text-lg text-ink placeholder:text-mute/60 focus:border-ink focus:outline-none focus:ring-0";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitContact, { ok: false, message: "" });
  const [started] = useState(() => Date.now());

  if (state.ok) {
    return (
      <div className="border border-ink p-8 sm:p-12" role="status">
        <p className="font-display text-5xl">Message received.</p>
        <p className="mt-4 text-lg text-mute">{state.message}</p>
      </div>
    );
  }

  const err = state.errors ?? {};
  const described = (k: string) => (err[k] ? `${k}-error` : undefined);

  return (
    <form action={action} className="grid gap-8 sm:grid-cols-2" noValidate>
      <input type="hidden" name="started" value={started} />
      <div className="hidden" aria-hidden>
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field label="Name" name="name" error={err.name} required>
        <input id="name" name="name" autoComplete="name" required className={input} aria-invalid={!!err.name} aria-describedby={described("name")} />
      </Field>
      <Field label="Company" name="company">
        <input id="company" name="company" autoComplete="organization" className={input} />
      </Field>
      <Field label="Email" name="email" error={err.email} required>
        <input id="email" name="email" type="email" autoComplete="email" required className={input} aria-invalid={!!err.email} aria-describedby={described("email")} />
      </Field>
      <Field label="Phone" name="phone">
        <input id="phone" name="phone" type="tel" autoComplete="tel" className={input} />
      </Field>
      <Field label="Project type" name="project_type" wide>
        <select id="project_type" name="project_type" className={input} defaultValue="">
          <option value="">Select…</option>
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field label="Tell us about the project" name="message" error={err.message} required wide>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="Scope, location, schedule, GC, bid date…"
          className={`${input} resize-y`}
          aria-invalid={!!err.message}
          aria-describedby={described("message")}
        />
      </Field>

      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className={`text-sm ${state.message ? "text-red-700" : "text-mute"}`} role={state.message ? "alert" : undefined}>
          {state.message || "We typically respond within one business day."}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="label group inline-flex items-center justify-between gap-6 bg-ink px-7 py-5 text-white transition-colors hover:bg-signal disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send Message"}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  required,
  wide,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label htmlFor={name} className="label text-mute">
        {label}
        {required && <span className="text-signal"> *</span>}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
