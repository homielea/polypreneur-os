/**
 * Google Calendar read adapter. Projects recent events as `calendar_time`
 * activity signals. Env-gated via the Google service account + GOOGLE_CALENDAR_ID.
 */

import "server-only";
import { google } from "googleapis";
import { env, hasGoogle } from "@/lib/env";
import type { ExternalSignal } from "./types";

export async function calendarSignals(): Promise<ExternalSignal[]> {
  if (!hasGoogle || !env.googleCalendarId) return [];

  const auth = new google.auth.JWT({
    email: env.googleClientEmail,
    key: env.googlePrivateKey,
    scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
  });
  const calendar = google.calendar({ version: "v3", auth });

  const timeMin = new Date();
  timeMin.setDate(timeMin.getDate() - 30);

  const res = await calendar.events.list({
    calendarId: env.googleCalendarId,
    timeMin: timeMin.toISOString(),
    timeMax: new Date().toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 250,
  });

  const events = res.data.items ?? [];
  const signals: ExternalSignal[] = [];
  for (const e of events) {
    const start = e.start?.dateTime ?? e.start?.date;
    if (!e.id || !start) continue;
    // rough magnitude: hours of scheduled time
    let magnitude = 1;
    if (e.start?.dateTime && e.end?.dateTime) {
      const hrs =
        (new Date(e.end.dateTime).getTime() -
          new Date(e.start.dateTime).getTime()) /
        3_600_000;
      magnitude = Math.max(0.5, Math.round(hrs * 10) / 10);
    }
    signals.push({
      sourceId: `gcal:${e.id}`,
      provider: "google_calendar",
      type: "calendar_time",
      title: e.summary ?? "(busy)",
      date: start.slice(0, 10),
      magnitude,
      ventureHint: e.summary ?? "",
    });
  }
  return signals;
}
