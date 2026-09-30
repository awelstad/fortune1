import Link from "next/link";
import type { LandingPage, ProjectWithMedia } from "@/lib/types";
import { compactNumber, fullNumber, paragraphs } from "@/lib/format";
import { ProjectCard } from "./ProjectCard";
import { ProjectIndex } from "./ProjectIndex";
import { JsonLd } from "./JsonLd";
import { ArrowRight, ArrowUpRight } from "./Icons";

const KIND_LABEL = { service: "Services", market: "Markets", area: "Service Areas" } as const;
const KIND_PATH = { service: "/services", market: "/markets", area: "/service-areas" } as const;

/**
 * Shared layout for SEO landing pages (service / market / service area):
 * headline + intro, proof (real matched projects), short body, FAQ, and links
 * to sibling pages. Designed to be useful, not a thin keyword page.
 */
export function LandingView({
  page,
  projects,
  siblings,
  crossLinks,
  allProjectsHref,
}: {
  page: LandingPage;
  projects: ProjectWithMedia[];
  siblings: LandingPage[];
  crossLinks?: { title: string; items: { name: string; href: string }[] };
  allProjectsHref?: string;
}) {
  const withPhotos = projects.filter((p) => p.hero).slice(0, 6);
  const others = projects.filter((p) => !withPhotos.includes(p)).slice(0, 8);
  const sf = projects.reduce((n, p) => n + (p.square_feet ?? 0), 0);
  const units = projects.reduce((n, p) => n + (p.units ?? 0), 0);
  const current = projects.filter((p) => p.status === "current").length;
  const facts = [
    { label: projects.length === 1 ? "Project" : "Projects", value: projects.length ? fullNumber(projects.length) : null },
    { label: "Square feet", value: sf ? compactNumber(sf) : null },
    { label: "Units", value: units ? fullNumber(units) : null },
    { label: "Current", value: current ? fullNumber(current) : null },
  ].filter((f) => f.value);
  const faqs = (page.faqs ?? []).filter((f) => f.q?.trim() && f.a?.trim());
  const body = paragraphs(page.body);

  return (
    <>
      {faqs.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }}
        />
      )}

      <section className="blueprint bg-ink pb-14 pt-32 text-white sm:pb-20 sm:pt-44">
        <div className="shell">
          <nav aria-label="Breadcrumb" className="label mb-8 text-white/60">
            <Link href={KIND_PATH[page.kind]} className="-my-3 inline-block py-3 hover:text-white">
              {KIND_LABEL[page.kind]}
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <span className="text-white/85">{page.name}</span>
          </nav>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <h1 className="font-display text-[clamp(2.75rem,7.5vw,7.5rem)] text-balance lg:col-span-8">
              {page.headline || page.name}
            </h1>
            {page.intro && <p className="max-w-md text-lg leading-relaxed text-fog lg:col-span-4 lg:pb-3">{page.intro}</p>}
          </div>
          {facts.length > 1 && (
            <dl className="mt-12 grid grid-cols-2 border-l border-t border-white/10 sm:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label} className="flex flex-col-reverse border-b border-r border-white/10 p-5 sm:p-6">
                  <dt className="label mt-2 text-fog">{f.label}</dt>
                  <dd className="numeral text-5xl sm:text-6xl">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {(withPhotos.length > 0 || others.length > 0) && (
        <section aria-labelledby="work-h" className="bg-paper py-16 sm:py-24">
          <div className="shell">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <h2 id="work-h" className="font-display text-5xl sm:text-7xl">
                Selected work
              </h2>
              {allProjectsHref && (
                <Link href={allProjectsHref} className="label group inline-flex items-center gap-3 border-b border-ink/30 pb-1.5 pt-3 hover:border-ink">
                  All {page.name} projects <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </div>
            {withPhotos.length > 0 && (
              <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {withPhotos.map((p, i) => (
                  <li key={p.id} className={i >= 4 ? "max-sm:hidden" : ""}>
                    <ProjectCard project={p} />
                  </li>
                ))}
              </ul>
            )}
            {others.length > 0 && (
              <div className={withPhotos.length ? "mt-14" : ""}>
                <ProjectIndex projects={others} start={withPhotos.length + 1} title={withPhotos.length ? "More projects" : undefined} />
              </div>
            )}
          </div>
        </section>
      )}

      {(body.length > 0 || faqs.length > 0) && (
        <section className="border-t border-rule bg-paper py-16 sm:py-24">
          <div className="shell grid gap-14 lg:grid-cols-12">
            {body.length > 0 && (
              <div className="space-y-5 lg:col-span-6">
                <h2 className="label border-b border-ink pb-3">How we work</h2>
                {body.map((p, i) => (
                  <p key={i} className={i === 0 ? "text-xl leading-relaxed" : "text-lg leading-relaxed text-mute"}>
                    {p}
                  </p>
                ))}
              </div>
            )}
            {faqs.length > 0 && (
              <div className={body.length ? "lg:col-span-5 lg:col-start-8" : "lg:col-span-8"}>
                <h2 className="label border-b border-ink pb-3">Common questions</h2>
                <div>
                  {faqs.map((f) => (
                    <details key={f.q} className="group border-b border-rule">
                      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
                        {f.q}
                        <span className="text-xl text-mute transition-transform group-open:rotate-45" aria-hidden>
                          +
                        </span>
                      </summary>
                      <p className="pb-5 leading-relaxed text-mute">{f.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="border-t border-rule bg-bone py-16 sm:py-20">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-display text-[clamp(2.5rem,5vw,4.5rem)]">Put us on your bid list.</h2>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/bid" className="label group inline-flex min-h-14 items-center justify-between gap-6 bg-ink px-6 py-5 text-white hover:bg-signal">
                Invite Us to Bid <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/prequalification" className="label inline-flex min-h-14 items-center justify-between gap-6 border border-ink/30 px-6 py-5 hover:border-ink">
                Prequalification <ArrowUpRight />
              </Link>
            </div>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {siblings.length > 0 && (
              <nav aria-label={`Other ${KIND_LABEL[page.kind].toLowerCase()}`}>
                <h3 className="label border-b border-ink pb-3">{KIND_LABEL[page.kind]}</h3>
                <ul>
                  {siblings.map((s) => (
                    <li key={s.id}>
                      <Link href={`${KIND_PATH[s.kind]}/${s.slug}`} className="flex min-h-11 items-center justify-between border-b border-rule py-2.5 hover:text-signal">
                        {s.name} <ArrowUpRight className="size-3.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            {crossLinks && crossLinks.items.length > 0 && (
              <nav aria-label={crossLinks.title}>
                <h3 className="label border-b border-ink pb-3">{crossLinks.title}</h3>
                <ul>
                  {crossLinks.items.map((s) => (
                    <li key={s.href}>
                      <Link href={s.href} className="flex min-h-11 items-center justify-between border-b border-rule py-2.5 hover:text-signal">
                        {s.name} <ArrowUpRight className="size-3.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

/** Index page listing landing pages of one kind, with project counts. */
export function LandingIndex({
  kind,
  title,
  intro,
  pages,
  counts,
}: {
  kind: keyof typeof KIND_PATH;
  title: string;
  intro: string;
  pages: LandingPage[];
  counts: Record<string, number>;
}) {
  return (
    <>
      <section className="blueprint bg-ink pb-14 pt-32 text-white sm:pb-20 sm:pt-44">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:items-end">
          <h1 className="font-display text-[clamp(3rem,9vw,9rem)] lg:col-span-8">{title}</h1>
          <p className="max-w-md text-lg leading-relaxed text-fog lg:col-span-4 lg:pb-4">{intro}</p>
        </div>
      </section>
      <section className="bg-paper py-16 sm:py-24">
        <div className="shell">
          <ol className="border-t border-ink">
            {pages.map((p, i) => (
              <li key={p.id}>
                <Link
                  href={`${KIND_PATH[kind]}/${p.slug}`}
                  className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-2 border-b border-rule py-6 hover:border-ink sm:grid-cols-[4rem_1fr_auto] sm:py-8 lg:grid-cols-[5rem_minmax(0,1fr)_minmax(0,24rem)_auto]"
                >
                  <span className="label self-start pt-2 text-mute sm:pt-3">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span className="font-display block text-[clamp(1.9rem,4.4vw,4rem)] transition-[color,transform] duration-500 group-hover:translate-x-2 group-hover:text-navy">
                      {p.name}
                    </span>
                    {p.intro && <span className="mt-2 line-clamp-2 block text-mute lg:hidden">{p.intro}</span>}
                  </span>
                  <span className="hidden text-sm leading-relaxed text-mute lg:line-clamp-3 lg:block">{p.intro}</span>
                  <span className="flex items-center gap-4">
                    {counts[p.slug] ? <span className="label hidden text-mute sm:block">{counts[p.slug]} projects</span> : null}
                    <span className="grid size-10 place-items-center border border-rule transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-white sm:size-12">
                      <ArrowUpRight />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

export { KIND_PATH };
