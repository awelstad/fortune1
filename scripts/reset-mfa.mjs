// Removes an admin's two-step (authenticator) setup so they can re-enrol at next sign-in.
// Use when someone loses or replaces their phone. Requires the service-role key in .env.local.
// Usage: node --env-file=.env.local scripts/reset-mfa.mjs person@company.com
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: node --env-file=.env.local scripts/reset-mfa.mjs person@company.com");
  process.exit(1);
}
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const { data, error } = await db.auth.admin.listUsers({ perPage: 1000 });
if (error) throw error;
const user = data.users.find((u) => u.email?.toLowerCase() === email);
if (!user) {
  console.error(`No account for ${email}.`);
  process.exit(1);
}
const { data: factors, error: listErr } = await db.auth.admin.mfa.listFactors({ userId: user.id });
if (listErr) throw listErr;
for (const f of factors.factors) {
  const { error: delErr } = await db.auth.admin.mfa.deleteFactor({ userId: user.id, id: f.id });
  if (delErr) throw delErr;
}
console.log(`Removed ${factors.factors.length} authenticator(s) for ${email}. They'll set up a new one at next sign-in.`);
