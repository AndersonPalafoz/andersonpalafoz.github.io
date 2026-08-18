import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");

describe("Google OAuth safety contract", () => {
  it("keeps Workspace scopes out of the default login provider", () => {
    const auth = read("lib/auth.ts");
    expect(auth).not.toContain("calendar.readonly");
  });

  it("requests Calendar only from the explicit calendar authorization action", () => {
    const calendarPage = read("app/dashboard/calendario/page.tsx");
    expect(calendarPage).toContain('Autorizar Google Calendar');
    expect(calendarPage).toContain('scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly"');
    expect(calendarPage).toContain('prompt: "consent"');
  });

  it("explains consent failures without claiming that Calendar data was imported", () => {
    const login = read("app/login/page.tsx");
    expect(login).toContain("O Google recusou o consentimento");
    expect(login).toContain("usuário de teste");
    expect(login).toContain("window.history.replaceState");
  });
});
