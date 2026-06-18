/**
 * Host wiring for the content engine. This is the ONLY place that connects the
 * engine's ports to Polypreneur OS's real db / env / Anthropic. The engine
 * itself imports none of those — so it can be lifted into its own package by
 * moving the content-engine folder and providing a different context here.
 */

import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { insert, list, newId, nowIso, update } from "@/lib/db";
import { env, hasAnthropic } from "@/lib/env";
import type {
  EngineConfig,
  EngineContext,
  LlmPort,
  StorePort,
} from "@/lib/content-engine/ports";

const store: StorePort = {
  list,
  insert,
  update,
  newId,
  now: nowIso,
};

let anthropic: Anthropic | null = null;
const llm: LlmPort = {
  available: hasAnthropic,
  async complete({ system, prompt, maxTokens }) {
    if (!anthropic) anthropic = new Anthropic({ apiKey: env.anthropicKey });
    const message = await anthropic.messages.create({
      model: env.anthropicModel,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: prompt }],
    });
    return message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
  },
};

export function engineConfig(): EngineConfig {
  return {
    blotatoApiKey: env.blotatoApiKey || undefined,
    postiz:
      env.postizApiUrl && env.postizApiKey
        ? { apiUrl: env.postizApiUrl, apiKey: env.postizApiKey }
        : undefined,
    beehiiv:
      env.beehiivApiKey && env.beehiivPublicationId
        ? { apiKey: env.beehiivApiKey, publicationId: env.beehiivPublicationId }
        : undefined,
    heygen: env.heygenApiKey
      ? {
          apiKey: env.heygenApiKey,
          avatarId: env.heygenAvatarId || undefined,
          voiceId: env.heygenVoiceId || undefined,
        }
      : undefined,
    runwayApiKey: env.runwayApiKey || undefined,
    veoApiKey: env.veoApiKey || undefined,
  };
}

export function createEngineContext(): EngineContext {
  return { store, llm, config: engineConfig() };
}
