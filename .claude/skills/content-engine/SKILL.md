---
name: content-engine
description: >-
  Run the Polypreneur content pipeline: turn voice notes / check-ins into
  approved, distributed content — Lea's Lessons essays, repurposed posts
  (short-form, newsletter, social), and faceless videos. Use when asked to
  draft, repurpose, produce, schedule, or "advance" content, or to report the
  content funnel. Drives the running app's workflow API. The agent does the
  mechanical work; APPROVAL and PUBLISHING stay with the operator.
---

# Content Engine

A gated content pipeline. You (the agent) run the mechanical 80%; the operator
keeps the 20% of judgment. This is the v2 agent hand-off seam.

```
voice note / check-in → Scribe draft → [APPROVE] → Repurposer / Producer → [APPROVE] → Distribution → channels
```

## The one rule (non-negotiable)

**You draft and produce. You never approve or publish on the operator's behalf.**
Every agent output passes a human approval gate. Run the workflow, then *report
what is awaiting approval* and stop. Only call approve/publish endpoints if the
operator explicitly tells you to in this conversation.

## How to drive it

The app exposes a workflow API (default `http://localhost:3000`, override with
`APP_URL`). Use the helper script or call the endpoints directly.

```sh
node .claude/skills/content-engine/scripts/pipeline.mjs status    # funnel counts
node .claude/skills/content-engine/scripts/pipeline.mjs run       # scan + draft
node .claude/skills/content-engine/scripts/pipeline.mjs advance   # approved → repurpose + video packages, then draft
```

Endpoints (if calling directly):
- `GET  /api/workflow/status` → funnel (jobs / productions / publications by status, `awaitingApproval`).
- `POST /api/workflow/run` body `{ intake, draft, advanceRepurpose, advanceVideo }`
  - `run`     → `{ intake: true, draft: true }` (scan sources, draft pending).
  - `advance` → `{ advanceRepurpose: true, advanceVideo: true, draft: true }`
    (fan approved pieces into repurpose jobs + faceless-video packages, then draft them).

## The loop you run

1. `status` — see the funnel. If `awaitingApproval > 0`, tell the operator there
   are items to review in the Approval Inbox / Studio; do not proceed past the gate.
2. `run` — pull new voice notes / content-flagged check-ins and draft them.
3. After the operator approves pieces, `advance` — turn approved pieces into
   repurposed posts and faceless-video packages (each lands awaiting approval).
4. Report: what was created, what is now awaiting approval, what is approved and
   ready to distribute. Surface the numbers; let the human decide.

## What stays human (do not automate)

- Approving / rejecting drafts and video packages (`PATCH /api/agent-jobs/:id`,
  `PATCH /api/productions/:id` with `action: approve|reject`).
- Publishing / scheduling to channels (`POST /api/publications`). Outbound is
  irreversible — always the operator's call.

## Notes

- Rendering a HeyGen video is async: after a render is started it shows
  "Rendering…"; the operator (or a future auto-poll) refreshes until ready.
- Delivery backends and render backends are env-gated; absent creds degrade to
  placeholders ("mark as posted" / stub) — never silent fake success.
