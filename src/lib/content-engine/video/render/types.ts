import type { EngineConfig } from "@/lib/content-engine/ports";

export interface RenderInput {
  title: string;
  voiceoverScript: string;
  scenes: string[];
  thumbnailConcept: string;
}

export interface RenderResult {
  /** "ready" = videoUrl present; "pending" = async job submitted (poll jobId). */
  status: "ready" | "pending";
  videoUrl?: string;
  jobId?: string;
  backend: string;
}

/**
 * A faceless-video render backend. `wired` distinguishes a functional backend
 * from a scaffolded vendor seam. Async backends (e.g. HeyGen) return a `pending`
 * result with a `jobId` and implement `poll` to fetch the asset when ready.
 */
export interface RenderBackend {
  key: string;
  label: string;
  wired: boolean;
  note: string;
  isConfigured(config: EngineConfig): boolean;
  render(input: RenderInput, config: EngineConfig): Promise<RenderResult>;
  poll?(jobId: string, config: EngineConfig): Promise<RenderResult>;
}

export interface RenderBackendInfo {
  key: string;
  label: string;
  wired: boolean;
  configured: boolean;
  note: string;
}
