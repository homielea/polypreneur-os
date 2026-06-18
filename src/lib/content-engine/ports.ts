/**
 * Engine ports — the dependency-inversion boundary that makes the content engine
 * extractable. Engine code depends ONLY on these interfaces (plus shared types),
 * never on the host app's db / env / SDK clients. The host provides
 * implementations via `createEngineContext()` (see src/lib/engine.ts).
 *
 * "Project" is the generic owning entity. Polypreneur OS binds project = venture;
 * the engine never interprets it beyond passing the opaque id through. That is
 * the venture→project generalization: the engine has no venture-specific logic.
 */

import type { DbSchema, TableName } from "@/lib/types";

export type ProjectId = string | null;

/** Persistence the engine needs. Host wires this to its store (Supabase/JSON). */
export interface StorePort {
  list<T extends TableName>(table: T): Promise<DbSchema[T][]>;
  insert<T extends TableName>(table: T, row: DbSchema[T]): Promise<DbSchema[T]>;
  update<T extends TableName>(
    table: T,
    id: string,
    patch: Partial<DbSchema[T]>,
  ): Promise<DbSchema[T]>;
  newId(): string;
  now(): string;
}

/** LLM access. `available` is false when no key is configured (callers stub). */
export interface LlmPort {
  available: boolean;
  complete(input: {
    system: string;
    prompt: string;
    maxTokens: number;
  }): Promise<string>;
}

/** Backend credentials/config. All optional; absent = that backend is off. */
export interface EngineConfig {
  // Outbound delivery is handed to your own pipeline via a webhook (or done
  // manually). No social-media aggregators are bundled in the engine.
  webhook?: { url: string; secret?: string };
  beehiiv?: { apiKey: string; publicationId: string };
  // Faceless-video render backends (HeyGen wired; stub fallback).
  heygen?: { apiKey: string; avatarId?: string; voiceId?: string; width?: number; height?: number };
}

export interface EngineContext {
  store: StorePort;
  llm: LlmPort;
  config: EngineConfig;
}
