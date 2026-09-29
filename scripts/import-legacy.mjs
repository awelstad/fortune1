// Imports the legacy fortuneelectrical.com project library into Supabase:
// categories, projects, statistics, homepage/site settings, and every project
// image (downloaded, converted to WebP, uploaded to the `media` bucket).
//
// Idempotent: existing rows (matched by slug) are left untouched, so edits made
// in the CMS are never overwritten. Images are only imported for projects that
// have none yet.
//
// Usage: npm run db:import   (needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  categories,
  projects,
  draftCurrent,
  statistics,
  capabilities,
} from "./legacy-data.mjs";

const LEGACY = "https://fortuneelectrical.com";
const UA = { "User-Agent": "Mozilla/5.0 (Fortune site migration)" };
const CACHE = path.resolve(".cache/legacy-images");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

function must({ data, error }, what) {
  if (error) throw new Error(`${what}: ${error.message}`);
  return data;
}

async function fetchJson(u) {
  const r = await fetch(u, { headers: UA });
  if (!r.ok) throw new Error(`${r.status} ${u}`);
  return r.json();
}

async function download(u) {
  await mkdir(CACHE, { recursive: true });
  const file = path.join(CACHE, decodeURIComponent(u.split("/").pop()));
  if (existsSync(file)) return readFile(file);
  const r = await fetch(u, { headers: UA });
  if (!r.ok) throw new Error(`${r.status} ${u}`);
  const buf = Buffer.from(await r.arrayBuffer());
  await writeFile(file, buf);
  return buf;
}

// 64-bit average hash — used to drop thumbnails that duplicate the hero image
async function ahash(buf) {
  const px = await sharp(buf, { animated: false }).grayscale().resize(8, 8, { fit: "fill" }).raw().toBuffer();
  const avg = px.reduce((a, b) => a + b, 0) / px.length;
  return [...px].map((v) => (v >= avg ? 1 : 0));
}
const hamming = (a, b) => a.reduce((n, bit, i) => n + (bit !== b[i] ? 1 : 0), 0);

async function toWebp(buf, maxWidth = 2400) {
  const img = sharp(buf, { animated: false }).rotate();
  const meta = await img.metadata();
  const out = await img
    .resize({ width: Math.min(meta.width ?? maxWidth, maxWidth), withoutEnlargement: true })
    .webp({ quality: 86 })
    .toBuffer({ resolveWithObject: true });
  return { data: out.data, width: out.info.width, height: out.info.height };
}

async function upload(storagePath, data) {
  must(
    await db.storage.from("media").upload(storagePath, data, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: true,
    }),
    `upload ${storagePath}`,
  );
}

// ---------------------------------------------------------------- categories
console.log("categories…");
must(
  await db.from("project_categories").upsert(categories, { onConflict: "slug", ignoreDuplicates: true }),
  "categories",
);
const catRows = must(await db.from("project_categories").select("id, slug"), "categories read");
const catId = Object.fromEntries(catRows.map((c) => [c.slug, c.id]));

// ------------------------------------------------------------------ projects
console.log("projects…");
const existing = new Set(
  must(await db.from("projects").select("slug"), "projects read").map((p) => p.slug),
);

const toRow = (p) => ({
  slug: p.slug,
  name: p.name,
  status: p.status,
  category_id: catId[p.category] ?? null,
  city: p.city ?? null,
  state: "FL",
  location_label: p.location_label ?? null,
  summary: p.summary ?? null,
  description: p.description ? p.description.join("\n\n") : null,
  scope: p.scope ?? [],
  project_value: p.project_value ?? null,
  electrical_contract_value: p.electrical_contract_value ?? null,
  project_size: p.project_size ?? null,
  square_feet: p.square_feet ?? null,
  stories: p.stories ?? null,
  units: p.units ?? null,
  general_contractor: p.general_contractor ?? null,
  owner: p.owner ?? null,
  architect: p.architect ?? null,
  featured: p.featured ?? false,
  published: true,
  display_order: p.display_order ?? 1000,
});

const newRows = projects.filter((p) => !existing.has(p.slug)).map(toRow);
const drafts = draftCurrent
  .filter((d) => !existing.has(d.slug))
  .map((d, i) => ({
    slug: d.slug,
    name: d.name,
    status: "current",
    category_id: catId[d.category] ?? null,
    state: "FL",
    published: false,
    display_order: 2 + i,
  }));
// Inserted separately: a bulk insert sends the union of columns, so rows
// missing a key would get NULL instead of the column default.
if (newRows.length) must(await db.from("projects").insert(newRows), "projects insert");
if (drafts.length) must(await db.from("projects").insert(drafts), "drafts insert");
console.log(`  inserted ${newRows.length} projects, ${drafts.length} drafts`);

const projRows = must(
  await db.from("projects").select("id, slug, name, hero_image_id"),
  "projects read",
);
const projBySlug = Object.fromEntries(projRows.map((p) => [p.slug, p]));

// -------------------------------------------------------------------- images
console.log("images…");
const legacyProjects = await fetchJson(`${LEGACY}/wp-json/wp/v2/project?per_page=100`);
const legacyBySlug = Object.fromEntries(legacyProjects.map((p) => [p.slug, p]));

