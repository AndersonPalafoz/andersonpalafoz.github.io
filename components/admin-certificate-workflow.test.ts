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
    expect(page).toContain("3 etapas oficiais · laboratório experimental separado");
    expect(page).toContain("O laboratório com Fabric, Konva e GrapesJS permanece separado para experimentação e não participa da emissão oficial.");
  });

  it("keeps the issued certificate list searchable, filterable and mobile-friendly", () => {
    const manager = read("components/certificate-standard-manager.tsx");
    expect(manager).toContain('placeholder="Buscar por aluno, curso ou código..."');
    expect(manager).toContain('aria-label="Filtrar por status"');
    expect(manager).toContain('aria-label="Ordenar certificados"');
    expect(manager).toContain("const totalPages");
    expect(manager).toContain("md:hidden");
    expect(manager).toContain("Tentar novamente");
  });
});

export {};
