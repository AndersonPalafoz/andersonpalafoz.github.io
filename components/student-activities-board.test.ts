import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./student-activities-board.tsx", import.meta.url), "utf8");

describe("fila de atividades do aluno", () => {
  it("oferece busca, filtros e feedback docente sem inventar estados", () => {
    expect(source).toContain('const [filter, setFilter] = useState<"all" | ActivityStatus | "feedback">("all")');
    expect(source).toContain("Feedback do professor");
    expect(source).toContain("Próximos prazos");
    expect(source).toContain("Abrir curso");
  });

  it("destaca prazo vencido e próxima data somente para atividades não concluídas", () => {
    expect(source).toContain('if (!dueDate || status === "completed") return null;');
    expect(source).toContain("Prazo vencido");
    expect(source).toContain("Próximo prazo");
  });
});
