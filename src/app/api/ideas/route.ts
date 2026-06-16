import { type NextRequest } from "next/server";
import { badRequest, handler } from "@/lib/api";
import { insert, list, newId, nowIso } from "@/lib/db";
import type { Idea } from "@/lib/types";

export const dynamic = "force-dynamic";

export function GET() {
  return handler(async () => {
    const ideas = await list("idea");
    ideas.sort((a, b) => b.captured_at.localeCompare(a.captured_at));
    return ideas;
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<Idea>;
  if (!body.title?.trim()) return badRequest("Idea title is required.");
  const idea: Idea = {
    id: newId(),
    title: body.title.trim(),
    note: body.note?.trim() ?? "",
    captured_at: nowIso(),
    status: "vault",
  };
  return handler(() => insert("idea", idea));
}
