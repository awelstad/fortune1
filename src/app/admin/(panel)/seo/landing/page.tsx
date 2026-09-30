import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";
import { Badge } from "@/components/admin/ui";
import type { LandingPage } from "@/lib/types";

export const metadata = { title: "SEO · Landing pages" };

const KIND = { service: ["Services", "/services"], market: ["Markets", "/markets"], area: ["Service areas", "/service-areas"] } as const;

export default async function LandingAdmin() {
  const { supabase } = await requireAdminPage();
  const { data } = await supabase.from("landing_pages").select("*").order("kind").order("sort_order");
  const pages = (data ?? []) as LandingPage[];
  return (
    <div className="space-y-8">
      <p className="text-sm text-zinc-500">
        Pages built to rank for searches like “commercial electrical contractor Fort Myers” or “switchgear contractor Florida”. Projects are
        added automatically based on each page&apos;s matching rules.
      </p>
      {(Object.keys(KIND) as (keyof typeof KIND)[]).map((k) => (
        <section key={k}>
          <h2 className="mb-2 text-sm font-semibold">{KIND[k][0]}</h2>
          <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
            {pages
              .filter((p) => p.kind === k)
              .map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                  <Link href={`/admin/seo/landing/${p.id}`} className="font-medium hover:text-signal">
                    {p.name}
                  </Link>
                  <span className="flex items-center gap-3">
                    <Badge tone={p.published ? "live" : "draft"}>{p.published ? "Live" : "Draft"}</Badge>
                    {p.published && (
                      <a href={`${KIND[k][1]}/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 hover:text-zinc-900">
                        View ↗
                      </a>
                    )}
                    <Link href={`/admin/seo/landing/${p.id}`} className="text-xs text-signal hover:underline">
                      Edit
                    </Link>
                  </span>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
