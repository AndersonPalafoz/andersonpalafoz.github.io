import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const shell = readFileSync(resolve(root, "app/dashboard/dashboard-shell.tsx"), "utf8");
const profileRoute = readFileSync(resolve(root, "app/api/user/profile/route.ts"), "utf8");

describe("avatar da barra lateral", () => {
  it("reutiliza a foto conhecida antes de revalidar o perfil", () => {
    expect(shell).toContain('AVATAR_CACHE_KEY = "dashboard_sidebar_avatar_v1"');
    expect(shell).toContain("readCachedAvatarUrl()");
    expect(shell).toContain('cache: "default"');
  });

  it("prioriza o download da foto e preserva o fallback acessível", () => {
    expect(shell).toContain('loading="eager"');
    expect(shell).toContain('fetchPriority="high"');
    expect(shell).toContain("getInitials(session?.user?.name)");
  });

  it("permite cache somente privado da resposta autenticada de perfil", () => {
    expect(profileRoute).toContain('"Cache-Control": "private, max-age=300, stale-while-revalidate=86400"');
  });
});
