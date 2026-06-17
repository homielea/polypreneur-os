# content-engine (extraction in progress)

The content creation + distribution subsystem, being shaped into a **standalone,
extractable** module (a future package / skill / framework focused on content —
including faceless). Polypreneur OS keeps **judgment, voice, and orchestration**;
this engine owns the mechanical pipeline behind clean seams.

## The pipeline

```
source → draft (agents) → human approval → repurpose → deliver → measure
  │          │                  │              │           │         │
transcribe  Scribe /         approval       Repurposer  delivery   Analyst
(voice→text) Repurposer       inbox                      backend    metrics
```

## Ports (dependency inversion — the extraction boundary)

Engine code imports ONLY `ports.ts` (+ shared types), never the host's
db / env / SDK clients:

- `StorePort` — persistence (list/insert/update, newId, now)
- `LlmPort` — `complete()` + `available`
- `EngineConfig` — backend credentials (Blotato, Beehiiv, HeyGen, Runway, Veo)

The host wires these in `src/lib/engine.ts` (`createEngineContext()`). To extract:
move this folder and provide a context from the new host — no engine edits.
"Project" is the generic owning entity; PP-OS binds project = venture, and the
engine treats the id as opaque (no venture logic anywhere inside).

## Seams (provider-swappable)

| Concern | Interface | Backends |
|---|---|---|
| Transcription | `agents/scribe/transcribe.ts` | Google STT (swap: Whisper/Deepgram) |
| Drafting / Producer | `LlmPort` | Claude (locked voice — stays in PP-OS) |
| **Delivery** | `delivery/registry.ts` `resolveDeliveryAdapter(config, platform)` | **Blotato** (live), mark-as-posted, Beehiiv; **Postiz** for the OSS/self-host product |
| **Video render** | `video/render/registry.ts` `resolveRenderBackend(config)` | stub (wired); **HeyGen / Veo3 / Runway / Blotato** (scaffolded seams) |
| Metrics | `analyst/metrics.ts` sources | Beehiiv (stub others) |

Adding a render or delivery backend = one adapter + a line in its registry.

## Extraction roadmap

- **Phase 0 (done/here)** — formalize the delivery seam (`delivery/*`) and
  document the module boundary.
- **Phase 1 (done/here)** — Blotato delivery adapter (env-gated).
- **Phase 2** — faceless-video stage: script → voiceover + b-roll → assemble →
  thumbnail/title (Blotato or the vidIQ MCP), approval-gated like everything else.
- **Phase 3** — generalize `venture` → a generic `project/workspace` param at the
  module boundary (PP-OS binds it to ventures), then physically extract to its
  own package/repo consumed via the public interface.
- **Phase 4** — wrap as a Claude skill/workflow (source→draft→approve→
  repurpose→deliver) for agentic invocation — the v2 agent-to-agent hand-off seam.

## Boundary rule

Judgment + Lea's voice + the approval gate stay in Polypreneur OS. Generation of
commodity assets (faceless video/images) and multi-network delivery are delegated
to swappable backends. Don't pay a vendor to rebuild the Scribe's voice; don't
rebuild a vendor's 15-network delivery here.
