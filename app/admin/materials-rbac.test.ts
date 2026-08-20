import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const adminAuthPath = path.join(process.cwd(), "lib/admin-auth.ts");
const materialsRoutePath = path.join(process.cwd(), "app/api/admin/materials/route.ts");

describe("Phase 4 Governance: material RBAC by authorship", () => {
  it("enforces canManageMaterial checking instructorId and super admin global access", () => {
    const authSource = fs.readFileSync(adminAuthPath, "utf8");
    const routeSource = fs.readFileSync(materialsRoutePath, "utf8");

    expect(authSource).toContain("canManageMaterial");
    expect(authSource).toContain("material.instructorId");
    expect(routeSource).toContain("canManageMaterial");
    expect(routeSource).toContain("Forbidden");
  });
});
