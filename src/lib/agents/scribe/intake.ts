/**
 * Scribe intake: scan the eligible sources and enqueue agent_jobs (the job
 * queue IS the agent_job table — §9). Two sources, both deduped by input_ref so
 * re-scanning is safe:
 *   1. Voice notes in the watched Google Drive folder (§6.7).
 *   2. Check-ins flagged with content potential (§6.3 content_flag).
 *
 * The Scribe runs on-demand in v1; this scan is the cadence hook. It is wired to
 * run on a schedule later (configurable) without code changes.
 */

import "server-only";
import { insert, list, newId, nowIso } from "@/lib/db";
import { listVoiceNotes } from "@/lib/integrations/drive";
import type { AgentJob } from "@/lib/types";

export interface IntakeResult {
  created: number;
  skippedExisting: number;
  driveConfigured: boolean;
  fromDrive: number;
  fromCheckins: number;
}

export async function runIntake(): Promise<IntakeResult> {
  const existing = await list("agent_job");
  const seenRefs = new Set(existing.map((j) => j.input_ref));

  let fromDrive = 0;
  let fromCheckins = 0;
  let skippedExisting = 0;

  const jobs: AgentJob[] = [];

  // 1. Drive voice notes
  const notes = await listVoiceNotes();
  for (const note of notes) {
    const ref = `drive:${note.id}`;
    if (seenRefs.has(ref)) {
      skippedExisting++;
      continue;
    }
    seenRefs.add(ref);
    jobs.push(
      makeJob(
        ref,
        note.needsTranscription
          ? `[Audio voice note "${note.name}" — transcription not configured. Paste the transcript here, then re-run the Scribe.]`
          : (note.text ?? ""),
      ),
    );
    fromDrive++;
  }

  // 2. Content-flagged check-ins
  const checkins = await list("checkin");
  for (const c of checkins) {
    if (!c.content_flag) continue;
    const ref = `checkin:${c.id}`;
    if (seenRefs.has(ref)) {
      skippedExisting++;
      continue;
    }
    if (!c.free_text.trim()) continue;
    seenRefs.add(ref);
    jobs.push(makeJob(ref, c.free_text));
    fromCheckins++;
  }

  for (const job of jobs) {
    await insert("agent_job", job);
  }

  return {
    created: jobs.length,
    skippedExisting,
    driveConfigured: notes.length > 0 || false,
    fromDrive,
    fromCheckins,
  };
}

function makeJob(inputRef: string, inputText: string): AgentJob {
  const ts = nowIso();
  return {
    id: newId(),
    agent: "scribe",
    input_ref: inputRef,
    input_text: inputText,
    output: "",
    edited_output: null,
    status: "pending",
    error: null,
    created_at: ts,
    updated_at: ts,
  };
}
