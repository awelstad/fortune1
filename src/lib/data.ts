import "server-only";
import { cache } from "react";
import { createPublicClient } from "./supabase/public";
import { compactNumber, fullNumber } from "./format";
import type {
  Category,
  CompanyStatistic,
  HomepageSettings,
  JobOpening,
  Project,
  ProjectImage,
  ProjectWithMedia,
  SiteSettings,
  LandingKind,
  LandingPage,
  SeoPage,
  TeamMember,
  Testimonial,
} from "./types";

const PROJECT_SELECT =
  "*, category:project_categories(id, slug, name, short_name), images:project_images!project_images_project_id_fkey(*)";

type RawProject = Project & {
  category: ProjectWithMedia["category"];
  images: ProjectImage[] | null;
};

function withMedia(p: RawProject): ProjectWithMedia {
  const images = [...(p.images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const hero = images.find((i) => i.id === p.hero_image_id) ?? images[0] ?? null;
  return { ...p, images, hero };
}

function logError(where: string, error: { message: string } | null) {
  if (error) console.error(`[data] ${where}: ${error.message}`);
}

/** All published, non-archived projects, in display order. */
export const getProjects = cache(async (): Promise<ProjectWithMedia[]> => {
  const { data, error } = await createPublicClient()
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("published", true)
    .is("archived_at", null)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });
  logError("getProjects", error);
  return ((data as RawProject[] | null) ?? []).map(withMedia);
});

export const getProject = cache(async (slug: string): Promise<ProjectWithMedia | null> => {
  const projects = await getProjects();
  return projects.find((p) => p.slug === slug) ?? null;
});

export const getCategories = cache(async (): Promise<Category[]> => {
  const { data, error } = await createPublicClient()
    .from("project_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  logError("getCategories", error);
  return (data as Category[] | null) ?? [];
});

const HOME_DEFAULTS: HomepageSettings = {
  hero_eyebrow: "Commercial Electrical Contractor · Florida",
  hero_headline: "Powering Florida's biggest builds.",
  hero_subheadline: null,
  hero_image_path: null,
  hero_video_path: null,
  hero_youtube_url: null,
  hero_primary_label: "View Our Projects",
  hero_primary_href: "/projects",
  hero_secondary_label: "Let's Work Together",
  hero_secondary_href: "/contact",
  featured_project_id: null,
  current_heading: "Current Projects",
  current_intro: null,
  upcoming_heading: "Upcoming Projects",
  upcoming_intro: null,
  portfolio_heading: "Our Work",
  portfolio_intro: null,
  capabilities_heading: "Capabilities",
  capabilities: [],
  industries_heading: "Industries",
  industries_intro: null,
  cta_heading: "Have a big project coming up?",
  cta_subheading: null,
  cta_button_label: "Start a Conversation",
  cta_button_href: "/contact",
};

export const getHomepage = cache(async (): Promise<HomepageSettings> => {
  const { data, error } = await createPublicClient()
    .from("homepage_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  logError("getHomepage", error);
  if (!data) return HOME_DEFAULTS;
  const merged = { ...HOME_DEFAULTS };
  for (const [k, v] of Object.entries(data)) {
    if (v !== null && v !== "" && k in merged) (merged as Record<string, unknown>)[k] = v;
  }
  return merged;
});

const SITE_DEFAULTS: SiteSettings = {
  company_name: "Fortune Electrical Construction",
  legal_name: null,
  tagline: null,
  phone: "(239) 674-3171",
  email: null,
  address_line1: "2950 Van Buren St",
  address_line2: null,
  city: "Fort Myers",
  state: "FL",
  postal_code: "33916",
  license_numbers: null,
  service_area: null,
  default_seo_title: "Fortune Electrical Construction | Commercial Electrical Contractor in Florida",
  default_seo_description:
    "Fortune Electrical Construction is a Florida commercial electrical contractor delivering aviation, education, government, senior living and multifamily projects.",
  social_links: {},
  affiliations: [],
  prequal: {},
  safety: {},
  local: {},
  photo_strip: {},
};

export const getSite = cache(async (): Promise<SiteSettings> => {
  const { data, error } = await createPublicClient()
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  logError("getSite", error);
  if (!data) return SITE_DEFAULTS;
  const merged = { ...SITE_DEFAULTS };
  for (const [k, v] of Object.entries(data)) {
    if (v !== null && v !== "" && k in merged) (merged as Record<string, unknown>)[k] = v;
  }
  return merged;
});

export type ResolvedStat = CompanyStatistic & { display: string; numeric: number };

/** Computes auto statistics from published projects; hides stats with no value. */
export function resolveStatistics(
  stats: CompanyStatistic[],
  projects: Project[],
): ResolvedStat[] {
  const sum = (f: (p: Project) => number | null) => projects.reduce((n, p) => n + (f(p) ?? 0), 0);
  const auto: Record<CompanyStatistic["auto_source"], number | null> = {
    manual: null,
    project_count: projects.length,
    square_feet: sum((p) => p.square_feet),
    units: sum((p) => p.units),
    project_value: sum((p) => p.project_value),
    contract_value: sum((p) => p.electrical_contract_value),
  };

  return stats
    .map((s) => {
      const numeric = s.auto_source === "manual" ? (s.value === null ? null : Number(s.value)) : auto[s.auto_source];
      if (numeric === null || !Number.isFinite(numeric) || numeric <= 0) return null;
      const body = s.compact ? compactNumber(numeric) : fullNumber(numeric);
      return { ...s, numeric, display: `${s.prefix ?? ""}${body}${s.suffix ?? ""}` };
    })
    .filter((s): s is ResolvedStat => s !== null);
}

export const getStatistics = cache(async (): Promise<ResolvedStat[]> => {
  const [{ data, error }, projects] = await Promise.all([
    createPublicClient().from("company_statistics").select("*").eq("is_active", true).order("sort_order"),
    getProjects(),
  ]);
  logError("getStatistics", error);
  return resolveStatistics((data as CompanyStatistic[] | null) ?? [], projects);
});

export const getTeam = cache(async (): Promise<TeamMember[]> => {
  const { data, error } = await createPublicClient()
    .from("team_members")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");
  logError("getTeam", error);
  return (data as TeamMember[] | null) ?? [];
});

export const getJobs = cache(async (): Promise<JobOpening[]> => {
  const { data, error } = await createPublicClient()
    .from("job_openings")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .order("title");
  logError("getJobs", error);
  return (data as JobOpening[] | null) ?? [];
});

export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const { data, error } = await createPublicClient()
    .from("testimonials")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  logError("getTestimonials", error);
  return (data as Testimonial[] | null) ?? [];
});

