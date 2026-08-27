import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("course offer context in learner navigation", () => {
  it("returns offerIds with legacy enrollments", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "lib/db.ts"), "utf8");
    expect(source).toContain("courseOfferStudents");
    expect(source).toContain("offerIdsByCourse");
    expect(source).toContain("offerIds: offerIdsByCourse.get(enrollment.courseId)");
  });

  it("preserves offerId in dashboard course links", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "app/dashboard/page.tsx"), "utf8");
    expect(source).toContain("enr.offerIds?.[0]");
    expect(source).toContain("?offerId=");
  });

  it("preserves offerId from course detail to lesson navigation", () => {
    const detail = fs.readFileSync(path.join(process.cwd(), "app/cursos/[id]/page.tsx"), "utf8");
    const lesson = fs.readFileSync(path.join(process.cwd(), "app/cursos/[id]/aulas/[lessonId]/page.tsx"), "utf8");
    expect(detail).toContain("offerId={offerId}");
    expect(detail).toContain("?offerId=${offerId}");
    expect(lesson).toContain("useSearchParams");
    expect(lesson).toContain("courseContextQuery");
    expect(lesson).toContain("/progress${courseContextQuery}");
  });
});
