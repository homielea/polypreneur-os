/**
 * Notion read adapter. Projects recently-edited pages as `content_shipped`
 * activity signals. Env-gated via NOTION_API_KEY. Reads only pages the
 * integration has been shared with (search), per "read, don't replace".
 */

import "server-only";
import { Client } from "@notionhq/client";
import { env, hasNotion } from "@/lib/env";
import type { ExternalSignal } from "./types";

function pageTitle(page: Record<string, unknown>): string {
  const props = (page.properties ?? {}) as Record<string, any>;
  for (const prop of Object.values(props)) {
    if (prop?.type === "title" && Array.isArray(prop.title)) {
      const text = prop.title.map((t: any) => t.plain_text).join("");
      if (text) return text;
    }
  }
  return "(untitled)";
}

export async function notionSignals(): Promise<ExternalSignal[]> {
  if (!hasNotion) return [];

  const notion = new Client({ auth: env.notionKey });
  const res = await notion.search({
    filter: { property: "object", value: "page" },
    sort: { direction: "descending", timestamp: "last_edited_time" },
    page_size: 50,
  });

  const signals: ExternalSignal[] = [];
  for (const page of res.results as Record<string, any>[]) {
    const edited = page.last_edited_time as string | undefined;
    if (!page.id || !edited) continue;
    const title = pageTitle(page);
    signals.push({
      sourceId: `notion:${page.id}:${edited.slice(0, 10)}`,
      provider: "notion",
      type: "content_shipped",
      title,
      date: edited.slice(0, 10),
      magnitude: 1,
      ventureHint: title,
    });
  }
  return signals;
}
