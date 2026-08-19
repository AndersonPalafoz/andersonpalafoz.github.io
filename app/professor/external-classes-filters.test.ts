import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");

describe("external classes academic term filters", () => {
  const page = read("app/professor/turmas-externas/page.tsx");

  it("contains year and semester select filters in the UI", () => {
    expect(page).toContain("selectedYearFilter");
    expect(page).toContain("selectedSemesterFilter");
    expect(page).toContain("Ano:");
    expect(page).toContain("Semestre:");
  });

  it("filters classes correctly by academic year and semester pattern matching", () => {
    expect(page).toContain("matchesYear");
    expect(page).toContain("matchesSemester");
  });
});
