// Imports the team (names, titles, emails, photos) from fortuneelectrical.com/team
// and seeds job openings from the roles on the legacy employment application.
// Idempotent: skips people/jobs that already exist (matched by name/title).
//
// Usage: npm run db:import-team
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const U = "https://fortuneelectrical.com/wp-content/uploads";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Order, groups, titles and emails exactly as on the legacy team page.
const team = [
  ["Leadership", "Matt Ferreira", "President", "mattferreira@fortuneelectrical.com", `${U}/2026/04/Matt-Ferreira-President-1.webp`],
  ["Leadership", "Bob Gesek", "VP of Operations", "bobgesek@fortuneelectrical.com", `${U}/2026/01/Bob-Gesek-VP-Operations-scaled.jpg`],
  ["Leadership", "Mike Silverman", "Director of Fire Alarm and Low Voltage", "mikesilverman@fortuneelectrical.com", `${U}/2026/01/Mike-Silverman-Director-of-Fire-Alarm-Low-Voltage.png`],
  ["Leadership", "Kyle Gesek", "Director of Specialty Projects", "kylegesek@fortuneelectrical.com", `${U}/2026/01/Kyle-Gesek-Director-of-Specialty-Projects-scaled.jpg`],
  ["Leadership", "Justin Gibens", "Director of Human Resources", "justingibens@fortuneelectrical.com", `${U}/2026/04/Justin-Gibens.webp`],
  ["Leadership", "Nye DeAngelis", "Office Manager", "nayrovideangelis@fortuneelectrical.com", `${U}/2026/01/Nye-DeAngelis-HR-scaled.jpg`],
  ["Leadership", "Jared Ferguson", "Safety Director", null, `${U}/2026/01/Jared-Ferguson-–-Safety-Director.jpg`],
  ["Leadership", "Brittney Ford", "Service/Permitting Coordinator", null, `${U}/2026/04/Brittney-Ford.webp`],
  ["Sales", "Dylan Silverman", "Fire Alarm and Low Voltage Sales", "dylansilverman@fortuneelectrical.com", `${U}/2026/01/Dylan-Silverman-Fire-Alarm-scaled.jpg`],
  ["Project Management", "Kevin Ferreria", "Senior Project Manager", null, `${U}/2026/01/Kevin-Ferreria-–-Senior-Project-Manager.jpg`],
  ["Project Management", "Lee Van Liere", "Senior Project Manager", null, `${U}/2026/01/Lee-Van-Liere-–-Senior-Project-Manager.jpg`],
  ["Project Management", "Alexander Welstad", "Senior Project Manager", null, `${U}/2026/01/Alexander-Welstad-–-Project-Manager.jpg`],
  ["Project Management", "Angel De La Vega", "Project Manager", null, `${U}/2026/01/Angel-De-La-Vega-–-Project-Manager.jpg`],
  ["Project Management", "Steven Ortiz", "Project Manager", null, `${U}/2026/01/Steven-Ortiz-–-Project-Manager.jpg`],
  ["Project Management", "Jemier Pena", "Fire Alarm Project Manager", null, `${U}/2026/01/Jemier-Pena-–-Fire-Alarm-Project-Manager-scaled.jpg`],
  ["Project Management", "Philip Ton", "Project Manager", null, `${U}/2026/01/Philip-Ton-–-Project-Manager.jpg`],
  ["Project Management", "Benjamin Marks", "Purchasing Manager", null, `${U}/2026/04/Benjamin-Marks.webp`],
  ["Project Management", "Leo Mayor", "Pre Construction Manager", null, `${U}/2026/04/Leo-Mayora.webp`],
  ["Estimating", "Edel Gomez", "Estimator", null, `${U}/2026/01/Edel-Gomez-Estimator.jpg`],
  ["Estimating", "Nathanael Hernandez", "Estimator", null, `${U}/2026/01/Nathanael-Hernandez-–-Estimator.jpg`],
  ["Estimating", "Johnathan Slezak", "Estimator", null, `${U}/2026/01/Johnathan-Slezak-–-Estimator-scaled.jpg`],
  ["Estimating", "Micheil Strode", "Estimator", null, `${U}/2026/04/Micheil-Strode.webp`],
];

// Roles listed on the legacy "Application for Employment" form.
const jobs = [
  ["Project Manager", "Project Management", "Manage commercial electrical projects from preconstruction through closeout."],
  ["Estimator", "Estimating", "Quantity takeoffs and bids for commercial, institutional and multifamily work."],
  ["Foreman", "Field", "Lead crews on site: schedule, quality and safety."],
  ["Mechanic (Journeyman Electrician)", "Field", "Install and terminate power, lighting and distribution systems."],
  ["Service Technician", "Service", "Troubleshooting, repairs and service calls across the region."],
  ["Apprentice", "Field", "Earn while you learn — we train and support the next generation of electricians."],
  ["Helper", "Field", "Entry-level field role supporting crews on active job sites."],
];

const slug = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const { data: existing } = await db.from("team_members").select("name");
const have = new Set((existing ?? []).map((m) => m.name));

for (const [i, [group, name, title, email, url]] of team.entries()) {
  if (have.has(name)) continue;
  let photo_path = null;
  try {
    const r = await fetch(encodeURI(url).replace(/%25/g, "%"), { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) throw new Error(String(r.status));
    const buf = Buffer.from(await r.arrayBuffer());
    const out = await sharp(buf).rotate().resize({ width: 1000, withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
    photo_path = `team/${slug(name)}.webp`;
    const { error } = await db.storage.from("media").upload(photo_path, out, { contentType: "image/webp", upsert: true, cacheControl: "31536000" });
    if (error) throw error;
  } catch (e) {
    console.warn(`  ! photo for ${name}: ${e.message}`);
  }
  const { error } = await db.from("team_members").insert({ name, title, group_name: group, email, photo_path, sort_order: (i + 1) * 10 });
  if (error) throw error;
  console.log(`  ${name}${photo_path ? "" : " (no photo)"}`);
}

const { count } = await db.from("job_openings").select("id", { count: "exact", head: true });
if (!count) {
  const { error } = await db.from("job_openings").insert(
    jobs.map(([title, department, summary], i) => ({
      title,
      department,
      location: "Florida",
      employment_type: title === "Apprentice" ? "Apprenticeship" : "Full-time",
      summary,
      sort_order: (i + 1) * 10,
    })),
  );
  if (error) throw error;
  console.log(`  seeded ${jobs.length} job openings`);
}
console.log("done.");
