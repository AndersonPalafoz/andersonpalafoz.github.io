import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Course Page WCAG AAA Dark Mode Contrast", () => {
  it("uses high-contrast dark mode text classes for secondary and muted descriptions", () => {
    const pageContent = readFileSync(join(process.cwd(), "app/cursos/[id]/page.tsx"), "utf8");
    expect(pageContent).toContain("dark:text-gray-300");
    expect(pageContent).not.toContain("text-gray-500");
  });
});
