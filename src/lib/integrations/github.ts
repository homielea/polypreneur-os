/**
 * GitHub read adapter (leaos-hq). Pulls recent commits and projects them as
 * `commit` activity signals. Env-gated via GITHUB_TOKEN + GITHUB_OWNER.
 */

import "server-only";
import { Octokit } from "@octokit/rest";
import { env, hasGitHub } from "@/lib/env";
import type { ExternalSignal } from "./types";

export async function githubSignals(): Promise<ExternalSignal[]> {
  if (!hasGitHub) return [];

  const octokit = new Octokit({ auth: env.githubToken });
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const res = await octokit.repos.listCommits({
    owner: env.githubOwner,
    repo: env.githubRepo,
    since: since.toISOString(),
    per_page: 100,
  });

  return res.data.map((c) => ({
    sourceId: `github:${c.sha}`,
    provider: "github" as const,
    type: "commit" as const,
    title: c.commit.message.split("\n")[0].slice(0, 120),
    date: (c.commit.author?.date ?? new Date().toISOString()).slice(0, 10),
    magnitude: 1,
    ventureHint: env.githubRepo,
  }));
}
