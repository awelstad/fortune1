export type ProjectStatus = "current" | "upcoming" | "completed";

export const STATUSES: { key: ProjectStatus; label: string }[] = [
  { key: "current", label: "Current" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
];

export type Category = {
  id: string;
  slug: string;
  name: string;
  short_name: string | null;
  description: string | null;
  image_path: string | null;
  sort_order: number;
  is_active: boolean;
  show_on_home: boolean;
};

export type ProjectImage = {
  id: string;
  project_id: string;
  storage_path: string;
  width: number | null;
  height: number | null;
  alt: string | null;
  caption: string | null;
  sort_order: number;
};

export type Project = {
  id: string;
  slug: string;
  name: string;
  status: ProjectStatus;
  category_id: string | null;
  city: string | null;
  state: string | null;
  location_label: string | null;
  summary: string | null;
  description: string | null;
  scope: string[];
  project_value: number | null;
  electrical_contract_value: number | null;
  project_size: string | null;
  square_feet: number | null;
  stories: number | null;
  units: number | null;
  start_date: string | null;
  completion_date: string | null;
  timeline_note: string | null;
  general_contractor: string | null;
  owner: string | null;
  architect: string | null;
  featured: boolean;
  published: boolean;
  archived_at: string | null;
  display_order: number;
  hero_image_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

/** Project joined with its category and images, as used across the public site. */
export type ProjectWithMedia = Project & {
  category: Pick<Category, "id" | "slug" | "name" | "short_name"> | null;
  images: ProjectImage[];
  hero: ProjectImage | null;
};

export type AutoSource =
  | "manual"
  | "project_count"
  | "square_feet"
  | "units"
  | "project_value"
  | "contract_value";

export type CompanyStatistic = {
  id: string;
  label: string;
  value: number | null;
  prefix: string | null;
  suffix: string | null;
  auto_source: AutoSource;
  compact: boolean;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Capability = { title: string; body: string };

export type HomepageSettings = {
  hero_eyebrow: string | null;
  hero_headline: string | null;
  hero_subheadline: string | null;
  hero_image_path: string | null;
  hero_video_path: string | null;
  hero_youtube_url: string | null;
  hero_primary_label: string | null;
  hero_primary_href: string | null;
  hero_secondary_label: string | null;
  hero_secondary_href: string | null;
  featured_project_id: string | null;
  current_heading: string | null;
  current_intro: string | null;
  upcoming_heading: string | null;
  upcoming_intro: string | null;
  portfolio_heading: string | null;
  portfolio_intro: string | null;
  capabilities_heading: string | null;
  capabilities: Capability[];
  industries_heading: string | null;
  industries_intro: string | null;
  cta_heading: string | null;
  cta_subheading: string | null;
  cta_button_label: string | null;
  cta_button_href: string | null;
};

export type Affiliation = { name: string; image: string; href?: string };

export type SiteSettings = {
  company_name: string;
  legal_name: string | null;
  tagline: string | null;
  phone: string | null;
  email: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  license_numbers: string | null;
  service_area: string | null;
  default_seo_title: string | null;
  default_seo_description: string | null;
  social_links: Record<string, string>;
  affiliations: Affiliation[];
};

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  project_type: string | null;
  kind: "contact" | "application";
  position: string | null;
  message: string;
  status: "new" | "read" | "archived";
  created_at: string;
};

export type TeamMember = {
  id: string;
  name: string;
  title: string | null;
  group_name: string;
  email: string | null;
  phone: string | null;
  photo_path: string | null;
  bio: string | null;
  sort_order: number;
  is_active: boolean;
};

export type JobOpening = {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  summary: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};
