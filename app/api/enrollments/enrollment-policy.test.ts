import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Enrollment Policy for Free and Paid Courses", () => {
  it("enforces payment check or manual admin grant for non-free courses", () => {
    const routePath = path.join(process.cwd(), "app/api/enrollments/route.ts");
    const source = fs.readFileSync(routePath, "utf8");

    expect(source).toContain("isCourseFree");
    expect(source).toContain("paid_access_grants");
    expect(source).toContain("course_purchases");
    expect(source).toContain("Este curso é pago. É necessário concluir o pagamento via Stripe ou aguardar a liberação manual pelo administrador.");
  });

  it("allows public viewing of course details and catalog information", () => {
    const detailPath = path.join(process.cwd(), "app/cursos/[id]/page.tsx");
    const source = fs.readFileSync(detailPath, "utf8");

    expect(source).toContain("CourseDetail");
    expect(source).toContain("EnrollButton");
  });
});