for (const p of projects) {
  const proj = projBySlug[p.slug];
  const legacy = legacyBySlug[p.legacy];
  if (!proj || !legacy) {
    console.warn(`  ! missing ${p.slug}`);
    continue;
  }
  const { count } = await db
    .from("project_images")
    .select("id", { count: "exact", head: true })
    .eq("project_id", proj.id);
  if (count) continue;

  const urls = [];
  if (legacy.featured_media) {
    const media = await fetchJson(`${LEGACY}/wp-json/wp/v2/media/${legacy.featured_media}`);
    urls.push(media.source_url);
  }
  for (const m of legacy.content.rendered.matchAll(/<img[^>]+src="([^"]+)"/g)) urls.push(m[1]);

  const kept = [];
  for (const src of urls) {
    try {
      const raw = await download(src);
      const hash = await ahash(raw);
      if (kept.some((k) => hamming(k.hash, hash) <= 6)) continue; // same photo, smaller copy
      kept.push({ src, raw, hash });
    } catch (e) {
      console.warn(`  ! ${src}: ${e.message}`);
    }
  }

  const rows = [];
  for (const [i, k] of kept.entries()) {
    const { data, width, height } = await toWebp(k.raw);
    const storagePath = `projects/${p.slug}/${String(i + 1).padStart(2, "0")}-legacy.webp`;
    await upload(storagePath, data);
    rows.push({
      project_id: proj.id,
      storage_path: storagePath,
      width,
      height,
      alt: `${p.name}${p.city ? `, ${p.city}, Florida` : ""}`,
      sort_order: i,
      source_url: k.src,
    });
  }
  if (!rows.length) continue;
  const inserted = must(
    await db.from("project_images").insert(rows).select("id, sort_order"),
    `images ${p.slug}`,
  );
  const hero = inserted.find((r) => r.sort_order === 0);
  must(await db.from("projects").update({ hero_image_id: hero.id }).eq("id", proj.id), "hero");
  console.log(`  ${p.slug}: ${rows.length} image(s)`);
}

// --------------------------------------------------------------- site images
console.log("site images…");
const siteImages = [
  ["site/hero-new-construction.webp", `${LEGACY}/wp-content/uploads/2026/01/New-Construction.jpg`],
  ["site/electrical-construction.webp", `${LEGACY}/wp-content/uploads/2026/01/Electrical-Construction.png`],
];
for (const [dest, src] of siteImages) {
  const { data } = await toWebp(await download(src));
  await upload(dest, data);
}

// ----------------------------------------------------------------- settings
console.log("settings…");
const { data: home } = await db.from("homepage_settings").select("id").maybeSingle();
if (!home) {
  must(
    await db.from("homepage_settings").insert({
      id: 1,
      hero_eyebrow: "Commercial Electrical Contractor · Florida",
      hero_headline: "Powering Florida's biggest builds.",
      hero_subheadline:
        "Airports, schools, courthouses, senior living and multifamily communities — delivered fast-track, on schedule, by field-proven electricians.",
      hero_image_path: "site/hero-new-construction.webp",
      featured_project_id: projBySlug["rsw-airport-terminal-expansion"]?.id ?? null,
      current_intro: "What our crews are building right now.",
      upcoming_intro: "Awarded work in our pipeline.",
      portfolio_intro: "Two decades of commercial, institutional and multifamily work across Florida.",
      capabilities,
      industries_intro: "From terminals to classrooms to 400-unit communities — we've built projects like yours.",
      cta_heading: "Have a big project coming up?",
      cta_subheading: "Bring us in early. Our preconstruction and estimating team is ready to price it.",
    }),
    "homepage",
  );
}

const { data: site } = await db.from("site_settings").select("id").maybeSingle();
if (!site) {
  must(
    await db.from("site_settings").insert({
      id: 1,
      company_name: "Fortune Electrical Construction",
      legal_name: "Fortune Electrical Construction, LLC",
      tagline: "Setting the standard in commercial electrical construction.",
      phone: "(239) 674-3171",
      address_line1: "2950 Van Buren St",
      city: "Fort Myers",
      state: "FL",
      postal_code: "33916",
      service_area: "Serving markets throughout Florida",
      default_seo_title: "Fortune Electrical Construction | Commercial Electrical Contractor in Florida",
      default_seo_description:
        "Fortune Electrical Construction is a Florida commercial electrical contractor delivering aviation, education, government, senior living and multifamily projects.",
      affiliations: [
        { name: "Electrical Council of Florida", image: "/brand/aff-ecf.png" },
        { name: "Associated Builders and Contractors — Florida Gulf Coast", image: "/brand/aff-abc-fgc.png" },
        { name: "American Subcontractors Association of Southwest Florida", image: "/brand/aff-asa-swfl.png" },
      ],
    }),
    "site",
  );
}

// ---------------------------------------------------------------- statistics
const { count: statCount } = await db
  .from("company_statistics")
  .select("id", { count: "exact", head: true });
if (!statCount) {
  const rows = statistics.map((s) => ({
    value: null,
    prefix: null,
    suffix: null,
    compact: false,
    description: null,
    ...s,
  }));
  must(await db.from("company_statistics").insert(rows), "statistics");
}

console.log("done.");
