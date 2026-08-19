import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");

describe("external classes welcome email feature", () => {
  const page = read("app/professor/turmas-externas/page.tsx");
  const route = read("app/api/professor/external-classes/route.ts");

  it("contains the welcome email button and handler in the UI", () => {
    expect(page).toContain("handleSendWelcomeEmail");
    expect(page).toContain("Boas-vindas");
    expect(page).toContain("Mail");
  });

  it("contains the server-side action handler for sending welcome emails", () => {
    expect(route).toContain('action === "sendWelcomeEmail"');
    expect(route).toContain("sendEmailNotification");
  });
});
