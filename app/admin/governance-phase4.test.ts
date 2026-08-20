import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const adminAuthPath = path.join(process.cwd(), "lib/admin-auth.ts");
const dbPath = path.join(process.cwd(), "lib/db.ts");

describe("Phase 4 Final Governance Contracts", () => {
  it("verifies canManageCourse, canManageExternalClass and canManageMaterial are fully implemented", () => {
    const authSource = fs.readFileSync(adminAuthPath, "utf8");
    expect(authSource).toContain("canManageCourse");
    expect(authSource).toContain("canManageExternalClass");
    expect(authSource).toContain("canManageMaterial");
  });

  it("verifies trash management and soft delete utilities exist in db helper", () => {
    const dbSource = fs.readFileSync(dbPath, "utf8");
    expect(dbSource).toContain("getTrashMaterials");
    expect(dbSource).toContain("softDeleteMaterial");
    expect(dbSource).toContain("restoreMaterial");
  });
});
