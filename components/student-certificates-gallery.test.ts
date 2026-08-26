import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const componentPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "student-certificates-gallery.tsx");
const routePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../app/api/user/certificates/batch-download/route.ts");
const componentSource = readFileSync(componentPath, "utf8");
const routeSource = readFileSync(routePath, "utf8");

describe("student certificate gallery integration", () => {
  it("offers a student-scoped ZIP export using the shared batch endpoint", () => {
    expect(componentSource).toContain("/api/user/certificates/batch-download");
    expect(componentSource).toContain("Baixar todos em ZIP");
    expect(componentSource).toContain('method: "GET"');
    expect(routeSource).toContain("eq(certificates.userId, currentUser.id)");
  });

  it("keeps signed download and verification sharing available per certificate", () => {
    expect(componentSource).toContain("signedPdfUrl");
    expect(componentSource).toContain("/verificar/");
    expect(componentSource).toContain("includeSiteBranding");
  });
});
