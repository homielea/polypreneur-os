#!/usr/bin/env node
/**
 * Live end-to-end pass against the real Supabase project (see BLOCKERS.md):
 *
 *   auth (signup or signin) → create action → complete it → weekly totals,
 *   plus persistence across reload and an anonymous waitlist signup.
 *
 * Drives the real UI (production build served by `vite preview`) in headless
 * Chromium — nothing is mocked.
 *
 * Usage:
 *   npm run e2e:live
 *
 * Environment:
 *   VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — read from .env, falling back
 *     to .env.example, falling back to the process environment.
 *   E2E_EMAIL / E2E_PASSWORD — use an existing (confirmed) account instead of
 *     signing up a fresh one. Required if the project has "Confirm email" on.
 *   E2E_KEEP_DATA=1 — skip deleting the rows the run created.
 *   E2E_UI_SMOKE=1 — skip Supabase entirely; just build, serve, and check the
 *     logged-out landing + login pages render (validates the harness itself).
 *   E2E_MOCK=1 — run every step against a local in-memory Supabase mock
 *     (scripts/mock-supabase.mjs) instead of the hosted project. Verifies the
 *     app + harness end-to-end without network, but is NOT the live pass:
 *     the real schema, RLS, and auth settings stay unverified.
 *
 * Exit codes: 0 pass · 1 step failed · 2 Supabase unreachable (network policy).
 */

import { spawn, execSync, execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.E2E_PORT ?? 4173);
const HOST = "127.0.0.1"; // explicit v4: some sandboxes have no IPv6, and `localhost` may resolve to ::1
const BASE = `http://${HOST}:${PORT}`;
const UI_SMOKE = process.env.E2E_UI_SMOKE === "1";

// ---------- env ----------

function loadDotEnv(file) {
  const p = path.join(root, file);
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const MOCK = process.env.E2E_MOCK === "1";
const dotenv = { ...loadDotEnv(".env.example"), ...loadDotEnv(".env") };
let SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? dotenv.VITE_SUPABASE_URL;
let SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ?? dotenv.VITE_SUPABASE_ANON_KEY;

let mock = null;
if (MOCK) {
  const { startMockSupabase } = await import("./mock-supabase.mjs");
  mock = await startMockSupabase({ port: Number(process.env.E2E_MOCK_PORT ?? 54321) });
  SUPABASE_URL = mock.url;
  SUPABASE_ANON_KEY = mock.anonKey;
  console.log(
    `MOCK MODE — app flow verified against a local Supabase mock (${mock.url}).` +
      " This is NOT the live pass: real schema/RLS/auth settings stay unverified.",
  );
}

if (!UI_SMOKE && !MOCK && (!SUPABASE_URL || !SUPABASE_ANON_KEY)) {
  console.error("✗ No Supabase credentials found (.env / .env.example / env vars).");
  process.exit(1);
}

const stamp = `${Date.now().toString(36)}-${process.pid.toString(36)}`;
const EMAIL = process.env.E2E_EMAIL ?? `homielea+e2e-${stamp}@gmail.com`;
const PASSWORD = process.env.E2E_PASSWORD ?? `E2e!${stamp}${stamp.split("").reverse().join("")}`;
const usingProvidedAccount = Boolean(process.env.E2E_EMAIL);
const ACTION_TITLE = `e2e verify ${stamp}`;
const CATEGORY = "e2e";
const LEVERAGE = 3; // composer default — completion should record +3 in "e2e"

const passed = [];
const step = (name) => {
  passed.push(name);
  console.log(`  ✓ ${name}`);
};

// ---------- preflight ----------

const PROXY = process.env.HTTPS_PROXY || process.env.https_proxy || null;

async function supabaseReachable() {
  const url = `${SUPABASE_URL}/auth/v1/health`;
  try {
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_ANON_KEY },
      signal: AbortSignal.timeout(15000),
    });
    if (res.ok) return null;
    return `auth health returned ${res.status}`;
  } catch (err) {
    // Node's fetch ignores HTTPS_PROXY; in proxied sandboxes retry via curl,
    // which honors the proxy env and the pre-configured CA bundle.
    if (PROXY) {
      try {
        const code = execFileSync(
          "curl",
          ["-sS", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "15",
            "-H", `apikey: ${SUPABASE_ANON_KEY}`, url],
          { encoding: "utf8" },
        ).trim();
        if (code.startsWith("2")) return null;
        return `auth health returned ${code} (via proxy)`;
      } catch (curlErr) {
        return String(curlErr.message ?? curlErr).split("\n")[0];
      }
    }
    return String(err.cause?.message ?? err.message ?? err);
  }
}

