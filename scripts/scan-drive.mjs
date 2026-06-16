#!/usr/bin/env node
/**
 * Trigger a scan of the watched Google Drive folder for new voice notes and
 * enqueue Scribe jobs. This is the v1 "cadence": run it on-demand, or wire it
 * to cron / a Drive push notification later without code changes.
 */
const base = process.env.APP_URL ?? "http://localhost:3000";
const res = await fetch(`${base}/api/drive/scan`, { method: "POST" });
const body = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error("Drive scan failed:", body);
  process.exit(1);
}
console.log("Drive scan:", body);
