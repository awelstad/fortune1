"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, CloseIcon } from "./Icons";

const NAV = [
  { href: "/projects", label: "Projects" },
  { href: "/#industries", label: "Industries" },
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/team", label: "Team" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ phone }: { phone: string | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the menu whenever the route changes
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const tel = phone?.replace(/[^\d+]/g, "");
  const isActive = (href: string) => !href.includes("#") && pathname.startsWith(href);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 text-white transition-[background-color,backdrop-filter,border-color] duration-500 ${
        scrolled || open
          ? "border-b border-white/10 bg-ink/85 backdrop-blur-md"
          : "border-b border-transparent bg-gradient-to-b from-ink/60 to-transparent"
      }`}
    >
      <a
        href="#main"
        className="label sr-only z-50 bg-signal px-4 py-3 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <div className="shell flex h-16 items-center justify-between gap-6 sm:h-20">
        <Link href="/" className="relative z-10 shrink-0" aria-label="Fortune Electrical Construction — home">
          <Image
            src="/brand/fortune-logo-light.png"
            alt="Fortune Electrical Construction"
            width={500}
            height={100}
            priority
            className="h-8 w-auto sm:h-10"
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex xl:gap-9">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`label relative py-2 transition-colors hover:text-white ${
                isActive(n.href) ? "text-white" : "text-white/70"
              } after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-signal-bright after:transition-transform after:duration-500 ${
                isActive(n.href) ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {phone && (
            <a href={`tel:${tel}`} className="label hidden text-white/70 transition-colors hover:text-white xl:block">
              {phone}
            </a>
          )}
          <Link
            href="/contact"
            className="label hidden items-center gap-2 bg-white px-4 py-3 text-ink transition-colors hover:bg-signal hover:text-white sm:inline-flex"
          >
            Let&apos;s Talk <ArrowUpRight />
          </Link>
          {/* Discreet staff sign-in: a faint lock, full opacity only on hover/focus. */}
          <Link
            href="/admin"
            prefetch={false}
            title="Staff sign-in"
            aria-label="Staff sign-in"
            className="hidden size-9 place-items-center text-white/25 transition-colors hover:text-white focus-visible:text-white lg:grid"
          >
            <LockIcon />
          </Link>
          <button
            ref={menuButton}
            type="button"
            className="relative z-10 grid size-11 place-items-center lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? (
              <CloseIcon className="size-6" />
            ) : (
              <span className="flex w-6 flex-col gap-1.5" aria-hidden>
                <span className="h-px w-full bg-white" />
                <span className="h-px w-2/3 self-end bg-white" />
              </span>
            )}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="blueprint fixed inset-0 top-16 h-[calc(100dvh-4rem)] overflow-y-auto bg-ink sm:top-20 sm:h-[calc(100dvh-5rem)] lg:hidden"
      >
        <nav aria-label="Mobile" className="shell flex min-h-full flex-col justify-between py-10">
          <ul className="space-y-1">
            {NAV.map((n, i) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="font-display flex items-baseline gap-4 border-b border-white/10 py-4 text-5xl"
                >
                  <span className="label text-fog">0{i + 1}</span>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-12 space-y-4">
            {phone && (
              <a href={`tel:${tel}`} className="numeral block text-4xl">
                {phone}
              </a>
            )}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="label inline-flex items-center gap-2 bg-white px-5 py-4 text-ink"
            >
              Let&apos;s Talk <ArrowUpRight />
            </Link>
            <Link
              href="/admin"
              prefetch={false}
              onClick={() => setOpen(false)}
              className="label mt-6 flex items-center gap-2 text-white/30 hover:text-white"
            >
              <LockIcon /> Staff sign-in
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden>
      <rect x="4" y="9" width="12" height="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
