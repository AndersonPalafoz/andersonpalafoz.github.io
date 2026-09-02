import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "scripts/archive-legacy-classes-and-students.mts"), "utf8");

describe("legacy class and student archive contract", () => {
  it("supports dry-run by default and explicit apply mode", () => {
    expect(source).toContain('const apply = process.argv.includes("--apply")');
    expect(source).toContain('mode: apply ? "apply" : "dry-run"');
    expect(source).toContain("destructive: false");
  });

  it("archives classes, students, and teacher assignments", () => {
    expect(source).toContain("legacy_external_classes_archive");
    expect(source).toContain("legacy_external_students_archive");
    expect(source).toContain("legacy_external_class_teacher_assignments_archive");
    expect(source).toContain("legacy_external_classes_archive_source_idx");
    expect(source).toContain("legacy_external_students_archive_source_idx");
  });

  it("blocks records that are not linked to an active offer", () => {
    expect(source).toContain('o."sourceExternalClassId" = c.id');
    expect(source).toContain('o."sourceExternalClassId" = s."externalClassId"');
    expect(source).toContain('status: classIssues || studentIssues ? "blocked" : "ready"');
  });
});
