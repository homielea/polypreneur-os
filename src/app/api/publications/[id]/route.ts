import { type NextRequest } from "next/server";
import { badRequest, handler } from "@/lib/api";
import { list } from "@/lib/db";
import { cancelPublication, sendPublication } from "@/lib/distribution/publish";

export const dynamic = "force-dynamic";

/** Retry / send-now a publication. */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const pub = (await list("publication")).find((p) => p.id === params.id);
  if (!pub) return badRequest("Publication not found.");
  return handler(() => sendPublication(pub));
}

/** Cancel a scheduled publication. */
export function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  return handler(() => cancelPublication(params.id));
}
