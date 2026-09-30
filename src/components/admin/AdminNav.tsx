"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/traffic", label: "Traffic" },
  { href: "/admin/seo", label: "SEO" },
  { href: "/admin/social", label: "Social & Instagram" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/statistics", label: "Statistics" },
  { href: "/admin/categories", label: "Industries" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/careers", label: "Job Openings" },
  { href: "/admin/prequalification", label: "Prequal & Safety" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/inquiries", label: "Inquiries & Applications" },
  { href: "/admin/settings", label: "Site Settings" },
  { href: "/admin/account", label: "Account" },
];

export function AdminNav({ newInquiries }: { newInquiries: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="scrollbar-none flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0">
      {ITEMS.map((i) => {
        const active = i.exact ? pathname === i.href : pathname.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              active ? "bg-white/10 font-medium text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {i.label}
            {i.href === "/admin/inquiries" && newInquiries > 0 && (
              <span className="rounded-full bg-signal px-1.5 py-0.5 text-[10px] font-semibold text-white">{newInquiries}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
