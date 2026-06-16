/**
 * Voice-note transcription (audio -> text). Provider-swappable behind one
 * function; v1 uses OpenAI Whisper. This is a transcription concern only — the
 * Scribe agent itself stays on Claude.
 *
 * Env-gated by OPENAI_API_KEY. When unconfigured, callers fall back to leaving
 * the job with a "transcription not configured" note so the loop still runs.
 */

import "server-only";
import OpenAI, { toFile } from "openai";
import { env, hasWhisper } from "@/lib/env";

export const transcriptionConfigured = hasWhisper;

/** Whisper's hard upload limit. ~25–30 min of compressed walk-and-talk audio. */
export const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

let client: OpenAI | null = null;
function openai(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: env.openaiKey });
  return client;
}

export async function transcribeAudio(
  audio: Buffer,
  filename: string,
): Promise<string> {
  if (!hasWhisper) {
    throw new Error("Transcription not configured (set OPENAI_API_KEY).");
  }
  if (audio.byteLength > MAX_AUDIO_BYTES) {
    throw new Error(
      `Audio file is ${(audio.byteLength / 1_048_576).toFixed(1)}MB; Whisper's limit is 25MB. Split or compress it.`,
    );
  }
  const file = await toFile(audio, filename);
  const result = await openai().audio.transcriptions.create({
    file,
    model: env.whisperModel,
  });
  return result.text.trim();
}
