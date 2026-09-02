import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const config = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");

describe("Next preview stability contract", () => {
  it("keeps the supported development indicator disabled", () => {
    expect(config).toContain("devIndicators: false");
    expect(config).not.toContain("devtoolSegmentExplorer");
  });
});

export {};
