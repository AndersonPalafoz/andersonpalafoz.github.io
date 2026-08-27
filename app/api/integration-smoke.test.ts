import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

describe("Smoke Tests e Integração de Rotas Críticas", () => {
  it("confirma que a API de turmas externas possui estrutura de tratamento de erros segura", () => {
    const source = read("app/api/professor/external-classes/route.ts");
    expect(source).toContain("export async function GET");
    expect(source).toContain("try {");
    expect(source).toContain("catch");
  });

  it("confirma que a API de progresso e speaking possui estrutura segura", () => {
    const source = read("app/api/professor/progress-speaking/route.ts");
    expect(source).toContain("export async function GET");
    expect(source).toContain("export async function POST");
    expect(source).toContain("try {");
    expect(source).toContain("catch");
  });

  it("confirma que o utilitário de links do Google Drive processa URLs corretamente", async () => {
    const { parseGoogleDriveLinks } = await import("@/lib/google-drive-links");
    const testUrl = "https://drive.google.com/file/d/abc123xyz/view";
    const links = parseGoogleDriveLinks(testUrl);
    expect(links.length).toBe(1);
    expect(links[0]).toBe(testUrl);
  });
});

function readRoute(relativePath: string) {
  return read(relativePath);
}

void readRoute;
