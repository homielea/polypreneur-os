import { describe, expect, it } from "vitest";
import type { ActionRecord } from "@/types/domain";
import { ScoringEngine } from "./engine";
import { manualLeverage, reflectionPipe, REFLECTION_BOOST } from "./providers";
import { MATERIAL_READY_THRESHOLD } from "@/lib/pipe";
import type { ScoreStore, ScoringContext } from "./types";

function makeAction(overrides: Partial<ActionRecord>): ActionRecord {
  return {
    id: "a1",
    user_id: "u1",
    title: "Draft the pricing newsletter",
    notes: "",
    category: "content",
    leverage: 3,
    status: "open",
    source: "manual",
    created_at: "2026-07-01T10:00:00Z",
    completed_at: null,
    ...overrides,
  };
}

const NOW = new Date("2026-07-04T09:00:00Z");
const ctx = (reflectionMaterial?: Record<string, number>): ScoringContext => ({
  now: NOW,
  reflectionMaterial,
});

describe("reflectionPipe provider", () => {
  it("contributes nothing while ledger data hasn't loaded", () => {
    expect(reflectionPipe.score([makeAction({})], ctx(undefined))).toEqual([]);
  });

  it("stays quiet below the ready threshold", () => {
    const action = makeAction({ category: "content" });
    const contributions = reflectionPipe.score(
      [action],
      ctx({ content: MATERIAL_READY_THRESHOLD - 1 }),
    );
    expect(contributions).toEqual([]);
  });

  it("boosts actions whose category has enough fresh judgments, with the count in the reason", () => {
    const action = makeAction({ id: "a", category: "content" });
    const [c] = reflectionPipe.score([action], ctx({ content: 4 }));
    expect(c.points).toBe(REFLECTION_BOOST);
    expect(c.reason).toBe("4 fresh judgments tagged content");
    expect(c.providerId).toBe("reflection-pipe");
  });

  it("matches category to tag exactly and leaves other categories alone", () => {
    const content = makeAction({ id: "c", category: "content" });
    const retreats = makeAction({ id: "r", category: "retreats" });
    const contributions = reflectionPipe.score([content, retreats], ctx({ content: 5 }));
    expect(contributions.map((c) => c.actionId)).toEqual(["c"]);
  });
});

describe("reflectionPipe in the engine", () => {
  it("lifts an action in a reflection-rich category above an equal one", () => {
    const nullStore: ScoreStore = { insertEvent: async () => {}, totals: async () => [] };
    const engine = new ScoringEngine(nullStore);
    engine.registerProvider(manualLeverage);
    engine.registerProvider(reflectionPipe);
    const rich = makeAction({ id: "rich", category: "content" });
    const plain = makeAction({
      id: "plain",
      category: "apps",
      created_at: "2026-06-20T10:00:00Z", // would win the created_at tie-break otherwise
    });
    const ranked = engine.rank([plain, rich], {
      now: NOW,
      reflectionMaterial: { content: 3 },
    });
    expect(ranked.map((r) => r.action.id)).toEqual(["rich", "plain"]);
    expect(ranked[0].reasons).toContain("3 fresh judgments tagged content");
  });
});
