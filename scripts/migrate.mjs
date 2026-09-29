// Applies supabase/migrations/*.sql in order, once each.
// Usage: npm run db:migrate   (reads SUPABASE_DB_URL from .env.local)
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error("SUPABASE_DB_URL is not set in .env.local");
  process.exit(1);
}

const dir = path.resolve("supabase/migrations");
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

await client.query(`
  create schema if not exists private;
  create table if not exists private.schema_migrations (
    name text primary key,
    applied_at timestamptz not null default now()
  );
`);

const applied = new Set(
  (await client.query("select name from private.schema_migrations")).rows.map((r) => r.name),
);
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

for (const file of files) {
  if (applied.has(file)) {
    console.log(`skip  ${file}`);
    continue;
  }
  const sql = await readFile(path.join(dir, file), "utf8");
  try {
    await client.query("begin");
    await client.query(sql);
    await client.query("insert into private.schema_migrations (name) values ($1)", [file]);
    await client.query("commit");
    console.log(`apply ${file}`);
  } catch (err) {
    await client.query("rollback");
    console.error(`FAILED ${file}: ${err.message}`);
    process.exitCode = 1;
    break;
  }
}

await client.end();
