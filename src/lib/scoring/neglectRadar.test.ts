import { describe, expect, it } from "vitest";
import type { ActionRecord } from "@/types/domain";
import { ScoringEngine } from "./engine";
import { manualLeverage, neglectRadar, NEGLECT_BOOSTS } from "./providers";
import type { ScoreStore, ScoringContext } from "./types";

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

const NOW = new Date("2026-07-04T09:00:00Z");
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86_400_000).toISOString();
const ctx = (categoryActivity?: Record<string, string>): ScoringContext => ({
  now: NOW,
  categoryActivity,
});

describe("neglectRadar provider", () => {
  it("contributes nothing while activity data hasn't loaded", () => {
    const action = makeAction({ id: "a", category: "retreats", created_at: daysAgo(30) });
    expect(neglectRadar.score([action], ctx(undefined))).toEqual([]);
  });

  it("leaves recently active categories alone", () => {
    const action = makeAction({ id: "a", category: "content" });
    const contributions = neglectRadar.score([action], ctx({ content: daysAgo(3) }));
    expect(contributions).toEqual([]);
  });

  it("boosts a category once it has been quiet for 7 days, more at 14", () => {
    const action = makeAction({ id: "a", category: "retreats" });
    expect(neglectRadar.score([action], ctx({ retreats: daysAgo(6) }))).toEqual([]);
    expect(neglectRadar.score([action], ctx({ retreats: daysAgo(7) }))[0].points).toBe(
      NEGLECT_BOOSTS.quiet,
    );
    expect(neglectRadar.score([action], ctx({ retreats: daysAgo(13) }))[0].points).toBe(
      NEGLECT_BOOSTS.quiet,
    );
    expect(neglectRadar.score([action], ctx({ retreats: daysAgo(14) }))[0].points).toBe(
      NEGLECT_BOOSTS.veryQuiet,
    );
  });

  it("keeps the reason factual and legible: category + day count", () => {
    const action = makeAction({ id: "a", category: "coaching" });
    const [c] = neglectRadar.score([action], ctx({ coaching: daysAgo(9) }));
    expect(c.reason).toBe("coaching quiet for 9 days");
    expect(c.providerId).toBe("neglect-radar");
  });

  it("anchors categories with no recorded points to their oldest open action", () => {
    // A category that never gathered points shouldn't be instantly "neglected"
    // the day its first action is created — its clock starts at that action.
    const fresh = makeAction({ id: "fresh", category: "apps", created_at: daysAgo(0) });
    expect(neglectRadar.score([fresh], ctx({}))).toEqual([]);

    const old = makeAction({ id: "old", category: "apps", created_at: daysAgo(20) });
    const newer = makeAction({ id: "newer", category: "apps", created_at: daysAgo(1) });
    const contributions = neglectRadar.score([newer, old], ctx({}));
    expect(contributions).toHaveLength(2); // every open action in the quiet category
    expect(contributions.every((c) => c.points === NEGLECT_BOOSTS.veryQuiet)).toBe(true);
  });

  it("only boosts the quiet category, not its neighbors", () => {
    const quiet = makeAction({ id: "q", category: "retreats" });
    const active = makeAction({ id: "a", category: "content" });
    const contributions = neglectRadar.score([quiet, active], ctx({
      retreats: daysAgo(10),
      content: daysAgo(1),
    }));
    expect(contributions.map((c) => c.actionId)).toEqual(["q"]);
  });
});

describe("neglectRadar in the engine", () => {
  const nullStore: ScoreStore = {
    insertEvent: async () => {},
    totals: async () => [],
  };

  it("surfaces a neglected category above an equal-leverage fresh one", () => {
    const engine = new ScoringEngine(nullStore);
    engine.registerProvider(manualLeverage);
    engine.registerProvider(neglectRadar);
    const neglected = makeAction({ id: "neglected", category: "retreats", leverage: 3 });
    const fresh = makeAction({
      id: "fresh",
      category: "content",
      leverage: 3,
      created_at: daysAgo(10), // older created_at would win the tie-break without the radar
    });
    const ranked = engine.rank([fresh, neglected], {
      now: NOW,
      categoryActivity: { retreats: daysAgo(10), content: daysAgo(1) },
    });
    expect(ranked.map((r) => r.action.id)).toEqual(["neglected", "fresh"]);
    expect(ranked[0].reasons).toContain("retreats quiet for 10 days");
  });

  it("nudges but never overrides a clearly higher-leverage action", () => {
    const engine = new ScoringEngine(nullStore);
    engine.registerProvider(manualLeverage);
    engine.registerProvider(neglectRadar);
    const needleMover = makeAction({ id: "big", category: "content", leverage: 5 });
    const neglectedRoutine = makeAction({ id: "small", category: "retreats", leverage: 2 });
    const ranked = engine.rank([needleMover, neglectedRoutine], {
      now: NOW,
      categoryActivity: { retreats: daysAgo(30), content: daysAgo(1) },
    });
    expect(ranked[0].action.id).toBe("big"); // 50 beats 20 + veryQuiet(20)
  });
});
