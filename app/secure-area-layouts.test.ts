import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (relativePath: string) => fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("secure area layout audit", () => {
  it("keeps server-side admin and dashboard boundaries", () => {
    expect(read("app/admin/layout.tsx")).toContain("getServerSession");
    expect(read("app/admin/layout.tsx")).toContain("isAuthorized");
    expect(read("app/admin/layout.tsx")).toContain("canAccessAdminPortal");
    expect(read("app/admin/layout.tsx")).toContain('/login?callbackUrl=/admin');
    expect(read("app/dashboard/layout.tsx")).toContain("getServerSession");
    expect(read("app/dashboard/layout.tsx")).toContain("/login?callbackUrl=/dashboard");
    expect(read("app/dashboard/layout.tsx")).toContain("approvalStatus");
    expect(read("app/dashboard/dashboard-shell.tsx")).toContain("useSession");
    expect(read("app/dashboard/dashboard-shell.tsx")).toContain("/api/user/profile");
  });

  it("provides responsive loading and recoverable error states", () => {
    expect(read("app/admin/loading.tsx")).toContain("aria-busy=\"true\"");
    expect(read("app/admin/loading.tsx")).toContain("Skeleton");
    expect(read("app/admin/error.tsx")).toContain("Tentar novamente");
    expect(read("app/dashboard/loading.tsx")).toContain("md:hidden");
    expect(read("app/dashboard/loading.tsx")).toContain("Skeleton");
    expect(read("app/dashboard/error.tsx")).toContain("Nenhum progresso ou informação foi inventado");
  });
});
