import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");

describe("Google Calendar API status handling", () => {
  it("detects when the Google Calendar API is disabled and provides an activation link guidance", () => {
    const apiCode = read("lib/google-calendar-api.ts");
    expect(apiCode).toContain("has not been used in project");
    expect(apiCode).toContain("calendar-json.googleapis.com/overview");
  });

  it("renders a direct activation button in the calendar page when insufficient scope or disabled error occurs", () => {
    const calendarPage = read("app/dashboard/calendario/page.tsx");
    expect(calendarPage).toContain("Ativar API no Google Cloud");
    expect(calendarPage).toContain("calendar-json.googleapis.com/overview?project=248382742983");
  });
});
