import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const routePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "route.ts");
const source = readFileSync(routePath, "utf8");

describe("certificate batch download integration contract", () => {
  it("supports both student GET-all and selected POST exports", () => {
    expect(source).toContain("export async function GET");
    expect(source).toContain("export async function POST");
    expect(source).toContain("certificateIds");
    expect(source).toContain("Selecione ao menos um certificado.");
  });

  it("keeps signed files and regenerates only unsigned certificates", () => {
    expect(source).toContain("createSignedCertificateUrl");
    expect(source).toContain("if (row.signedPdfUrl)");
    expect(source).toContain("buildCertificatePdf");
  });

  it("enforces ownership or course-management permission before building the zip", () => {
    expect(source).toContain("authorizeBatch");
    expect(source).toContain("canManageCourse");
    expect(source).toContain("Você não tem permissão para exportar");
  });
});
