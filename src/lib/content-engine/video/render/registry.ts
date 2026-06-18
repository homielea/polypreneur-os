/**
 * Render backend registry. New faceless-video vendors (HeyGen, Veo3, Runway, …)
 * register here and slot in without touching the production orchestration.
 *
 * Resolution: prefer a requested backend if it's wired + configured; otherwise
 * the first wired + configured vendor; otherwise the stub. The stub is always
 * available so the pipeline never dead-ends.
 */

import type { EngineConfig } from "@/lib/content-engine/ports";
import { heygenRender } from "./heygen";
import { stubRender } from "./stub";
import type { RenderBackend, RenderBackendInfo } from "./types";

// HeyGen first (preferred when configured), stub last (fallback).
const BACKENDS: RenderBackend[] = [heygenRender, stubRender];

export function getRenderBackend(key: string): RenderBackend | undefined {
  return BACKENDS.find((b) => b.key === key);
}

export function resolveRenderBackend(
  config: EngineConfig,
  preferred?: string,
): RenderBackend {
  if (preferred) {
    const p = BACKENDS.find((b) => b.key === preferred);
    if (p && p.wired && p.isConfigured(config)) return p;
  }
  const live = BACKENDS.find((b) => b.wired && b.isConfigured(config));
  return live ?? stubRender;
}

export function listRenderBackends(config: EngineConfig): RenderBackendInfo[] {
  return BACKENDS.map((b) => ({
    key: b.key,
    label: b.label,
    wired: b.wired,
    configured: b.isConfigured(config),
    note: b.note,
  }));
}
