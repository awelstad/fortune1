// Seeds SEO landing pages (services, markets, service areas).
// Copy is drawn from Fortune's own legacy site text and real project data —
// no invented figures or claims. Existing pages (by kind+slug) are left untouched.
// Usage: npm run db:seed-landing
import { createClient } from "@supabase/supabase-js";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const GC_FAQ = {
  q: "Do you work as a subcontractor to general contractors and construction managers?",
  a: "Yes. Most of our commercial work is performed for general contractors and construction managers. Projects on this site were built with Manhattan Construction, Kraft Construction, DeAngelis Diamond, Balfour Beatty, Gilbane, Peter Brown Construction and others.",
};
const AREA_FAQ = {
  q: "Where does Fortune Electrical work?",
  a: "We're headquartered in Fort Myers and focus on Southwest Florida — Lee, Collier, Charlotte and Sarasota counties — and also take on projects elsewhere in Florida.",
};
const BID_FAQ = {
  q: "How do we invite Fortune to bid?",
  a: "Send the project, bid date and a link to the plans through our Invite Us to Bid page, or call the office. Our prequalification packet is available on request.",
};

const services = [
  {
    slug: "commercial-electrical-construction",
    name: "Commercial Electrical Construction",
    headline: "Commercial electrical construction in Southwest Florida",
    seo_title: "Commercial Electrical Contractor in Southwest Florida",
    seo_description:
      "Ground-up and renovation commercial electrical construction across Fort Myers, Naples, Cape Coral and Southwest Florida — schools, courthouses, airports, senior living and more.",
    intro:
      "Complete electrical systems for ground-up and renovation projects: utility coordination, site service, conduit and wiring, service panels, grounding and bonding, power distribution, lighting and low-voltage coordination — through testing, commissioning and owner training.",
    body:
      "We handle everything from small tenant fit-ups to large, multi-phase builds, and scale our crews to the project. Every installation is built to current NEC and local code, and tested and inspected before turnover.\n\nOur process runs from initial consultation and scoping, through design coordination with your architect and trades, permitting and utility coordination, installation, testing and commissioning, to a final walk-through with close-out documentation.",
    faqs: [
      GC_FAQ,
      {
        q: "What size projects do you take on?",
        a: "From small tenant fit-ups to large institutional and commercial facilities — including a 325,000 SF high school campus, a ten-story courthouse tower and the RSW airport terminal expansion.",
      },
      AREA_FAQ,
      BID_FAQ,
    ],
    match: { categories: ["commercial", "education", "government", "aviation", "senior-living", "community", "hospitality"] },
  },
  {
    slug: "power-distribution-switchgear",
    name: "Power Distribution & Switchgear",
    headline: "Power distribution, switchgear & service upgrades",
    seo_title: "Switchgear & Power Distribution Contractor | Southwest Florida",
    seo_description:
      "Switchgear, panelboards, three-phase service and service upgrades for commercial and multifamily buildings in Fort Myers, Naples and Southwest Florida.",
    intro:
      "Panel installations and upgrades, three-phase service, switchgear, sub-panels, and service upgrades for expansion or heavier electrical loads — coordinated with HVAC and equipment trades.",
    body:
      "We install circuits and distribution that are properly routed, labeled and organized to prevent overloads and simplify future maintenance. For occupied buildings, work is phased to keep residents and operations running — as on the full switchboard and panelboard replacement at the 20-story Calusa Harbour tower in Fort Myers.",
    faqs: [
      {
        q: "Can you replace switchgear in an occupied building?",
        a: "Yes. We phase the work to keep the building operating — for example, replacing all panelboards and switchboards throughout the 20-story Calusa Harbour senior living tower while it remained occupied.",
      },
      GC_FAQ,
      BID_FAQ,
    ],
    match: { scope: ["switchgear", "panelboard", "service upgrade", "800a", "electrical service"] },
  },
  {
    slug: "emergency-standby-power",
    name: "Emergency & Standby Power",
    headline: "Emergency generators & standby power",
    seo_title: "Emergency Generator Installation | Commercial Electrical Contractor FL",
    seo_description:
      "Turnkey emergency generator and transfer switch installations — including new compounds and buildings — for mission-critical facilities in Florida.",
    intro:
      "Design and installation of backup power systems, emergency power pathways, transfer switch integration and standby power for facilities that can't go dark.",
    body:
      "We install emergency generators of all sizes as turnkey projects — including new fenced-in compounds or new buildings where needed — with transfer switches serving any portion of a facility, or the entire facility. For the State of Florida Department of Management Services, we installed generators at schools across the state.",
    faqs: [
      {
        q: "Can you provide a complete generator installation?",
        a: "Yes — turnkey installations including the generator, transfer switches, and new fenced compounds or buildings when necessary.",
      },
      AREA_FAQ,
      BID_FAQ,
    ],
    match: { scope: ["generator", "transfer switch", "emergency"] },
  },
  {
    slug: "lighting",
    name: "Commercial Lighting",
    headline: "Interior, site & sports lighting",
    seo_title: "Commercial, Site & Sports Lighting Contractor | Southwest Florida",
    seo_description:
      "Interior, exterior, parking, site and sports-field lighting for schools, parks, churches and commercial facilities across Southwest Florida.",
    intro:
      "Building-wide lighting systems: interior and exterior lighting, parking and site lighting, sports lighting, emergency and exit lighting, energy-efficient fixtures and controls.",
    body:
      "From campus-wide site lighting to sports lighting for football and baseball fields at Island Coast High School, we install lighting built for high-traffic, high-use facilities — and coordinate it with the rest of the electrical system.",
    faqs: [
      {
        q: "Do you install sports-field lighting?",
        a: "Yes — for example, sports lighting for one football field and two baseball fields at Island Coast High School in Cape Coral.",
      },
      GC_FAQ,
      BID_FAQ,
    ],
    match: { scope: ["lighting"] },
  },
  {
    slug: "multifamily-electrical",
    name: "Multifamily Electrical",
    headline: "Multifamily & senior living electrical construction",
    seo_title: "Multifamily Electrical Contractor | Apartments & Senior Living in SW Florida",
    seo_description:
      "Electrical construction for garden-style, podium and wrap apartments, student housing and senior living communities in Southwest Florida.",
    intro:
      "Complete electrical packages for garden-style apartments, podium and wrap communities, student housing, and assisted and senior living — every unit, amenity, garage and site light, delivered by one team.",
    body:
      "We plan service sizing and load capacity for modern building loads, wire every unit and common area, and coordinate with the general contractor, architect and other trades from rough-in to final inspection. Our multifamily work in Southwest Florida and Orlando includes communities of 240 to 440+ units.",
    faqs: [
      {
        q: "What types of multifamily projects do you build?",
        a: "Garden-style apartments, podium and wrap apartment communities, student housing, and assisted living and senior living facilities.",
      },
      GC_FAQ,
      BID_FAQ,
    ],
    match: { categories: ["multifamily", "senior-living"] },
  },
  {
    slug: "tenant-improvements",
    name: "Tenant Improvements & Specialty Projects",
    headline: "Tenant improvements, buildouts & specialty projects",
    seo_title: "Tenant Improvement Electrical Contractor | Fort Myers & Naples",
    seo_description:
      "Fast-moving electrical for tenant improvements, buildouts and remodels — restaurants, retail, offices, banks, clubhouses and warehouses in Southwest Florida.",
    intro:
      "Our Specialty Projects Division handles tenant improvements, light commercial buildouts and remodels with the same planning and field experience as our large commercial work.",
    body:
      "Typical projects include restaurants and cafés, retail and office suites, banks, clubhouses and community centers, and small warehouses. You get experienced electricians, fast mobilization, and the material purchasing power of a large contractor on a smaller job.",
    faqs: [
      {
        q: "Do you take on smaller projects?",
        a: "Yes — our Specialty Projects Division is set up for tenant improvements, buildouts and small remodels, staffed by experienced field electricians.",
      },
      BID_FAQ,
    ],
    match: { scope: ["tenant", "fit-out", "renovat", "remodel", "clubhouse"] },
  },
];

