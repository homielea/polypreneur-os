#!/usr/bin/env node
/**
 * Apply the SQL migrations in supabase/migrations to your Supabase Postgres.
 *
 * Requires a direct connection string in SUPABASE_DB_URL (Supabase dashboard →
 * Project Settings → Database → Connection string) and `psql` on PATH. If you
 * prefer the Supabase CLI, `supabase db push` works against the same files.
 */
import "dotenv/config";
import { readdirSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const dir = path.join(process.cwd(), "supabase", "migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.log("SUPABASE_DB_URL not set. Either:");
  console.log("  • set it and re-run `npm run db:migrate`, or");
  console.log("  • run `supabase db push`, or");
  console.log("  • paste each file below into the Supabase SQL editor:\n");
  for (const f of files) console.log("   ", path.join("supabase/migrations", f));
  process.exit(0);
}

for (const f of files) {
  const full = path.join(dir, f);
  console.log(`Applying ${f} ...`);
  const res = spawnSync("psql", [dbUrl, "-v", "ON_ERROR_STOP=1", "-f", full], {
    stdio: "inherit",
  });
  if (res.status !== 0) process.exit(res.status ?? 1);
}
console.log("Migrations applied.");
