import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import { DailyChart } from "@/components/admin/DailyChart";
import { RankList } from "@/components/admin/RankList";
import { compactNumber } from "@/lib/format";

export const metadata = { title: "Traffic" };

type Report = {
  views: number;
  visitors: number;
  prev_views: number;
  prev_visitors: number;
  daily: { day: string; views: number; visitors: number }[];
  pages: { path: string; views: number; visitors: number }[];
  referrers: { source: string; visitors: number }[];
  cities: { city: string; visitors: number }[];
  devices: Record<string, number>;
  not_found: { path: string; hits: number }[];
  submissions: Record<string, number>;
};

const RANGES = [7, 30, 90] as const;
const KIND_LABEL: Record<string, string> = {
  bid: "Bid invites",
  prequal: "Prequal requests",
  contact: "Project inquiries",
  application: "Job applications",
};

function fillDays(daily: Report["daily"], days: number) {
  const by = new Map(daily.map((d) => [d.day, d]));
  const out: Report["daily"] = [];
  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    out.push(by.get(key) ?? { day: key, views: 0, visitors: 0 });
  }
  return out;
}

function Delta({ now, prev }: { now: number; prev: number }) {
  if (!prev) return <span className="text-xs text-zinc-400">no prior data</span>;
  const pct = Math.round(((now - prev) / prev) * 100);
  const up = pct >= 0;
  return (
    <span className={`text-xs ${up ? "text-emerald-700" : "text-red-600"}`}>
      {up ? "▲" : "▼"} {Math.abs(pct)}% <span className="text-zinc-400">vs previous</span>
    </span>
  );
}

export default async function TrafficPage({ searchParams }: PageProps<"/admin/traffic">) {
  const sp = await searchParams;
  const days = RANGES.includes(Number(sp.d) as (typeof RANGES)[number]) ? Number(sp.d) : 30;
  const { supabase } = await requireAdminPage();
  const { data, error } = await supabase.rpc("admin_traffic", { p_days: days });
  const r = (data ?? {}) as Report;
  const daily = fillDays(r.daily ?? [], days);
  const subsTotal = Object.values(r.submissions ?? {}).reduce((a, b) => a + b, 0);
  const conv = r.visitors ? ((subsTotal / r.visitors) * 100).toFixed(1) : "0";
  const devTotal = Object.values(r.devices ?? {}).reduce((a, b) => a + b, 0);

  const tiles = [
    { label: "Visitors", value: compactNumber(r.visitors ?? 0), delta: <Delta now={r.visitors ?? 0} prev={r.prev_visitors ?? 0} /> },
    { label: "Page views", value: compactNumber(r.views ?? 0), delta: <Delta now={r.views ?? 0} prev={r.prev_views ?? 0} /> },
    { label: "Form submissions", value: String(subsTotal), delta: <span className="text-xs text-zinc-400">bids, prequal, inquiries, jobs</span> },
    { label: "Conversion rate", value: `${conv}%`, delta: <span className="text-xs text-zinc-400">submissions ÷ visitors</span> },
  ];

  return (
    <>
      <PageHeader
        title="Traffic"
        description="Privacy-friendly visitor stats: no cookies, no IP addresses stored. Bots and admin pages are excluded."
        actions={
          <div role="group" aria-label="Date range" className="flex overflow-hidden rounded-md border border-zinc-300 bg-white text-sm">
            {RANGES.map((d) => (
              <Link
                key={d}
                href={`/admin/traffic?d=${d}`}
                aria-current={d === days ? "page" : undefined}
                className={`px-3 py-2 ${d === days ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"}`}
              >
                {d} days
              </Link>
            ))}
          </div>
        }
      />
      {error && <Notice tone="error">Couldn&apos;t load traffic: {error.message}</Notice>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">{t.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{t.value}</p>
            <div className="mt-1">{t.delta}</div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Card title="Visitors per day" description={`Last ${days} days · Eastern time`}>
          {(r.views ?? 0) === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-500">No visits recorded yet — numbers appear here as people visit the site.</p>
          ) : (
            <DailyChart data={daily} />
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card title="Top pages" description="By page views">
          <RankList rows={(r.pages ?? []).map((p) => ({ label: p.path, value: p.views, href: p.path }))} />
        </Card>
        <Card title="Where visitors come from" description="Referrer or campaign · visitors">
          <RankList rows={(r.referrers ?? []).map((x) => ({ label: x.source, value: x.visitors }))} />
        </Card>
        <Card title="Visitor locations" description="City · visitors">
          <RankList rows={(r.cities ?? []).map((x) => ({ label: x.city, value: x.visitors }))} empty="Locations appear on the live site (not locally)." />
        </Card>
        <Card title="Devices" description="Share of visitors">
          <RankList
            unit="%"
            rows={["mobile", "desktop", "tablet"]
              .filter((k) => r.devices?.[k])
              .map((k) => ({ label: k[0].toUpperCase() + k.slice(1), value: Math.round(((r.devices[k] ?? 0) / Math.max(1, devTotal)) * 100) }))}
          />
        </Card>
        <Card title="Leads from the website" description={`Last ${days} days`}>
          <RankList
            rows={Object.entries(KIND_LABEL)
              .map(([k, label]) => ({ label, value: r.submissions?.[k] ?? 0 }))
              .filter((x) => x.value > 0)}
            empty="No form submissions in this period."
          />
          <Link href="/admin/inquiries" className="mt-4 inline-block text-sm text-signal hover:underline">
            Open inbox →
          </Link>
        </Card>
        <Card title="Broken links (404s)" description="Pages people tried to reach that don't exist">
          <RankList rows={(r.not_found ?? []).map((x) => ({ label: x.path, value: x.hits }))} empty="None — good." />
        </Card>
      </div>
    </>
  );
}
