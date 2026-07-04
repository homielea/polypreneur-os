import { describe, expect, it } from "vitest";
import { parseTags } from "./LedgerQuickCapture";

describe("parseTags", () => {
  it("splits on commas, trims, and lowercases", () => {
    expect(parseTags("Coaching, Pricing , casa-lea")).toEqual(["coaching", "pricing", "casa-lea"]);
  });

  it("drops empties and duplicates", () => {
    expect(parseTags("a,, a , ,A")).toEqual(["a"]);
  });

  it("returns [] for blank input", () => {
    expect(parseTags("  ")).toEqual([]);
  });
});
