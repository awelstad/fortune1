"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/seo", label: "Overview", exact: true },
  { href: "/admin/seo/pages", label: "Pages" },
  { href: "/admin/seo/landing", label: "Landing pages" },
  { href: "/admin/seo/local", label: "Local business" },
];

export function SeoTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="SEO sections" className="scrollbar-none -mt-4 mb-6 flex gap-1 overflow-x-auto border-b border-zinc-200">
      {TABS.map((t) => {
        const on = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={on ? "page" : undefined}
            className={`shrink-0 border-b-2 px-3 py-2.5 text-sm ${on ? "border-zinc-900 font-medium text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-900"}`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
