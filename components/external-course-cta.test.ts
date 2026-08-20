import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("ExternalCourseCta", () => {
  it("provides a new-tab link with accessible redirect feedback", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "components/external-course-cta.tsx"), "utf8");
    expect(source).toContain('target="_blank"');
    expect(source).toContain("noopener noreferrer");
    expect(source).toContain("Abrindo ambiente externo...");
    expect(source).toContain("aria-live=\"polite\"");
    expect(source).toContain("aria-disabled={redirecting}");
  });
});
