import { handler } from "@/lib/api";
import { pipelineStatus } from "@/lib/workflow";

export const dynamic = "force-dynamic";

export function GET() {
  return handler(() => pipelineStatus());
}
