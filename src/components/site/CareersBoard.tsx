"use client";

import { useActionState, useRef, useState } from "react";
import { submitApplication, type ApplyState } from "@/app/(site)/careers/actions";
import type { JobOpening } from "@/lib/types";
import { ArrowRight, ArrowUpRight } from "./Icons";

const input =
  "mt-2 block w-full border-0 border-b border-rule bg-transparent px-0 py-3 text-lg text-ink placeholder:text-mute/60 focus:border-ink focus:outline-none focus:ring-0";

/** Open positions list + application form. "Apply" on a row preselects the role. */
export function CareersBoard({ jobs, phone }: { jobs: JobOpening[]; phone: string | null }) {
  const [position, setPosition] = useState("");
  const [state, action, pending] = useActionState<ApplyState, FormData>(submitApplication, { ok: false, message: "" });
  const [started] = useState(() => Date.now());
  const formRef = useRef<HTMLDivElement>(null);
  const err = state.errors ?? {};
  const tel = phone?.replace(/[^\d+]/g, "");

  const apply = (title: string) => {
    setPosition(title);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => (document.getElementById("app-name") as HTMLInputElement | null)?.focus({ preventScroll: true }), 500);
  };

  return (
    <>
      <section aria-labelledby="openings-heading" className="bg-paper py-20 sm:py-28">
        <div className="shell">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label mb-5 flex items-center gap-3 text-mute">
                <span className="h-px w-8 bg-signal" aria-hidden />
                Open Positions
              </p>
              <h2 id="openings-heading" className="font-display text-[clamp(3rem,7vw,7rem)]">
                Join the crew
                <sup className="label ml-3 align-top text-sm tracking-normal text-mute">({String(jobs.length).padStart(2, "0")})</sup>
              </h2>
            </div>
            <p className="max-w-sm text-mute">Don&apos;t see your role? Send a general application — we&apos;re always meeting good people.</p>
          </div>

          {jobs.length > 0 ? (
            <ol className="border-t border-ink">
              {jobs.map((j, i) => (
                <li key={j.id} className="border-b border-rule">
                  <div className="grid grid-cols-[2.5rem_1fr] items-center gap-x-4 gap-y-4 py-6 sm:grid-cols-[4rem_1fr_auto] sm:py-8 lg:grid-cols-[5rem_minmax(0,1fr)_18rem_auto]">
                    <span className="label self-start pt-2 text-mute">{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0">
                      <h3 className="font-display text-[clamp(1.75rem,3.6vw,3.25rem)]">{j.title}</h3>
                      {j.summary && <p className="mt-2 max-w-xl text-mute">{j.summary}</p>}
                    </div>
                    <dl className="col-start-2 flex flex-wrap gap-x-5 gap-y-1 sm:col-start-auto lg:flex-col lg:gap-2">
                      {j.employment_type && (
                        <div>
                          <dt className="sr-only">Type</dt>
                          <dd className="label text-ink">{j.employment_type}</dd>
                        </div>
                      )}
                      {j.department && (
                        <div>
                          <dt className="sr-only">Department</dt>
                          <dd className="label text-mute">{j.department}</dd>
                        </div>
                      )}
                      {j.location && (
                        <div>
                          <dt className="sr-only">Location</dt>
                          <dd className="label text-mute">{j.location}</dd>
                        </div>
                      )}
                    </dl>
                    <button
                      type="button"
                      onClick={() => apply(j.title)}
                      className="label group col-start-2 inline-flex items-center justify-between gap-4 justify-self-start bg-ink px-5 py-4 text-white transition-colors hover:bg-signal sm:col-start-auto"
                    >
                      Apply
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="border-y border-ink py-10 text-lg text-mute">
              No openings are posted right now — send a general application below and we&apos;ll keep it on file.
            </p>
          )}
        </div>
      </section>

      <section id="apply" aria-labelledby="apply-heading" className="scroll-mt-20 border-t border-rule bg-bone py-20 sm:py-28">
        <div ref={formRef} className="shell grid scroll-mt-28 gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="apply-heading" className="font-display text-[clamp(3rem,6vw,5.5rem)]">
              Apply
            </h2>
            <p className="mt-5 max-w-sm leading-relaxed text-mute">
              Takes two minutes. Our HR team reviews every application and will reach out about next steps.
            </p>
            {phone && (
              <a href={`tel:${tel}`} className="mt-8 inline-flex items-center gap-2 border-b border-ink/30 pb-1 hover:border-ink">
                <span className="label text-mute">Prefer to call?</span>
                <span className="numeral text-2xl">{phone}</span>
                <ArrowUpRight />
              </a>
            )}
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            {state.ok ? (
              <div className="border border-ink bg-paper p-8 sm:p-12" role="status">
                <p className="font-display text-5xl">Application received.</p>
                <p className="mt-4 text-lg text-mute">{state.message}</p>
              </div>
            ) : (
              <form action={action} className="grid gap-8 sm:grid-cols-2" noValidate>
                <input type="hidden" name="started" value={started} />
                <div className="hidden" aria-hidden>
                  <label>
                    Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>

                <F label="Position" id="app-position" wide>
                  <select id="app-position" name="position" value={position} onChange={(e) => setPosition(e.target.value)} className={input}>
                    <option value="">General application</option>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.title}>
                        {j.title}
                      </option>
                    ))}
                  </select>
                </F>
                <F label="Full name" id="app-name" error={err.name} required>
                  <input id="app-name" name="name" autoComplete="name" className={input} aria-invalid={!!err.name} />
                </F>
                <F label="Phone" id="app-phone" error={err.phone} required>
                  <input id="app-phone" name="phone" type="tel" autoComplete="tel" className={input} aria-invalid={!!err.phone} />
                </F>
                <F label="Email" id="app-email" error={err.email} required>
                  <input id="app-email" name="email" type="email" autoComplete="email" className={input} aria-invalid={!!err.email} />
                </F>
                <F label="Years of experience" id="app-experience">
                  <select id="app-experience" name="experience" className={input} defaultValue="">
                    <option value="">Select…</option>
                    {["No experience — ready to learn", "Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </F>
                <F label="Licenses / certifications" id="app-licenses" wide>
                  <input id="app-licenses" name="licenses" placeholder="e.g. Journeyman, OSHA 30, NICET…" className={input} />
                </F>
                <F label="Tell us about yourself" id="app-message" error={err.message} required wide>
                  <textarea
                    id="app-message"
                    name="message"
                    rows={5}
                    placeholder="Recent work, the kind of projects you've been on, when you can start…"
                    className={`${input} resize-y`}
                    aria-invalid={!!err.message}
                  />
                </F>
                <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className={`text-sm ${state.message ? "text-red-700" : "text-mute"}`} role={state.message ? "alert" : undefined}>
                    {state.message || "Employment offers are contingent on pre-employment screening."}
                  </p>
                  <button
                    type="submit"
                    disabled={pending}
                    className="label group inline-flex items-center justify-between gap-6 bg-ink px-7 py-5 text-white transition-colors hover:bg-signal disabled:opacity-60"
                  >
                    {pending ? "Sending…" : "Submit Application"}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
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
