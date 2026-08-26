import { describe, expect, it } from "vitest";
import { canAccessAdminPortal, canAccessProfessorPortal, getEffectiveRole, isSuperadmin } from "./role-capabilities";

describe("role capabilities", () => {
  it("reconhece o e-mail principal como superadmin sem exigir um papel extra no banco", () => {
    const input = { email: "palafozanderson@gmail.com", role: "admin" as const };
    expect(getEffectiveRole(input)).toBe("superadmin");
    expect(isSuperadmin(input)).toBe(true);
  });

  it("limita o painel administrativo a admin e superadmin", () => {
    expect(canAccessAdminPortal({ role: "admin" })).toBe(true);
    expect(canAccessAdminPortal({ role: "professor" })).toBe(false);
    expect(canAccessAdminPortal({ role: "user" })).toBe(false);
  });

  it("permite que admin, superadmin e professor acessem as operações docentes", () => {
    expect(canAccessProfessorPortal({ role: "professor" })).toBe(true);
    expect(canAccessProfessorPortal({ role: "admin" })).toBe(true);
    expect(canAccessProfessorPortal({ email: "palafozanderson@gmail.com", role: "admin" })).toBe(true);
    expect(canAccessProfessorPortal({ role: "user" })).toBe(false);
  });
});
