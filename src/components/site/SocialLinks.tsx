import type { ReactNode } from "react";

export const SOCIAL_KEYS = ["linkedin", "instagram", "facebook", "youtube"] as const;
export type SocialKey = (typeof SOCIAL_KEYS)[number];

export const SOCIAL_LABELS: Record<SocialKey, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
};

const ICONS: Record<SocialKey, ReactNode> = {
  linkedin: (
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  ),
  instagram: (
    <>
      <rect x="2.2" y="2.2" width="19.6" height="19.6" rx="5.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="12" cy="12" r="4.6" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="17.6" cy="6.4" r="1.35" />
    </>
  ),
  facebook: (
    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z" />
  ),
  youtube: (
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
  ),
};

/** Icon links to the company's social profiles; renders nothing when none are set. */
export function SocialLinks({ links, className = "" }: { links: Record<string, string>; className?: string }) {
  const items = SOCIAL_KEYS.filter((k) => /^https?:\/\//.test(links[k] ?? ""));
  if (!items.length) return null;
  return (
    <ul className={`flex gap-1 ${className}`}>
      {items.map((k) => (
        <li key={k}>
          <a
            href={links[k]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${SOCIAL_LABELS[k]} (opens in a new tab)`}
            className="grid size-11 place-items-center opacity-70 transition-opacity hover:opacity-100"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-5">
              {ICONS[k]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
