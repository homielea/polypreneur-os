import { describe, expect, it } from "vitest";
import type { ActionRecord } from "@/types/domain";
import { ScoringEngine } from "./engine";
import { manualLeverage, top20Boost } from "./providers";
import type { CategoryTotal, ScoreEventInput, ScoreStore } from "./types";

function makeAction(overrides: Partial<ActionRecord>): ActionRecord {
  return {
    id: "a1",
    user_id: "u1",
    title: "Test action",
    notes: "",
    category: "general",
    leverage: 3,
    status: "open",
    source: "manual",
    created_at: "2026-07-01T10:00:00Z",
    completed_at: null,
    ...overrides,
  };
}

function makeMemoryStore() {
  const events: ScoreEventInput[] = [];
  const store: ScoreStore = {
    async insertEvent(event) {
      events.push(event);
    },
    async totals(): Promise<CategoryTotal[]> {
      const byCategory = new Map<string, number>();
      for (const e of events) {
        byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.points);
      }
      return [...byCategory.entries()].map(([category, points]) => ({ category, points }));
    },
  };
  return { store, events };
}

function makeEngine() {
  const { store, events } = makeMemoryStore();
  const engine = new ScoringEngine(store);
  engine.registerProvider(manualLeverage);
  engine.registerProvider(top20Boost);
  return { engine, events };
}

const ctx = { now: new Date("2026-07-04T09:00:00Z") };

describe("ScoringEngine.rank", () => {
  it("ranks higher-leverage actions first", () => {
    const { engine } = makeEngine();
    const low = makeAction({ id: "low", leverage: 1 });
    const high = makeAction({ id: "high", leverage: 5 });
    const ranked = engine.rank([low, high], ctx);
    expect(ranked.map((r) => r.action.id)).toEqual(["high", "low"]);
    expect(ranked[0].score).toBe(50);
  });

  it("sums contributions across providers and keeps legible reasons", () => {
    const { engine } = makeEngine();
    const promoted = makeAction({ id: "p", leverage: 3, source: "idea_promotion" });
    const [ranked] = engine.rank([promoted], ctx);
    expect(ranked.score).toBe(3 * 10 + 15);
    expect(ranked.reasons).toContain("leverage 3/5");
    expect(ranked.reasons).toContain("came through 80/20 triage");
  });

  it("breaks ties by created_at ascending (older first)", () => {
    const { engine } = makeEngine();
    const older = makeAction({ id: "older", created_at: "2026-07-01T08:00:00Z" });
    const newer = makeAction({ id: "newer", created_at: "2026-07-02T08:00:00Z" });
    const ranked = engine.rank([newer, older], ctx);
    expect(ranked.map((r) => r.action.id)).toEqual(["older", "newer"]);
  });

  it("is pluggable: registering a new provider changes the ranking", () => {
    const { engine } = makeEngine();
    const a = makeAction({ id: "a", leverage: 5 });
    const b = makeAction({ id: "b", leverage: 1 });
    engine.registerProvider({
      id: "neglect-radar-stub",
      score: () => [{ actionId: "b", points: 100, reason: "neglected venture", providerId: "neglect-radar-stub" }],
    });
    const ranked = engine.rank([a, b], ctx);
    expect(ranked[0].action.id).toBe("b");
    expect(ranked[0].reasons).toContain("neglected venture");
  });

  it("ignores non-positive contributions — the engine is additive only", () => {
    const { engine } = makeEngine();
    engine.registerProvider({
      id: "bad-provider",
      score: (actions) =>
        actions.map((a) => ({ actionId: a.id, points: -50, reason: "penalty", providerId: "bad-provider" })),
    });
    const [ranked] = engine.rank([makeAction({ id: "a", leverage: 2 })], ctx);
    expect(ranked.score).toBe(20);
    expect(ranked.reasons).not.toContain("penalty");
  });
});

describe("ScoringEngine.recordEvent / totals", () => {
  it("persists positive events and accumulates totals by category", async () => {
    const { engine } = makeEngine();
    await engine.recordEvent({ source: "completion", category: "content", points: 4 });
    await engine.recordEvent({ source: "completion", category: "content", points: 2 });
    await engine.recordEvent({ source: "completion", category: "coaching", points: 5 });
    const totals = await engine.totals({ from: new Date(0), to: ctx.now });
    expect(totals).toContainEqual({ category: "content", points: 6 });
    expect(totals).toContainEqual({ category: "coaching", points: 5 });
  });

  it("rejects zero or negative points", async () => {
    const { engine, events } = makeEngine();
    await expect(engine.recordEvent({ source: "x", category: "c", points: 0 })).rejects.toThrow();
    await expect(engine.recordEvent({ source: "x", category: "c", points: -3 })).rejects.toThrow();
    expect(events).toHaveLength(0);
  });
});
