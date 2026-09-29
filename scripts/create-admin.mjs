// Creates (or promotes) a CMS admin and prints a one-time link to set a password.
// Usage: npm run admin:create -- you@company.com [owner|editor]
// Set SITE_URL to generate the link for production instead of localhost.
import { createClient } from "@supabase/supabase-js";

const [email, role = "owner"] = process.argv.slice(2);
if (!email) {
  console.error("Usage: npm run admin:create -- you@company.com [owner|editor]");
  process.exit(1);
}

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

let userId;
const { data: list, error: listErr } = await db.auth.admin.listUsers({ perPage: 1000 });
if (listErr) throw listErr;
const found = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

if (found) {
  userId = found.id;
  console.log(`Existing user ${email}`);
} else {
  const { data, error } = await db.auth.admin.createUser({ email, email_confirm: true });
  if (error) throw error;
  userId = data.user.id;
  console.log(`Created user ${email}`);
}

const { error } = await db.from("admin_users").upsert({ user_id: userId, role });
if (error) throw error;

const { data: link, error: linkErr } = await db.auth.admin.generateLink({ type: "recovery", email });
if (linkErr) throw linkErr;

// Our /auth/confirm route verifies the token server-side and sets the session cookie.
const site = process.env.SITE_URL ?? "http://localhost:3000";
const url = new URL("/auth/confirm", site);
url.searchParams.set("token_hash", link.properties.hashed_token);
url.searchParams.set("type", "recovery");
url.searchParams.set("next", "/admin/account?welcome=1");

console.log(`\n${email} is now an admin (${role}).`);
console.log("Open this one-time link to set a password (expires in 1 hour):\n");
console.log(url.toString());
