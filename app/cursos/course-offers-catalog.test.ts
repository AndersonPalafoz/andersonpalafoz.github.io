import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("published course offers frontend integration", () => {
  it("loads only published, non-deleted offers in the catalog", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "app/cursos/page.tsx"), "utf8");
    expect(source).toContain("courseOffers.status, \"published\"");
    expect(source).toContain("isNull(courseOffers.deletedAt)");
    expect(source).toContain("publishedOffersByCourse");
  });

  it("passes published offers to the enrollment control on course detail", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "app/cursos/[id]/page.tsx"), "utf8");
    expect(source).toContain("listPublishedCourseOffers(courseId)");
    expect(source).toContain("offers={offers.map");
    expect(source).toContain("resumeLessonId");
  });

  it("shows the offer summary without changing the legacy course link", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "components/course-catalog.tsx"), "utf8");
    expect(source).toContain("publishedOffers");
    expect(source).toContain("ofertas publicadas");
    expect(source).toContain("href={`/cursos/${course.id}`}");
  });
});
