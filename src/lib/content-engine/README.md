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

## Seams (provider-swappable, env-gated)

| Concern | Interface | Backends |
|---|---|---|
| Transcription | `agents/scribe/transcribe.ts` | Google STT (swap: Whisper/Deepgram) |
| Drafting | the agents (Claude) | Claude (locked voice — stays in PP-OS) |
| **Delivery** | `content-engine/delivery/types.ts` → `registry.ts` | **Blotato** (live), mark-as-posted (placeholder), Beehiiv; **Postiz** is the intended OSS/self-host backend for the standalone product |
| Metrics | `analyst/metrics.ts` sources | Beehiiv (stub others) |

Swapping the delivery backend = edit `delivery/registry.ts` + add one adapter.
That is the whole point: Blotato now, self-hosted Postiz later, same interface.

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