const markets = [
  ["aviation", "Aviation", "Aviation electrical contractor in Southwest Florida",
    "Airport and aviation facilities, including the $331M RSW Airport Terminal Expansion in Fort Myers and the aircraft rescue and firefighting training facility at Charlotte County Airport."],
  ["education", "Education", "School & university electrical contractor in Southwest Florida",
    "Schools and campuses for the Lee County School Board, Charlotte County School Board and Florida Gulf Coast University — including Island Coast High School (291,345 SF) and Ida Baker High School (325,000 SF)."],
  ["government", "Government & Public Safety", "Government & public safety electrical contractor",
    "Courthouses, detention and public safety facilities for Lee County, Collier County and the City of Fort Myers — including the ten-story Lee County Justice Center tower."],
  ["senior-living", "Senior Living & Healthcare", "Senior living & healthcare electrical contractor",
    "Assisted living, memory care and senior living communities across Southwest Florida — from new three-story facilities to a phased remodel and switchgear replacement in an occupied 20-story tower."],
  ["multifamily", "Multifamily", "Multifamily electrical contractor in Southwest Florida",
    "Apartment communities from Cape Coral to Orlando — garden-style, podium and wrap — including The Hadley (444 units), Magnolia Pond (432 units) and Silver Hills at Fort Myers (327 units)."],
  ["commercial", "Commercial & Retail", "Commercial & retail electrical contractor",
    "Retail, office and commercial facilities across Southwest Florida — new construction, conversions and tenant fit-outs."],
  ["community", "Community & Recreation", "Community & recreation electrical contractor",
    "Recreation centers, parks, sports complexes, botanical gardens, churches and clubhouses across Lee and Collier counties."],
].map(([slug, name, headline, intro], i) => ({
  kind: "market",
  slug,
  name,
  headline,
  seo_title: `${headline.replace(/ in Southwest Florida$/, "")} | Southwest Florida`,
  seo_description: `${intro}`.slice(0, 155),
  intro,
  faqs: [GC_FAQ, BID_FAQ],
  match: { categories: [slug] },
  sort_order: (i + 1) * 10,
}));

