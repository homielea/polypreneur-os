import "server-only";
import { hasGitHub, hasGoogle, hasNotion, env } from "@/lib/env";
import type { IntegrationStatus } from "./types";

/** Status of every v1 integration — live (read) and stubbed (§11.1). */
export function integrationStatuses(): IntegrationStatus[] {
  return [
    {
      key: "notion",
      label: "Notion",
      mode: "live",
      configured: hasNotion,
      note: hasNotion
        ? "Reading recently-edited pages as content activity."
        : "Set NOTION_API_KEY to read pages shared with the integration.",
    },
    {
      key: "google_calendar",
      label: "Google Calendar",
      mode: "live",
      configured: hasGoogle && Boolean(env.googleCalendarId),
      note:
        hasGoogle && env.googleCalendarId
          ? "Reading recent events as calendar-time activity."
          : "Set the Google service account + GOOGLE_CALENDAR_ID.",
    },
    {
      key: "github",
      label: `GitHub (${env.githubRepo})`,
      mode: "live",
      configured: hasGitHub,
      note: hasGitHub
        ? "Reading recent commits as commit activity."
        : "Set GITHUB_TOKEN + GITHUB_OWNER to read commits.",
    },
    {
      key: "gmail",
      label: "Gmail",
      mode: "stubbed",
      configured: false,
      note: "Stubbed in v1 (§11.1).",
    },
    {
      key: "beehiiv",
      label: "Beehiiv",
      mode: "stubbed",
      configured: false,
      note: "Stubbed in v1 — approved scripts are copied out manually.",
    },
    {
      key: "vidiq",
      label: "vidIQ",
      mode: "stubbed",
      configured: false,
      note: "Stubbed in v1 (§11.1).",
    },
  ];
}
