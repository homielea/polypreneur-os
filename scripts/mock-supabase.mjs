/**
 * Minimal in-memory mock of the two Supabase APIs this app talks to —
 * GoTrue (`/auth/v1/*`) and PostgREST (`/rest/v1/*`) — just enough surface
 * for the live-e2e harness to drive the real UI end-to-end without network
 * access to the hosted project (`E2E_MOCK=1`, see live-e2e.mjs).
 *
 * Deliberately NOT a faithful Supabase: no signature verification, no SQL,
 * only the filters/headers the app actually sends. RLS is approximated by
 * scoping actions/score_events to the bearer token's user. Email
 * confirmation is off (signup returns a session), matching the happy path
 * the live pass expects.
 */

import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");

export function startMockSupabase({ port = 54321 } = {}) {
  const users = new Map(); // email → { id, email, password }
  const refreshTokens = new Map(); // token → userId
  const tables = {
    actions: [],
    score_events: [],
    ledger_entries: [],
    ideas: [],
    waitlist_signups: [],
  };

  const makeSession = (user) => {
    const refresh = randomUUID();
    refreshTokens.set(refresh, user.id);
    const now = Math.floor(Date.now() / 1000);
    const access = [
      b64url({ alg: "HS256", typ: "JWT" }),
      b64url({ sub: user.id, email: user.email, role: "authenticated", exp: now + 3600 }),
      "mock-signature",
    ].join(".");
    return {
      access_token: access,
      token_type: "bearer",
      expires_in: 3600,
      expires_at: now + 3600,
      refresh_token: refresh,
      user: publicUser(user),
    };
  };

  const publicUser = (u) => ({
    id: u.id,
    aud: "authenticated",
    role: "authenticated",
    email: u.email,
    email_confirmed_at: u.createdAt,
    created_at: u.createdAt,
    updated_at: u.createdAt,
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
    identities: [],
  });

  const userFromAuth = (req) => {
    const bearer = (req.headers.authorization ?? "").replace(/^Bearer\s+/i, "");
    const parts = bearer.split(".");
    if (parts.length !== 3) return null;
    try {
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
      return payload.role === "authenticated" ? { id: payload.sub } : null;
    } catch {
      return null;
    }
  };

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    const send = (status, body, headers = {}) => {
      res.writeHead(status, {
        "access-control-allow-origin": "*",
        "access-control-allow-headers":
          "authorization, apikey, content-type, prefer, accept, accept-profile, " +
          "content-profile, x-client-info, x-supabase-api-version, range",
        "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
        ...headers,
      });
      res.end(body !== undefined ? JSON.stringify(body) : undefined);
    };

    if (req.method === "OPTIONS") return send(204);

    let body = null;
    if (req.method === "POST" || req.method === "PATCH") {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const raw = Buffer.concat(chunks).toString();
      try {
        body = raw ? JSON.parse(raw) : null;
      } catch {
        return send(400, { code: "PGRST102", message: "Invalid JSON body" });
      }
    }

    // ---------- GoTrue ----------
    if (url.pathname === "/auth/v1/health") {
      return send(200, { version: "mock", name: "GoTrue (mock)" });
    }
    if (url.pathname === "/auth/v1/signup" && req.method === "POST") {
      const email = String(body?.email ?? "").toLowerCase();
      if (users.has(email)) {
        return send(400, { code: 400, error_code: "user_already_exists", msg: "User already registered" });
      }
      const user = {
        id: randomUUID(),
        email,
        password: body?.password,
        createdAt: new Date().toISOString(),
      };
      users.set(email, user);
      return send(200, makeSession(user)); // autoconfirm: session right away
    }
    if (url.pathname === "/auth/v1/token" && req.method === "POST") {
      const grant = url.searchParams.get("grant_type");
      if (grant === "password") {
        const user = users.get(String(body?.email ?? "").toLowerCase());
        if (!user || user.password !== body?.password) {
          return send(400, { code: 400, error_code: "invalid_credentials", msg: "Invalid login credentials" });
        }
        return send(200, makeSession(user));
      }
      if (grant === "refresh_token") {
        const userId = refreshTokens.get(body?.refresh_token);
        const user = [...users.values()].find((u) => u.id === userId);
        if (!user) return send(400, { code: 400, error_code: "refresh_token_not_found", msg: "Invalid Refresh Token" });
        return send(200, makeSession(user));
      }
      return send(400, { code: 400, msg: `unsupported grant_type ${grant}` });
    }
    if (url.pathname === "/auth/v1/user" && req.method === "GET") {
      const auth = userFromAuth(req);
      const user = auth && [...users.values()].find((u) => u.id === auth.id);
      if (!user) return send(401, { code: 401, msg: "invalid token" });
      return send(200, publicUser(user));
    }
    if (url.pathname === "/auth/v1/logout" && req.method === "POST") return send(204);

    // ---------- PostgREST ----------
    const rest = url.pathname.match(/^\/rest\/v1\/(\w+)$/);
    if (rest) {
      const table = rest[1];
      const rows = tables[table];
      if (!rows) return send(404, { code: "42P01", message: `relation "${table}" does not exist` });

      const auth = userFromAuth(req);
      // Real PostgREST 401s a missing/invalid user JWT on RLS-protected tables;
      // only the waitlist accepts anonymous (insert-only) access.
      if (table !== "waitlist_signups" && !auth) {
        return send(401, { code: "PGRST301", message: "JWT expired or invalid" });
      }
      const scoped = table === "waitlist_signups" ? null : auth;

      // RLS approximation: authenticated tables only ever see the caller's rows.
      const visible = () => (scoped ? rows.filter((r) => r.user_id === scoped.id) : []);

      const matches = (row) => {
        for (const [key, values] of [...url.searchParams].reduce((m, [k, v]) => {
          if (!["select", "order", "limit", "offset"].includes(k)) (m.get(k) ?? m.set(k, []).get(k)).push(v);
          return m;
        }, new Map())) {
          for (const value of values) {
            const [op, ...rest2] = value.split(".");
            const operand = rest2.join(".");
            const cell = row[key];
            if (op === "eq" && String(cell) !== operand) return false;
            if (op === "gte" && !(String(cell) >= operand)) return false;
            if (op === "lte" && !(String(cell) <= operand)) return false;
          }
        }
        return true;
      };

      const project = (row) => {
        const select = url.searchParams.get("select");
        if (!select || select === "*") return { ...row };
        return Object.fromEntries(select.split(",").map((c) => [c.trim(), row[c.trim()]]));
      };

      const wantsObject = (req.headers.accept ?? "").includes("vnd.pgrst.object+json");
      const wantsRepresentation = (req.headers.prefer ?? "").includes("return=representation");
      const reply = (status, result) => {
        if (wantsObject) {
          if (result.length !== 1) {
            return send(406, { code: "PGRST116", message: `JSON object requested, multiple (or no) rows returned: ${result.length}` });
          }
          return send(status, result[0]);
        }
        return send(status, result);
      };

      if (req.method === "GET") {
        let result = visible().filter(matches);
        const order = url.searchParams.get("order");
        if (order) {
          const [col, dir] = order.split(".");
          result = [...result].sort((a, b) =>
            (String(a[col]) < String(b[col]) ? -1 : String(a[col]) > String(b[col]) ? 1 : 0) *
            (dir === "desc" ? -1 : 1),
          );
        }
        return reply(200, result.map(project));
      }

      if (req.method === "POST") {
        const inputs = Array.isArray(body) ? body : [body];
        const inserted = [];
        for (const input of inputs) {
          if (table === "waitlist_signups" && rows.some((r) => r.email === input.email)) {
            return send(409, {
              code: "23505",
              message: 'duplicate key value violates unique constraint "waitlist_signups_email_key"',
              details: `Key (email)=(${input.email}) already exists.`,
              hint: null,
            });
          }
          if (table !== "waitlist_signups" && (!scoped || input.user_id !== scoped.id)) {
            return send(403, { code: "42501", message: `new row violates row-level security policy for table "${table}"` });
          }
          const row = {
            id: randomUUID(),
            created_at: new Date().toISOString(),
            ...(table === "actions" ? { status: "open", completed_at: null } : {}),
            ...input,
          };
          rows.push(row);
          inserted.push(row);
        }
        if (!wantsRepresentation && !wantsObject) return send(201);
        return reply(201, inserted.map(project));
      }

      if (req.method === "PATCH") {
        const updated = [];
        for (const row of visible().filter(matches)) {
          Object.assign(row, body);
          updated.push(row);
        }
        if (!wantsRepresentation) return send(204);
        return reply(200, updated.map(project));
      }

      if (req.method === "DELETE") {
        const doomed = new Set(visible().filter(matches).map((r) => r.id));
        tables[table] = rows.filter((r) => !doomed.has(r.id));
        return send(204);
      }
    }

    return send(404, { message: `mock: unhandled ${req.method} ${url.pathname}` });
  });

  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () =>
      resolve({
        url: `http://127.0.0.1:${port}`,
        anonKey: "mock-anon-key",
        close: () => new Promise((r) => server.close(r)),
      }),
    );
  });
}
