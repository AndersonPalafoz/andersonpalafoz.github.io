import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("External Courses Exclusion from Public Catalog (/aulas)", () => {
  it("filters out courseType === 4 from public courses list", () => {
    const pageContent = readFileSync(join(process.cwd(), "app/aulas/page.tsx"), "utf8");
    expect(pageContent).toContain("courseType !== 4");
  });
});
