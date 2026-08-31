import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "scripts/archive-legacy-academic-records.mts"), "utf8");

describe("legacy academic archive contract", () => {
  it("supports dry-run by default and explicit apply mode", () => {
    expect(source).toContain('const apply = process.argv.includes("--apply")');
    expect(source).toContain('mode: apply ? "apply" : "dry-run"');
    expect(source).toContain("destructive: false");
  });

  it("archives both grades and attendance with source-id uniqueness", () => {
    expect(source).toContain("legacy_external_class_grades_archive");
    expect(source).toContain("legacy_external_class_attendance_archive");
    expect(source).toContain("legacy_external_class_grades_archive_source_idx");
    expect(source).toContain("legacy_external_class_attendance_archive_source_idx");
  });

  it("blocks records without a valid offer context", () => {
    expect(source).toContain('g."offerId" IS NULL');
    expect(source).toContain('g."courseOfferStudentId" IS NULL');
    expect(source).toContain('a."offerId" IS NULL');
    expect(source).toContain('status: gradeIssues || attendanceIssues ? "blocked" : "ready"');
  });
});
