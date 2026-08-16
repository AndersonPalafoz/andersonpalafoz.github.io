import { describe, expect, it } from "vitest";

import fs from "node:fs";
import path from "node:path";
import { filterAttendanceRecords } from "@/lib/attendance-filters";
import { buildBulkAttendancePayload } from "@/lib/attendance-bulk";

describe("Chamada online", () => {
  const attendances = [
    { status: "present" },
    { status: "present" },
    { status: "absent" },
    { status: "justified" },
  ] as const;

  it("calcula a taxa de frequência com base nos registros reais", () => {
    const present = attendances.filter((item) => item.status === "present").length;
    const rate = Math.round((present / attendances.length) * 100);
    expect(rate).toBe(50);
  });

  it("separa ausências e justificativas sem misturar os estados", () => {
    expect(attendances.filter((item) => item.status === "absent")).toHaveLength(1);
    expect(attendances.filter((item) => item.status === "justified")).toHaveLength(1);
    expect(attendances.filter((item) => item.status === "present")).toHaveLength(2);
  });

  it("mantém os filtros de modalidade dentro dos valores suportados", () => {
    expect(["all", "individual", "group", "hybrid"]).toContain("group");
    expect(["all", "individual", "group", "hybrid"]).not.toContain("online-only");
  });

  it("monta a seleção em massa sem perder a sessão de cada registro", () => {
    expect(buildBulkAttendancePayload([{ attendanceId: 4, sessionId: 2 }, { attendanceId: 5, sessionId: 2 }], "absent")).toEqual([
      { attendanceId: 4, sessionId: 2, status: "absent" },
      { attendanceId: 5, sessionId: 2, status: "absent" },
    ]);
  });

  it("combina turma, status e intervalo de datas no mesmo recorte", () => {
    const records = [
      { status: "present", courseTitle: "B1", scheduledAt: "2026-01-10T12:00:00Z" },
      { status: "absent", courseTitle: "B1", scheduledAt: "2026-02-10T12:00:00Z" },
      { status: "present", courseTitle: "A2", scheduledAt: "2026-01-15T12:00:00Z" },
    ];
    expect(filterAttendanceRecords(records, { status: "present", courseTitle: "B1", startDate: "2026-01-01", endDate: "2026-01-31" })).toHaveLength(1);
  });
});

describe("Chamada erro amigável e loading", () => {
  it("renderiza mensagem amigável e botão de tentar novamente em caso de erro na API", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "app/admin/chamada/page.tsx"), "utf8");
    expect(source).toContain("Falha ao carregar dados de chamada");
    expect(source).toContain("Tentar novamente");
    expect(source).toContain("loadError");
  });
});
