#!/usr/bin/env node
/**
 * Load the seed dataset (src/lib/db/seed.ts) into the configured backend by
 * calling the running app's dev seed endpoint. Start the app first (`npm run
 * dev`), then run `npm run db:seed`. Keeps a single source of truth for seed
 * data instead of duplicating it in a script.
 */
const base = process.env.APP_URL ?? "http://localhost:3000";
const res = await fetch(`${base}/api/dev/seed`, { method: "POST" });
const body = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error("Seed failed:", body);
  process.exit(1);
}
console.log("Seeded:", body);
