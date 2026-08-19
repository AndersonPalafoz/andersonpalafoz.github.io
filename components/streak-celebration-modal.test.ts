import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("streak celebration contract", () => {
  it("uses the real gamification API and removes fixed streak copy", () => {
    const source = read("components/streak-celebration-modal.tsx");
    expect(source).toContain('fetch("/api/gamification"');
    expect(source).toContain("data.isNewRecord");
    expect(source).toContain("data.streakDays");
    expect(source).not.toContain("useState(14)");
    expect(source).not.toContain("+150 XP");
    expect(source).toContain("ap_streak_celebrated_days");
  });
});
