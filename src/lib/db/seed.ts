/**
 * Seed dataset — a realistic single-user (Lea) snapshot so the cockpit is
 * reviewable without live Supabase. Dates are computed relative to "now" so the
 * §6.2 urgency/neglect components produce meaningful, non-stale rankings.
 *
 * Used by the JSON file backend on first run, and by `npm run db:seed` to load
 * the same data into Supabase.
 */

import type { DbSchema, TableName } from "@/lib/types";

type Store = { [K in TableName]: DbSchema[K][] };

function iso(daysFromNow: number): string {
  const d = new Date();
  d.setUTCHours(12, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  return d.toISOString();
}

function ymd(daysFromNow: number): string {
  return iso(daysFromNow).slice(0, 10);
}

export function buildSeed(): Store {
  const vCasaLea = "11111111-1111-4111-8111-111111111111";
  const vNewsletter = "22222222-2222-4222-8222-222222222222";
  const vCourse = "33333333-3333-4333-8333-333333333333";
  const vDormant = "44444444-4444-4444-8444-444444444444";

  return {
    venture: [
      { id: vCasaLea, name: "Casa Lea", status: "primary", created_at: iso(-120) },
      { id: vNewsletter, name: "Lea's Lessons (Newsletter)", status: "primary", created_at: iso(-200) },
      { id: vCourse, name: "Polypreneur Course", status: "experiment", created_at: iso(-40) },
      { id: vDormant, name: "Old Podcast", status: "dormant", created_at: iso(-300) },
    ],

    checkin: [
      { id: "c1", date: ymd(-3), emotional_state: "focused", energy_level: 4, free_text: "Strong morning, shipped the intro.", content_flag: false },
      { id: "c2", date: ymd(-2), emotional_state: "tired", energy_level: 2, free_text: "Low sleep, did admin only.", content_flag: false },
      { id: "c3", date: ymd(-1), emotional_state: "inspired", energy_level: 5, free_text: "Walk-and-talk idea about the Great Inversion landed.", content_flag: true },
      { id: "c4", date: ymd(0), emotional_state: "calm", energy_level: 4, free_text: "Clear head. Want to protect deep-work for Casa Lea.", content_flag: true },
    ],

    habit: [
      { id: "h-sleep", name: "Sleep", target: "8h" },
      { id: "h-deep", name: "Deep-work blocks", target: "2 blocks" },
      { id: "h-casa", name: "Physical Casa Lea work", target: "1 session" },
    ],

    habit_log: [
      { id: "hl1", habit_id: "h-sleep", date: ymd(-3), value: "7.5h" },
      { id: "hl2", habit_id: "h-deep", date: ymd(-3), value: "2" },
      { id: "hl3", habit_id: "h-sleep", date: ymd(-2), value: "5h" },
      { id: "hl4", habit_id: "h-deep", date: ymd(-2), value: "0" },
      { id: "hl5", habit_id: "h-sleep", date: ymd(-1), value: "8h" },
      { id: "hl6", habit_id: "h-casa", date: ymd(-1), value: "1" },
      { id: "hl7", habit_id: "h-sleep", date: ymd(0), value: "8h" },
    ],

    activity: [
      // Casa Lea — recently active
      { id: "a1", venture_id: vCasaLea, date: ymd(-1), type: "commit", source: "github", magnitude: 3 },
      { id: "a2", venture_id: vCasaLea, date: ymd(-4), type: "calendar_time", source: "gcal", magnitude: 2 },
      // Newsletter — going a bit cold (last shipped 9 days ago)
      { id: "a3", venture_id: vNewsletter, date: ymd(-9), type: "content_shipped", source: "manual", magnitude: 5 },
      // Course — moderately neglected
      { id: "a4", venture_id: vCourse, date: ymd(-6), type: "manual", source: "notion", magnitude: 1 },
    ],

    task: [
      { id: "t1", venture_id: vNewsletter, title: "Write this week's Lea's Lessons essay", inversion_tag: "judgment", status: "todo", work_type: "creative", due_date: ymd(1), leverage_score: null },
      { id: "t2", venture_id: vCasaLea, title: "Decide Casa Lea Q3 positioning", inversion_tag: "judgment", status: "todo", work_type: "deep_work", due_date: ymd(2), leverage_score: null },
      { id: "t3", venture_id: vCasaLea, title: "Reconcile last month's receipts", inversion_tag: "execution", status: "todo", work_type: "admin", due_date: ymd(0), leverage_score: null },
      { id: "t4", venture_id: vNewsletter, title: "Format & schedule newsletter in Beehiiv", inversion_tag: "execution", status: "todo", work_type: "admin", due_date: ymd(3), leverage_score: null },
      { id: "t5", venture_id: vCourse, title: "Draft course module outline", inversion_tag: "judgment", status: "todo", work_type: "deep_work", due_date: ymd(10), leverage_score: null },
      { id: "t6", venture_id: vCasaLea, title: "Update README in leaos-hub", inversion_tag: "execution", status: "in_progress", work_type: "other", due_date: null, leverage_score: null },
    ],

    agent_job: [
      {
        id: "j1",
        agent: "scribe",
        format: null,
        venture_id: vNewsletter,
        input_ref: "checkin:c3",
        input_text:
          "Walk-and-talk idea about the Great Inversion landed. As AI gets cheaper at execution, the rare thing becomes judgment and taste. I keep coming back to this when I decide what to work on each morning.",
        output: "",
        edited_output: null,
        status: "pending",
        error: null,
        created_at: iso(-1),
        updated_at: iso(-1),
      },
    ],

    idea: [
      { id: "i1", title: "Members-only Casa Lea retreat", note: "Physical-world flagship; high energy, unclear margins.", captured_at: iso(-20), status: "vault" },
      { id: "i2", title: "Short-form 'Lessons in 60s' series", note: "Repurpose newsletter closers into vertical video.", captured_at: iso(-5), status: "vault" },
    ],

    publication: [],

    channel_connection: [
      { id: "cc-manual", venture_id: null, platform: "manual", display_name: "Manual export", handle: "", status: "connected", created_at: iso(-30) },
      { id: "cc-bh", venture_id: vNewsletter, platform: "beehiiv", display_name: "Lea's Lessons", handle: "leaslessons", status: "placeholder", created_at: iso(-30) },
      { id: "cc-ss", venture_id: vNewsletter, platform: "substack", display_name: "Lea on Substack", handle: "@lea", status: "placeholder", created_at: iso(-30) },
      { id: "cc-x", venture_id: vCasaLea, platform: "x", display_name: "Casa Lea on X", handle: "@casalea", status: "placeholder", created_at: iso(-30) },
      { id: "cc-ig", venture_id: vCasaLea, platform: "instagram", display_name: "Casa Lea IG", handle: "@casa.lea", status: "placeholder", created_at: iso(-30) },
      { id: "cc-li", venture_id: null, platform: "linkedin", display_name: "Lea on LinkedIn", handle: "lea", status: "placeholder", created_at: iso(-30) },
    ],

    metric: [
      // Sample newsletter metrics so the Analyst has data without live creds.
      { id: "m1", venture_id: vNewsletter, source: "beehiiv", name: "subscribers", value: 1240, date: ymd(-9), ref: null, created_at: iso(-9) },
      { id: "m2", venture_id: vNewsletter, source: "beehiiv", name: "subscribers", value: 1268, date: ymd(-2), ref: null, created_at: iso(-2) },
      { id: "m3", venture_id: vNewsletter, source: "beehiiv", name: "open_rate", value: 0.47, date: ymd(-9), ref: "post_abc", created_at: iso(-9) },
    ],

    app_setting: [],
  };
}
