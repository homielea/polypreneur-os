/**
 * Public surface of the content engine.
 *
 * The engine depends only on its ports (see ports.ts) — the host provides
 * implementations via an EngineContext. To extract this into a standalone
 * package, move this folder and supply a context from the new host. Nothing
 * here imports the app's db / env / SDK clients.
 */

export * from "./ports";

// Video production
export {
  produceVideoPackage,
  type ProductionPackage,
} from "./video/producer";
export {
  createProduction,
  generatePackage,
  renderProduction,
  pollProduction,
  updateProduction,
} from "./video/productions";
export {
  resolveRenderBackend,
  getRenderBackend,
  listRenderBackends,
} from "./video/render/registry";
export type {
  RenderBackend,
  RenderBackendInfo,
  RenderInput,
  RenderResult,
} from "./video/render/types";

// Delivery
export {
  resolveDeliveryAdapter,
  configuredBackends,
} from "./delivery/registry";
export type { DeliveryAdapter, DeliveryInput, DeliveryResult } from "./delivery/types";
