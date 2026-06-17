import type { EngineConfig } from "@/lib/content-engine/ports";

export interface RenderInput {
  title: string;
  voiceoverScript: string;
  scenes: string[];
  thumbnailConcept: string;
}

export interface RenderResult {
  videoUrl: string;
  backend: string;
}

/**
 * A faceless-video render backend. `wired` distinguishes a functional backend
 * (stub today) from a scaffolded vendor seam (HeyGen/Veo3/Runway) whose API call
 * is pending. `isConfigured` reflects whether its credentials are present.
 */
export interface RenderBackend {
  key: string;
  label: string;
  wired: boolean;
  note: string;
  isConfigured(config: EngineConfig): boolean;
  render(input: RenderInput, config: EngineConfig): Promise<RenderResult>;
}

export interface RenderBackendInfo {
  key: string;
  label: string;
  wired: boolean;
  configured: boolean;
  note: string;
}