if (!UI_SMOKE) {
  console.log(`Preflight: checking ${SUPABASE_URL} is reachable…`);
  const unreachable = await supabaseReachable();
  if (!unreachable) {
    step(MOCK ? "mock Supabase up (auth health OK)" : "Supabase reachable (auth health OK)");
  } else if (MOCK) {
    console.error(`✗ Local mock did not come up: ${unreachable}`);
    process.exit(1);
  } else {
    console.error(`✗ Cannot reach the Supabase project: ${unreachable}`);
    console.error(
      "  This is the known BLOCKERS.md item: the environment's network policy" +
        " must allow *.supabase.co (claude.ai/code → environment → network settings)." +
        " Re-run `npm run e2e:live` from a session where that host is reachable.",
    );
    process.exit(2);
  }
}

// ---------- build + serve ----------

console.log("Building production bundle…");
execSync("npx vite build", {
  cwd: root,
  stdio: ["ignore", "ignore", "inherit"],
  env: {
    ...process.env,
    VITE_SUPABASE_URL: SUPABASE_URL ?? "",
    VITE_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ?? "",
  },
});

console.log(`Serving on ${BASE}…`);
const server = spawn(
  "npx",
  ["vite", "preview", "--host", HOST, "--port", String(PORT), "--strictPort"],
  {
    cwd: root,
    stdio: "ignore",
  },
);
const stopServer = () => {
  if (!server.killed) server.kill("SIGTERM");
};
process.on("exit", stopServer);

for (let i = 0; ; i++) {
  try {
    await fetch(BASE, { signal: AbortSignal.timeout(1000) });
    break;
  } catch {
    if (i > 30) {
      console.error("✗ vite preview never came up");
      process.exit(1);
    }
    await sleep(500);
  }
}

// ---------- browser ----------

const { chromium } = await import("playwright");

async function launch() {
  const opts = PROXY
    ? { proxy: { server: PROXY, bypass: `${HOST},localhost` } } // sandbox egress goes through a proxy
    : {};
  try {
    return await chromium.launch(opts);
  } catch (err) {
    // Pre-provisioned browser may not match the installed playwright version.
    const fallback = "/opt/pw-browsers/chromium";
    if (existsSync(fallback)) return chromium.launch({ ...opts, executablePath: fallback });
    throw err;
  }
}

const browser = await launch();
const consoleErrors = [];

async function newPage(context) {
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.setDefaultTimeout(20000);
  return page;
}

let exitCode = 0;
const context = await browser.newContext();
const page = await newPage(context);

