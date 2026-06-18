import { handler } from "@/lib/api";
import { list } from "@/lib/db";

export const dynamic = "force-dynamic";

export function GET() {
  return handler(async () => {
    const jobs = await list("agent_job");
    jobs.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return jobs;
  });
}
