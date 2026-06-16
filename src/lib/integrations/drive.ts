/**
 * Google Drive adapter — the watched voice-note folder (§6.7, §11.2).
 *
 * Env-gated: with Google service-account creds + a folder id, it lists files in
 * the watched folder. Without them it returns [] (stub) so the rest of the
 * pipeline still runs. Text/markdown notes are returned with their contents
 * inline; audio notes are returned without text (transcription is a separate,
 * not-yet-configured step — see `needsTranscription`).
 */

import "server-only";
import { google } from "googleapis";
import { env, hasDrive } from "@/lib/env";

export interface DriveVoiceNote {
  id: string;
  name: string;
  mimeType: string;
  /** Inlined text for text/markdown notes; undefined for audio. */
  text?: string;
  needsTranscription: boolean;
}

export const driveConfigured = hasDrive;

function driveClient() {
  const auth = new google.auth.JWT({
    email: env.googleClientEmail,
    key: env.googlePrivateKey,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  return google.drive({ version: "v3", auth });
}

export async function listVoiceNotes(): Promise<DriveVoiceNote[]> {
  if (!hasDrive) return [];

  const drive = driveClient();
  const res = await drive.files.list({
    q: `'${env.driveFolderId}' in parents and trashed = false`,
    fields: "files(id, name, mimeType)",
    pageSize: 100,
    orderBy: "createdTime desc",
  });

  const files = res.data.files ?? [];
  const notes: DriveVoiceNote[] = [];
  for (const f of files) {
    if (!f.id || !f.name || !f.mimeType) continue;
    const isText = f.mimeType.startsWith("text/");
    let text: string | undefined;
    if (isText) {
      const dl = await drive.files.get(
        { fileId: f.id, alt: "media" },
        { responseType: "text" },
      );
      text = typeof dl.data === "string" ? dl.data : String(dl.data);
    }
    notes.push({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      text,
      needsTranscription: !isText,
    });
  }
  return notes;
}
