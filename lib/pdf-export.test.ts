import { describe, expect, it } from "vitest";
import { createTablePdf } from "./pdf-export";

describe("PDF exports", () => {
  it("creates a non-empty PDF document with a PDF signature", async () => {
    const bytes = await createTablePdf("Relatório", ["Curso", "Status"], [["English A1", "Concluído"]]);
    expect(bytes.length).toBeGreaterThan(100);
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
  });

  it("supports long values by wrapping table cells", async () => {
    const bytes = await createTablePdf("Relatório", ["Descrição"], [["Uma descrição longa que precisa ser quebrada em várias linhas para caber no relatório sem perder informação."]]);
    expect(bytes.length).toBeGreaterThan(100);
  });
});
