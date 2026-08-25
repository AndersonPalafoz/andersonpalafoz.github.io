import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("admin certificate workflow", () => {
  it("prioritizes official operations and keeps technical editors in a separate stage", () => {
    const workflow = read("components/admin-certificate-workflow.tsx");
    expect(workflow).toContain('type WorkflowStage = "issue" | "templates" | "signatures" | "laboratory"');
    expect(workflow).toContain('label: "Emitir certificados"');
    expect(workflow).toContain('label: "Gerenciar modelos"');
    expect(workflow).toContain('label: "Revisar assinaturas"');
    expect(workflow).toContain('label: "Laboratório experimental"');
    expect(workflow).toContain("CertificateStandardManager");
    expect(workflow).toContain("3 engines");
  });

  it("uses operational metadata and explains the stage/editor distinction", () => {
    const page = read("app/admin/certificados/page.tsx");
    expect(page).toContain('title: "Certificados | Administração"');
    expect(page).toContain("3 etapas de trabalho · 4 opções de editor");
    expect(page).toContain("Os editores técnicos ficam disponíveis no laboratório experimental.");
  });
});

export {};
