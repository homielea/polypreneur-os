import { describe, expect, it } from "vitest";
import type { Idea } from "@/types/domain";
import { nextResurfaceDate, partitionVault, RESURFACE_INTERVAL_DAYS } from "./vault";

function makeIdea(overrides: Partial<Idea>): Idea {
  return {
    id: "i1",
    user_id: "u1",
    content: "An idea",
    triage: "vault",
    status: "active",
    promoted_action_id: null,
    next_resurface_at: null,
    created_at: "2026-06-01T10:00:00Z",
    ...overrides,
  };
}

const now = new Date("2026-07-04T09:00:00Z");

describe("nextResurfaceDate", () => {
  it("schedules the configured interval ahead", () => {
    const next = new Date(nextResurfaceDate(now));
    const diffDays = (next.getTime() - now.getTime()) / 86_400_000;
    expect(diffDays).toBe(RESURFACE_INTERVAL_DAYS);
  });
});

describe("partitionVault", () => {
  it("separates due ideas from resting ones", () => {
    const due = makeIdea({ id: "due", next_resurface_at: "2026-07-01T00:00:00Z" });
    const resting = makeIdea({ id: "resting", next_resurface_at: "2026-08-01T00:00:00Z" });
    const result = partitionVault([due, resting], now);
    expect(result.due.map((i) => i.id)).toEqual(["due"]);
    expect(result.resting.map((i) => i.id)).toEqual(["resting"]);
  });

  it("treats ideas without a resurface date as resting", () => {
    const result = partitionVault([makeIdea({ next_resurface_at: null })], now);
    expect(result.due).toHaveLength(0);
    expect(result.resting).toHaveLength(1);
  });
});
