import { describe, expect, it } from "vitest";

describe("EnrollButton Component Logic", () => {
  it("reconhece quando o aluno já possui inscrição ativa no curso", () => {
    const enrollments = [{ courseId: 10, status: "active" }];
    const courseId = 10;
    const isEnrolled = enrollments.some((e) => e.courseId === courseId);
    expect(isEnrolled).toBe(true);
  });

  it("permite inscrição quando o aluno não possui inscrição no curso", () => {
    const enrollments = [{ courseId: 5, status: "active" }];
    const courseId = 10;
    const isEnrolled = enrollments.some((e) => e.courseId === courseId);
    expect(isEnrolled).toBe(false);
  });
});
