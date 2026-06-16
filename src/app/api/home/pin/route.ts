import { type NextRequest } from "next/server";
import { handler } from "@/lib/api";
import { setPinnedTaskId } from "@/lib/leverage/settings";

export const dynamic = "force-dynamic";

/** Override the recommended move by pinning a task (or clear with null). */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { taskId?: string | null };
  return handler(async () => {
    await setPinnedTaskId(body.taskId ?? null);
    return { ok: true, pinnedTaskId: body.taskId ?? null };
  });
}
