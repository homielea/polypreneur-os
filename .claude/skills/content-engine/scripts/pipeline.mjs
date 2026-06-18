#!/usr/bin/env node
/**
 * Thin CLI over the Polypreneur content workflow API. Drafts and produces — it
 * never approves or publishes (those gates are the operator's).
 *
 *   pipeline.mjs status     funnel counts
 *   pipeline.mjs run        scan sources + draft pending  (intake + draft)
 *   pipeline.mjs advance    approved pieces -> repurpose + video packages, then draft
 */
const base = process.env.APP_URL ?? "http://localhost:3000";
const cmd = process.argv[2] ?? "status";

async function getJSON(path) {
  const res = await fetch(`${base}${path}`);
  if (!res.ok) throw new Error(`${path} -> ${res.status}: ${await res.text()}`);
  return res.json();
}
async function postJSON(path, body) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}: ${await res.text()}`);
  return res.json();
}

try {
  if (cmd === "status") {
    console.log(JSON.stringify(await getJSON("/api/workflow/status"), null, 2));
  } else if (cmd === "run") {
    const r = await postJSON("/api/workflow/run", { intake: true, draft: true });
    console.log(JSON.stringify(r, null, 2));
    console.log(`\nAwaiting approval: ${r.funnel.awaitingApproval}. Review in the Approval Inbox / Studio.`);
  } else if (cmd === "advance") {
    const r = await postJSON("/api/workflow/run", {
      advanceRepurpose: true,
      advanceVideo: true,
      draft: true,
    });
    console.log(JSON.stringify(r, null, 2));
    console.log(`\nAwaiting approval: ${r.funnel.awaitingApproval}. Nothing was approved or published.`);
  } else {
    console.error(`Unknown command "${cmd}". Use: status | run | advance`);
    process.exit(1);
  }
} catch (err) {
  console.error(String(err));
  process.exit(1);
}