export const getLandingPages = cache(async (kind?: LandingKind): Promise<LandingPage[]> => {
  let q = createPublicClient().from("landing_pages").select("*").eq("published", true);
  if (kind) q = q.eq("kind", kind);
  const { data, error } = await q.order("sort_order").order("name");
  logError("getLandingPages", error);
  return (data as LandingPage[] | null) ?? [];
});

export const getLandingPage = cache(async (kind: LandingKind, slug: string): Promise<LandingPage | null> => {
  const pages = await getLandingPages(kind);
  return pages.find((p) => p.slug === slug) ?? null;
});

export const getSeoPages = cache(async (): Promise<Record<string, SeoPage>> => {
  const { data, error } = await createPublicClient().from("seo_pages").select("path, title, description, noindex");
  logError("getSeoPages", error);
  return Object.fromEntries(((data as SeoPage[] | null) ?? []).map((p) => [p.path, p]));
});

/** Projects that belong on a landing page (OR across its match rules), photo-first. */
export function matchProjects(page: Pick<LandingPage, "match">, projects: ProjectWithMedia[]): ProjectWithMedia[] {
  const m = page.match ?? {};
  const cats = new Set(m.categories ?? []);
  const cities = new Set(m.cities ?? []);
  const labels = new Set(m.labels ?? []);
  const words = (m.scope ?? []).map((w) => w.toLowerCase());
  const hits = projects.filter((p) => {
    if (p.category && cats.has(p.category.slug)) return true;
    if (p.city && cities.has(p.city)) return true;
    if (p.location_label && labels.has(p.location_label)) return true;
    if (words.length) {
      const hay = [p.name, p.summary, p.description, ...(p.scope ?? [])].join(" ").toLowerCase();
      if (words.some((w) => hay.includes(w))) return true;
    }
    return false;
  });
  return [...hits.filter((p) => p.hero), ...hits.filter((p) => !p.hero)];
}
