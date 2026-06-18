/**
 * Voice-note transcription (audio -> text) via Google Speech-to-Text. Reuses the
 * Google service account already configured for Drive/Calendar — no new vendor.
 * Provider-swappable behind `transcribeAudio`; the Scribe itself stays on Claude.
 *
 * Requires: the Speech-to-Text API enabled on the GCP project, and the
 * cloud-platform scope granted to the service account.
 *
 * Note: Google STT does not accept AAC/m4a (the iPhone Voice Memos default).
 * Drop wav / mp3 / flac / ogg(opus) / webm(opus) notes, or transcode first.
 */

import "server-only";
import { google } from "googleapis";
import { env, hasTranscription } from "@/lib/env";

export const transcriptionConfigured = hasTranscription;

/** Inline-content request ceiling for long-running recognize (~10MB). */
export const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

const POLL_ATTEMPTS = 40;
const POLL_INTERVAL_MS = 3000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Map a file extension/mime to a Google STT encoding, or null to omit it. */
function encodingFor(filename: string): string | null {
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  switch (ext) {
    case "wav":
      return "LINEAR16";
    case "flac":
      return "FLAC";
    case "mp3":
      return "MP3";
    case "ogg":
    case "opus":
      return "OGG_OPUS";
    case "webm":
      return "WEBM_OPUS";
    case "m4a":
    case "aac":
    case "mp4":
      throw new Error(
        `Google Speech-to-Text doesn't support ${ext} (AAC). Use wav/mp3/flac/ogg, or transcode the note first.`,
      );
    default:
      return null; // let Google infer from the container header
  }
}

function speechClient() {
  const auth = new google.auth.JWT({
    email: env.googleClientEmail,
    key: env.googlePrivateKey,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  return google.speech({ version: "v1", auth });
}

export async function transcribeAudio(
  audio: Buffer,
  filename: string,
): Promise<string> {
  if (!hasTranscription) {
    throw new Error(
      "Transcription not configured (Google service account required).",
    );
  }
  if (audio.byteLength > MAX_AUDIO_BYTES) {
    throw new Error(
      `Audio is ${(audio.byteLength / 1_048_576).toFixed(1)}MB; the inline limit is 10MB. Split the note (or wire a GCS bucket for longer audio).`,
    );
  }

  const encoding = encodingFor(filename);
  const speech = speechClient();

  const start = await speech.speech.longrunningrecognize({
    requestBody: {
      config: {
        languageCode: env.googleSttLanguage,
        enableAutomaticPunctuation: true,
        ...(encoding ? { encoding } : {}),
      },
      audio: { content: audio.toString("base64") },
    },
  });

  const name = start.data.name;
  if (!name) throw new Error("Speech-to-Text did not return an operation.");

  for (let i = 0; i < POLL_ATTEMPTS; i++) {
    const op = await speech.operations.get({ name });
    if (op.data.done) {
      if (op.data.error) {
        throw new Error(
          `Speech-to-Text failed: ${op.data.error.message ?? "unknown error"}`,
        );
      }
      const results =
        (op.data.response?.results as
          | { alternatives?: { transcript?: string }[] }[]
          | undefined) ?? [];
      const text = results
        .map((r) => r.alternatives?.[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (!text) throw new Error("Transcription returned no speech.");
      return text;
    }
    await sleep(POLL_INTERVAL_MS);
  }
  throw new Error(
    "Transcription timed out. For long notes, wire a GCS-backed async job.",
  );
}
