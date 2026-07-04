import { describe, expect, it } from "vitest";
import type { LedgerEntry } from "@/types/domain";
import {
  formatDigest,
  groupByTag,
  MATERIAL_READY_THRESHOLD,
  MATERIAL_WINDOW_DAYS,
  reflectionMaterial,
} from "./pipe";

const NOW = new Date("2026-07-04T09:00:00Z");
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86_400_000).toISOString();

let seq = 0;
function makeEntry(overrides: Partial<LedgerEntry>): LedgerEntry {
  return {
    id: `e${++seq}`,
    user_id: "u1",
    situation: "Client pushed for a discount",
    judgment: "Held the price, offered a smaller scope instead",
    outcome: "Deal closed at full rate",
    tags: ["pricing"],
    created_at: daysAgo(1),
    ...overrides,
  };
}

describe("groupByTag", () => {
  it("groups entries under each of their tags, newest first", () => {
    const older = makeEntry({ tags: ["pricing"], created_at: daysAgo(5) });
    const newer = makeEntry({ tags: ["pricing", "coaching"], created_at: daysAgo(1) });
    const groups = groupByTag([older, newer], NOW);
    const pricing = groups.find((g) => g.tag === "pricing");
    expect(pricing?.entries.map((e) => e.id)).toEqual([newer.id, older.id]);
    expect(groups.find((g) => g.tag === "coaching")?.entries).toHaveLength(1);
  });

  it("counts recent material per group and sorts richest-material first", () => {
    const groups = groupByTag(
      [
        makeEntry({ tags: ["quiet"], created_at: daysAgo(MATERIAL_WINDOW_DAYS + 5) }),
        makeEntry({ tags: ["busy"], created_at: daysAgo(2) }),
        makeEntry({ tags: ["busy"], created_at: daysAgo(3) }),
      ],
      NOW,
    );
    expect(groups.map((g) => g.tag)).toEqual(["busy", "quiet"]);
    expect(groups[0].recentCount).toBe(2);
    expect(groups[1].recentCount).toBe(0);
    expect(groups[1].entries).toHaveLength(1); // old material stays visible, just not "recent"
  });

  it("ignores untagged entries — they aren't in the pipe", () => {
    expect(groupByTag([makeEntry({ tags: [] })], NOW)).toEqual([]);
  });
});

describe("reflectionMaterial", () => {
  it("lowercases tag keys so the provider's case-insensitive lookup lands", () => {
    const material = reflectionMaterial(
      [makeEntry({ tags: ["Pricing"] }), makeEntry({ tags: ["pricing"] })],
      NOW,
    );
    expect(material).toEqual({ pricing: 2 });
  });

  it("counts only entries inside the material window, per tag", () => {
    const material = reflectionMaterial(
      [
        makeEntry({ tags: ["content"], created_at: daysAgo(1) }),
        makeEntry({ tags: ["content"], created_at: daysAgo(10) }),
        makeEntry({ tags: ["content"], created_at: daysAgo(MATERIAL_WINDOW_DAYS + 1) }),
        makeEntry({ tags: ["retreats"], created_at: daysAgo(2) }),
      ],
      NOW,
    );
    expect(material).toEqual({ content: 2, retreats: 1 });
  });
});

describe("formatDigest", () => {
  it("renders a markdown digest: heading, dated entries, all three fields", () => {
    const entry = makeEntry({ tags: ["pricing"], created_at: "2026-07-01T10:00:00Z" });
    const digest = formatDigest("pricing", [entry]);
    expect(digest).toContain("# pricing — judgment log");
    expect(digest).toContain("## Jul 1, 2026");
    expect(digest).toContain("**Situation:** Client pushed for a discount");
    expect(digest).toContain("**Judgment:** Held the price, offered a smaller scope instead");
    expect(digest).toContain("**Outcome:** Deal closed at full rate");
  });

  it("omits empty outcome lines instead of printing blanks", () => {
    const digest = formatDigest("pricing", [makeEntry({ outcome: "" })]);
    expect(digest).not.toContain("**Outcome:**");
  });
});

describe("constants", () => {
  it("keeps the ready threshold within the window (sanity)", () => {
    expect(MATERIAL_READY_THRESHOLD).toBeGreaterThan(0);
    expect(MATERIAL_WINDOW_DAYS).toBeGreaterThan(MATERIAL_READY_THRESHOLD);
  });
});
