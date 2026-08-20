import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Theme Persistence on Reload", () => {
  it("injects a blocking theme restoration script in layout head to prevent reload flicker", () => {
    const layoutContent = readFileSync(join(process.cwd(), "app/layout.tsx"), "utf8");
    expect(layoutContent).toContain('localStorage.getItem("themeMode")');
    expect(layoutContent).toContain("high-contrast");
    expect(layoutContent).toContain("dark");
  });
});