const areas = [
  ["fort-myers", "Fort Myers", ["Fort Myers", "Fort Myers Beach"],
    "Fortune Electrical Construction is headquartered at 2950 Van Buren St in Fort Myers. Our Fort Myers work includes the RSW Airport Terminal Expansion, the Lee County Justice Center tower, FGCU's Holmes Hall and The Water School, and Calusa Harbour."],
  ["cape-coral", "Cape Coral", ["Cape Coral"],
    "Schools, senior living and multifamily projects in Cape Coral — including Island Coast High School, Ida Baker High School and Gulf Coast Village."],
  ["naples", "Naples", ["Naples", "Marco Island"],
    "Commercial, government, senior living and community projects in Naples and Collier County — including the Naples Jail expansion, Thrive at Naples and the Naples Botanical Garden's Evenstad Horticultural Campus."],
  ["bonita-springs-estero", "Bonita Springs & Estero", ["Bonita Springs", "Estero"],
    "Commercial and public projects in Bonita Springs and Estero, served from our Fort Myers headquarters."],
  ["punta-gorda-port-charlotte", "Punta Gorda & Port Charlotte", ["Punta Gorda", "Port Charlotte", "North Port"],
    "Education and aviation projects in Charlotte County — including the Baker Pre-K Center and the aircraft rescue and firefighting training facility at Charlotte County Airport."],
  ["babcock-ranch", "Babcock Ranch", ["Babcock Ranch"],
    "Multifamily and education projects in Babcock Ranch, including Canopy at Babcock Ranch and Babcock Neighborhood School."],
  ["sanibel-captiva", "Sanibel & Captiva", ["Sanibel", "Captiva"],
    "Island projects including the Sanibel Community Recreation Center and the South Seas Resort marina electrical renovation on Captiva."],
  ["sarasota", "Sarasota", ["Sarasota", "Venice"],
    "Commercial electrical construction for Sarasota County, served from our Fort Myers headquarters."],
  ["lehigh-acres", "Lehigh Acres", ["Lehigh Acres"],
    "Commercial electrical construction for Lehigh Acres and east Lee County, served from our Fort Myers headquarters."],
];

const { data: projects } = await db.from("projects").select("city, location_label, published").eq("published", true).is("archived_at", null);
const count = (cities) =>
  (projects ?? []).filter((p) => cities.includes(p.city) || (cities.includes("Punta Gorda") && p.location_label === "Charlotte County, FL")).length;

const areaRows = areas.map(([slug, name, cities, intro], i) => ({
  kind: "area",
  slug,
  name,
  headline: `Commercial electrical contractor in ${name}`,
  seo_title: `Commercial Electrical Contractor in ${name}, FL`,
  seo_description: `Commercial electrical contractor serving ${name}, FL from our Fort Myers headquarters. Invite Fortune Electrical to bid.`,
  intro,
  faqs: [AREA_FAQ, GC_FAQ, BID_FAQ],
  match: { cities, ...(slug === "punta-gorda-port-charlotte" ? { labels: ["Charlotte County, FL"] } : {}) },
  sort_order: (i + 1) * 10,
  // No thin/doorway pages: publish only where there's real work to show.
  published: count(cities) > 0,
}));

const rows = [
  ...services.map((s, i) => ({ kind: "service", sort_order: (i + 1) * 10, ...s })),
  ...markets,
  ...areaRows,
];

const { data: existing } = await db.from("landing_pages").select("kind, slug");
const have = new Set((existing ?? []).map((r) => `${r.kind}/${r.slug}`));
// Explicit values for every column (a bulk insert would otherwise send NULL for missing keys).
const fresh = rows
  .filter((r) => !have.has(`${r.kind}/${r.slug}`))
  .map((r) => ({ body: null, published: true, faqs: [], match: {}, sort_order: 0, ...r }));
if (fresh.length) {
  const { error } = await db.from("landing_pages").insert(fresh);
  if (error) throw error;
}
console.log(`inserted ${fresh.length} landing pages`);
for (const r of areaRows) console.log(`  area ${r.slug}: ${r.published ? "published" : "draft (no projects yet)"}`);
