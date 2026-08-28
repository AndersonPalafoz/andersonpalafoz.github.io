import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const externalPage = readFileSync(new URL("./turmas-externas/page.tsx", import.meta.url), "utf8");
const progressPage = readFileSync(new URL("./progresso-aulas/page.tsx", import.meta.url), "utf8");
const progressRoute = readFileSync(new URL("../api/professor/progress-speaking/route.ts", import.meta.url), "utf8");
const legacyRoute = readFileSync(new URL("../api/professor/external-classes/route.ts", import.meta.url), "utf8");

describe("offer context integration contracts", () => {
  it("keeps the legacy class URL while adding offerId to workspace navigation and payloads", () => {
    expect(externalPage).toContain("offerId?: number | null");
    expect(externalPage).toContain("getAcademicContextPayload");
    expect(externalPage).toContain('url.searchParams.set("offerId", String(selectedClass.offerId))');
    expect(externalPage).toContain('action: "saveAttendance", ...getAcademicContextPayload(classId)');
    expect(externalPage).toContain('action: "saveGrade"');
  });

  it("loads and refreshes progress using the selected offer context", () => {
    expect(progressPage).toContain("useSearchParams");
    expect(progressPage).toContain("/api/professor/progress-speaking${contextQuery}");
    expect(progressPage).toContain('payload.append("offerId", offerId)');
    expect(progressPage).toContain('payload.append("classId", classId)');
  });

  it("enforces offer access and enrollment before returning contextual progress", () => {
    expect(progressRoute).toContain("resolveAcademicContext");
    expect(progressRoute).toContain("canAccessAcademicContext");
    expect(progressRoute).toContain("courseOfferStudents");
    expect(progressRoute).toContain("O aluno não está matriculado nesta oferta.");
  });

  it("validates that offerId and classId refer to the same legacy source", () => {
    expect(legacyRoute).toContain("requestedOfferId");
    expect(legacyRoute).toContain("A oferta e a turma informadas não correspondem.");
    expect(legacyRoute).toContain("sourceExternalClassId");
  });
});
