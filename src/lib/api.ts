import { NextResponse } from "next/server";

/** Wrap a route handler so thrown errors become a clean 500 JSON response. */
export function handler<T>(fn: () => Promise<T>): Promise<NextResponse> {
  return fn()
    .then((data) => NextResponse.json(data ?? { ok: true }))
    .catch((err) => {
      console.error("[api]", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      // Focus-cap violations are an expected, user-facing 409 (§6.5).
      const status = err instanceof Error && err.name === "FocusCapError" ? 409 : 500;
      return NextResponse.json({ error: message }, { status });
    });
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}