try {
  if (UI_SMOKE) {
    // Harness self-check only: logged-out pages render.
    await page.goto(`${BASE}/`);
    await page.getByRole("link", { name: /sign in/i }).first().waitFor();
    step("landing page renders");
    await page.goto(`${BASE}/login`);
    await page.getByLabel("Email").waitFor();
    step("login page renders");
  } else {
    // --- auth ---
    await page.goto(`${BASE}/login`);
    await page.getByLabel("Email").waitFor();

    if (!usingProvidedAccount) {
      await page.getByRole("button", { name: /no account yet/i }).click();
    }
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page
      .getByRole("button", { name: usingProvidedAccount ? "Sign in" : "Sign up" })
      .click();

    if (!usingProvidedAccount) {
      // Either the session starts immediately (email confirmation off) or the
      // form flips to signin mode with an info line — try signing in then.
      const outcome = await Promise.race([
        page.waitForURL("**/app**").then(() => "in"),
        page.getByText(/account created/i).waitFor().then(() => "created"),
        page.locator("p.text-destructive").waitFor().then(() => "error"),
      ]);
      if (outcome === "error") {
        throw new Error(`signup failed: ${await page.locator("p.text-destructive").innerText()}`);
      }
      if (outcome === "created") {
        await page.getByLabel("Email").fill(EMAIL);
        await page.getByLabel("Password").fill(PASSWORD);
        await page.getByRole("button", { name: "Sign in" }).click();
        const signin = await Promise.race([
          page.waitForURL("**/app**").then(() => "in"),
          page.locator("p.text-destructive").waitFor().then(() => "error"),
        ]);
        if (signin === "error") {
          const msg = await page.locator("p.text-destructive").innerText();
          if (/confirm/i.test(msg)) {
            throw new Error(
              `signin blocked: "${msg}". The project has "Confirm email" enabled — ` +
                "either disable it (Supabase → Auth → Providers → Email) or re-run with " +
                "E2E_EMAIL/E2E_PASSWORD set to an existing confirmed account.",
            );
          }
          throw new Error(`signin failed: ${msg}`);
        }
      }
    } else {
      await page.waitForURL("**/app**");
    }
    await page.getByRole("heading", { name: "Today" }).waitFor();
    step(`auth — signed ${usingProvidedAccount ? "in" : "up"} as ${EMAIL}, landed on Today`);

    // --- create ---
    await page.getByLabel("Action title").fill(ACTION_TITLE);
    await page.getByLabel("Category").fill(CATEGORY);
    await page.getByRole("button", { name: "Add", exact: true }).click();
    // :not([data-sonner-toast]) — the success toast is also an <li> that
    // contains the action title, and would trip strict mode / never detach.
    const row = page.locator("li:not([data-sonner-toast])", { hasText: ACTION_TITLE });
    await row.waitFor();
    if (!/leverage/i.test(await row.innerText())) {
      throw new Error("created action row is missing its ranking reason");
    }
    step(`create — "${ACTION_TITLE}" saved and listed with a ranking reason`);

    // --- complete ---
    await page.getByLabel(`Complete ${ACTION_TITLE}`).click();
    await page
      .getByText(`Done. +${LEVERAGE} ${CATEGORY}`)
      .waitFor()
      .catch(() => {
        throw new Error(
          'no "Done. +points" toast — the completion or the score event write failed',
        );
      });
    await row.waitFor({ state: "detached" });
    step(`complete — toast confirmed +${LEVERAGE} ${CATEGORY}, action left the open list`);

    // --- totals ---
    const totals = page.getByText("Gathered this week:");
    await totals.waitFor();
    const readTotal = async () => {
      const text = await totals.locator("xpath=..").innerText();
      const m = text.match(new RegExp(`(\\d+)\\s+${CATEGORY}`));
      return m ? Number(m[1]) : null;
    };
    const total = await readTotal();
    if (total === null || total < LEVERAGE) {
      throw new Error(`weekly total for "${CATEGORY}" is ${total}, expected ≥ ${LEVERAGE}`);
    }
    step(`totals — "Gathered this week" shows ${total} ${CATEGORY}`);

    // --- persistence ---
    await page.reload();
    await page.getByRole("heading", { name: "Today" }).waitFor();
    await page.getByText("Gathered this week:").waitFor();
    const afterReload = await readTotal();
    if (afterReload !== total) {
      throw new Error(`total changed across reload: ${total} → ${afterReload}`);
    }
    step("persistence — session and totals survive a reload");

    // --- waitlist (anonymous) ---
    const anon = await browser.newContext();
    const landing = await newPage(anon);
    await landing.goto(`${BASE}/`);
    const waitlist = landing.getByLabel("Email address").first();
    await waitlist.fill(EMAIL);
    await landing.getByRole("button", { name: "Join the waitlist" }).first().click();
    await landing.getByText(/on the list/i).first().waitFor();
    step("waitlist — anonymous signup accepted on the landing page");
    await anon.close();

    // --- cleanup ---
    if (process.env.E2E_KEEP_DATA !== "1") {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data: auth, error: authErr } = await sb.auth.signInWithPassword({
        email: EMAIL,
        password: PASSWORD,
      });
      if (authErr) {
        console.warn(`  ! cleanup skipped: ${authErr.message}`);
      } else {
        const uid = auth.user.id;
        await sb.from("score_events").delete().eq("user_id", uid);
        await sb.from("actions").delete().eq("user_id", uid);
        await sb.auth.signOut();
        console.log(
          `  · cleaned up test rows (the auth user ${EMAIL} and its waitlist row need` +
            " the dashboard/service key to remove — RLS keeps them invisible to others)",
        );
      }
    }
  }

  console.log(
    `\nPASS${MOCK ? " (MOCK — live pass against the hosted project still required)" : ""} — ` +
      `${passed.length} step${passed.length === 1 ? "" : "s"}:`,
  );
  for (const name of passed) console.log(`  ✓ ${name}`);
  if (consoleErrors.length) {
    console.log(`\n${consoleErrors.length} browser console error(s) observed:`);
    for (const e of consoleErrors.slice(0, 10)) console.log(`  - ${e}`);
  } else {
    console.log("No browser console errors.");
  }
} catch (err) {
  exitCode = 1;
  console.error(`\nFAIL at step ${passed.length + 1}: ${err.message ?? err}`);
  if (passed.length) {
    console.error("Steps that passed before the failure:");
    for (const name of passed) console.error(`  ✓ ${name}`);
  }
  if (consoleErrors.length) {
    console.error("Browser console errors:");
    for (const e of consoleErrors.slice(0, 10)) console.error(`  - ${e}`);
  }
} finally {
  await browser.close();
  stopServer();
  if (mock) await mock.close();
}

process.exit(exitCode);
