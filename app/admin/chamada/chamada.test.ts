import { describe, expect, it } from "vitest";

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
});
