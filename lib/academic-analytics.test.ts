import { describe, expect, it } from "vitest";
import { buildAcademicTimeline } from "./academic-analytics";
import { attendanceStatusLabel, buildAttendanceCsv } from "./attendance-export";

describe("academic analytics", () => {
  it("agrega a média de notas e a frequência por mês", () => {
    const timeline = buildAcademicTimeline(
      [
        { score: 80, occurredAt: "2026-01-05T12:00:00Z" },
        { score: 100, occurredAt: "2026-01-20T12:00:00Z" },
        { score: 60, occurredAt: "2026-02-05T12:00:00Z" },
      ],
      [
        { status: "present", occurredAt: "2026-01-06T12:00:00Z" },
        { status: "absent", occurredAt: "2026-01-07T12:00:00Z" },
        { status: "present", occurredAt: "2026-02-07T12:00:00Z" },
      ],
    );

    expect(timeline).toEqual([
      { month: "jan 26", monthKey: "2026-01", averageGrade: 90, gradeCount: 2, attendanceRate: 50, attendancePresent: 1, attendanceTotal: 2 },
      { month: "fev 26", monthKey: "2026-02", averageGrade: 60, gradeCount: 1, attendanceRate: 100, attendancePresent: 1, attendanceTotal: 1 },
    ]);
  });

  it("ignora pontuações e datas inválidas sem criar série artificial", () => {
    expect(buildAcademicTimeline(
      [{ score: null, occurredAt: "2026-01-01T12:00:00Z" }, { score: 70, occurredAt: null }],
      [{ status: "present", occurredAt: null }],
    )).toEqual([]);
  });
});

describe("attendance export", () => {
  it("gera CSV com cabeçalho, status traduzido e valores escapados", () => {
    const csv = buildAttendanceCsv([{
      sessionTitle: "Speaking; Aula 1",
      scheduledAt: "2026-01-10T12:00:00Z",
      courseTitle: "Inglês B1",
      studentName: "Ana \"Bia\"",
      studentEmail: "ana@example.com",
      status: "justified",
      notes: "Consulta médica",
    }]);

    expect(csv).toContain("\uFEFF");
    expect(csv).toContain("\"Speaking; Aula 1\"");
    expect(csv).toContain("\"Ana \"\"Bia\"\"\"");
    expect(csv).toContain("\"Justificado\"");
  });

  it("traduz os estados oficiais de presença", () => {
    expect(attendanceStatusLabel("present")).toBe("Presente");
    expect(attendanceStatusLabel("absent")).toBe("Ausente");
    expect(attendanceStatusLabel("justified")).toBe("Justificado");
  });
});
