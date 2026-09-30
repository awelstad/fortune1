import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSite, getTeam } from "@/lib/data";
import { mediaUrl } from "@/lib/media";
import type { TeamMember } from "@/lib/types";
import { ArrowRight, ArrowUpRight } from "@/components/site/Icons";
import { pageMeta } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("/team");
}

export default async function TeamPage() {
  const [team, site] = await Promise.all([getTeam(), getSite()]);

  // Preserve the admin's ordering of groups (first appearance wins).
  const groups: { name: string; people: TeamMember[] }[] = [];
  for (const m of team) {
    const g = groups.find((x) => x.name === m.group_name) ?? groups[groups.push({ name: m.group_name, people: [] }) - 1];
    g.people.push(m);
  }
  const tel = site.phone?.replace(/[^\d+]/g, "");

  return (
    <>
      <section className="blueprint bg-ink pb-14 pt-32 text-white sm:pb-20 sm:pt-44">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="label mb-6 flex items-center gap-3 text-fog" data-reveal>
              <span className="h-px w-8 bg-signal-bright" aria-hidden />
              Leadership &amp; Team
            </p>
            <h1 className="font-display text-[clamp(3.5rem,11vw,11rem)]" data-reveal>
              Our Team
            </h1>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-fog lg:col-span-4 lg:pb-4" data-reveal>
            The people who lead the work, price it, manage it and deliver it — on every Fortune project.
          </p>
        </div>
        {groups.length > 1 && (
          <nav aria-label="Team groups" className="shell mt-12">
            <ul className="flex flex-wrap gap-2">
              {groups.map((g) => (
                <li key={g.name}>
                  <a
                    href={`#${anchor(g.name)}`}
                    className="label inline-flex min-h-11 items-center gap-2 border border-white/20 px-3.5 py-2.5 text-white/80 transition-colors hover:border-white hover:text-white"
                  >
                    {g.name} <span className="text-white/45">{g.people.length}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </section>

      <div className="bg-paper">
        {groups.map((g, gi) => (
          <section
            key={g.name}
            id={anchor(g.name)}
            aria-labelledby={`${anchor(g.name)}-h`}
            className={`scroll-mt-24 py-16 sm:py-24 ${gi > 0 ? "border-t border-rule" : ""}`}
          >
            <div className="shell">
              <div className="mb-10 flex items-end justify-between gap-6 border-b border-ink pb-5">
                <h2 id={`${anchor(g.name)}-h`} className="font-display text-5xl sm:text-7xl" data-reveal>
                  {g.name}
                </h2>
                <p className="label text-mute">
                  {String(g.people.length).padStart(2, "0")} {g.people.length === 1 ? "Person" : "People"}
                </p>
              </div>
              <ul
                className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 ${
                  gi === 0 ? "lg:grid-cols-4" : "lg:grid-cols-4 xl:grid-cols-5"
                }`}
              >
                {g.people.map((m, i) => (
                  <li key={m.id} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 5) * 60}ms` }}>
                    <Person member={m} priority={gi === 0 && i < 4} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>

      <section className="blueprint bg-navy-deep text-white">
        <div className="shell grid gap-10 py-20 sm:py-28 lg:grid-cols-12 lg:items-end">
          <h2 className="font-display text-[clamp(3rem,8vw,7.5rem)] lg:col-span-8" data-reveal>
            Build with us.
            <span className="block text-signal-bright">We&apos;re hiring.</span>
          </h2>
          <div className="flex flex-col gap-4 lg:col-span-4" data-reveal>
            <Link
              href="/careers"
              className="label group inline-flex items-center justify-between gap-6 bg-white px-6 py-5 text-ink transition-colors hover:bg-signal hover:text-white"
            >
              View open positions
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            {site.phone && (
              <a href={`tel:${tel}`} className="flex items-baseline justify-between border-b border-white/25 pb-3 hover:border-white">
                <span className="label text-white/60">Call the office</span>
                <span className="numeral text-3xl">{site.phone}</span>
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function anchor(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function Person({ member: m, priority }: { member: TeamMember; priority: boolean }) {
  const src = mediaUrl(m.photo_path);
  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-bone">
        {src ? (
          <Image
            src={src}
            alt={`${m.name}${m.title ? `, ${m.title}` : ""}`}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover object-top grayscale-[35%] transition-[filter,transform] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03] group-hover:grayscale-0"
          />
        ) : (
          <div className="blueprint absolute inset-0 grid place-items-center bg-graphite">
            <span className="font-display text-6xl text-white/20">
              {m.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
            </span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="font-display text-xl sm:text-2xl">{m.name}</h3>
        {m.title && <p className="label mt-1.5 leading-snug text-mute">{m.title}</p>}
        {m.email && (
          <a
            href={`mailto:${m.email}`}
            className="label mt-1 inline-flex items-center gap-1.5 border-b border-ink/25 pb-0.5 pt-3 text-ink transition-colors hover:border-signal hover:text-signal"
            aria-label={`Email ${m.name}`}
          >
            Email <ArrowUpRight className="size-3" />
          </a>
        )}
      </div>
    </article>
  );
}
