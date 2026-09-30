import type { Metadata } from "next";
import { CareersBoard } from "@/components/site/CareersBoard";
import { JsonLd } from "@/components/site/JsonLd";
import { getJobs, getSite } from "@/lib/data";
import { SITE_URL } from "@/lib/site-url";
import { pageMeta } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("/careers");
}

// Drawn from Fortune's own description of how it treats its workforce.
const REASONS = [
  { title: "We pay you to learn", body: "We train new electricians, sponsor their education and pay them while they learn the trade." },
  { title: "Room to advance", body: "Training is continuous and advancement is encouraged — from apprentice to master electrician and beyond." },
  { title: "Work that matters", body: "Airports, schools, courthouses, senior living and major multifamily communities across Florida." },
  { title: "People stay here", body: "Our crews stay because they're supported and treated like professionals whose success matters." },
];

export default async function CareersPage() {
  const [jobs, site] = await Promise.all([getJobs(), getSite()]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": jobs.map((j) => ({
            "@type": "JobPosting",
            title: j.title,
            description: j.description || j.summary || j.title,
            employmentType: j.employment_type === "Part-time" ? "PART_TIME" : "FULL_TIME",
            datePosted: j.created_at?.slice(0, 10),
            hiringOrganization: { "@type": "Organization", name: site.company_name, sameAs: SITE_URL },
            jobLocation: {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                streetAddress: site.address_line1 ?? undefined,
                addressLocality: site.city ?? undefined,
                addressRegion: site.state ?? "FL",
                postalCode: site.postal_code ?? undefined,
                addressCountry: "US",
              },
            },
            directApply: true,
          })),
        }}
      />

      <section className="blueprint bg-ink pb-16 pt-32 text-white sm:pb-24 sm:pt-44">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="label mb-6 flex items-center gap-3 text-fog" data-reveal>
              <span className="h-px w-8 bg-signal-bright" aria-hidden />
              Careers
            </p>
            <h1 className="font-display text-[clamp(3.5rem,10vw,10rem)]" data-reveal>
              Build your career.
            </h1>
          </div>
          <div className="lg:col-span-4 lg:pb-4" data-reveal>
            <p className="max-w-md text-lg leading-relaxed text-fog">
              Every major Florida market has a Fortune crew. From apprentices entering the trade to master electricians,
              project managers and estimators — there&apos;s a place for you here.
            </p>
            <a
              href="#apply"
              className="label group mt-8 inline-flex items-center gap-4 bg-white px-6 py-5 text-ink transition-colors hover:bg-signal hover:text-white"
            >
              Apply now <span aria-hidden>↓</span>
            </a>
          </div>
        </div>

        <div className="shell mt-16">
          <ol className="grid border-l border-t border-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map((r, i) => (
              <li key={r.title} className="border-b border-r border-white/10 p-6 sm:p-8" data-reveal style={{ ["--reveal-delay" as string]: `${i * 80}ms` }}>
                <span className="label text-signal-bright">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="font-display-wide mt-5 text-lg leading-tight sm:text-xl">{r.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-fog">{r.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CareersBoard jobs={jobs} phone={site.phone} />
    </>
  );
}
