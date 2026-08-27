import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const reportPage = readFileSync(
  resolve(process.cwd(), "app/professor/boletim/[studentId]/page.tsx"),
  "utf8"
);

describe("boletim externo em smartphones", () => {
  it("usa a largura do shell protegido e empilha as ações do cabeçalho em 360px", () => {
    expect(reportPage).toContain('bg-gray-50 py-2 text-gray-900');
    expect(reportPage).toContain('flex flex-col items-stretch gap-3');
    expect(reportPage).toContain('min-h-11 w-full items-center justify-center');
  });

  it("mantém notas, frequência e identificadores em cartões que aceitam conteúdo longo", () => {
    expect(reportPage).toContain('article key={idx} className="space-y-4 rounded-3xl');
    expect(reportPage).toContain('min-w-0 flex-1');
    expect(reportPage).toContain('shrink-0 whitespace-nowrap font-black text-red-600');
    expect(reportPage).toContain('flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between');
    expect(reportPage).toContain('grid grid-cols-3 gap-2 text-center text-[10px]');
  });
});
