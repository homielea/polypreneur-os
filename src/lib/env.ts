/**
 * Centralized environment detection. Every external dependency is OPTIONAL:
 * when its credentials are absent the corresponding adapter falls back to a
 * stub/seed so the whole app still runs end-to-end (per the v1 build decision).
 */

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  // Service-role key is server-only; the anon key is fine for single-user v1.
  supabaseKey:
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "",
  anthropicKey: process.env.ANTHROPIC_API_KEY ?? "",
  anthropicModel: process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8",
  notionKey: process.env.NOTION_API_KEY ?? "",
  githubToken: process.env.GITHUB_TOKEN ?? "",
  githubRepo: process.env.GITHUB_REPO ?? "leaos-hq",
  githubOwner: process.env.GITHUB_OWNER ?? "",
  googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL ?? "",
  googlePrivateKey: (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
  googleCalendarId: process.env.GOOGLE_CALENDAR_ID ?? "",
  // Voice-note transcription reuses the Google service account (Speech-to-Text).
  googleSttLanguage: process.env.GOOGLE_STT_LANGUAGE ?? "en-US",
  driveFolderId: process.env.DRIVE_WATCH_FOLDER_ID ?? "",
  // Beehiiv newsletter publishing (write integration).
  beehiivApiKey: process.env.BEEHIIV_API_KEY ?? "",
  beehiivPublicationId: process.env.BEEHIIV_PUBLICATION_ID ?? "",
} as const;

export const hasSupabase = Boolean(env.supabaseUrl && env.supabaseKey);
export const hasAnthropic = Boolean(env.anthropicKey);
export const hasNotion = Boolean(env.notionKey);
export const hasGitHub = Boolean(env.githubToken && env.githubOwner);
export const hasGoogle = Boolean(env.googleClientEmail && env.googlePrivateKey);
export const hasDrive = hasGoogle && Boolean(env.driveFolderId);
// Speech-to-Text reuses the Google service account (needs the Speech API enabled
// + the cloud-platform scope granted to the service account).
export const hasTranscription = hasGoogle;
export const hasBeehiiv = Boolean(env.beehiivApiKey && env.beehiivPublicationId);
