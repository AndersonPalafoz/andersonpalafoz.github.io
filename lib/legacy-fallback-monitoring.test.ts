import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const monitoringSource = readFileSync(resolve(process.cwd(), "lib/legacy-fallback-monitoring.ts"), "utf8");
const contextSource = readFileSync(resolve(process.cwd(), "lib/academic-context.ts"), "utf8");
const accessLogsSource = readFileSync(resolve(process.cwd(), "app/api/admin/access-logs/route.ts"), "utf8");

 describe("legacy fallback monitoring contract", () => {
  it("uses a dedicated event and does not persist email or personal data", () => {
    expect(monitoringSource).toContain('eventType: "legacy_fallback_read"');
    expect(monitoringSource).toContain("classId");
    expect(monitoringSource).not.toContain("userEmail");
    expect(monitoringSource).not.toContain("studentName");
  });

  it("instruments both classId compatibility and legacy-only fallback", () => {
    expect(contextSource).toContain('reason: "class-id-compatibility"');
    expect(contextSource).toContain('reason: "legacy-only-fallback"');
  });

  it("exposes the fallback event to administrators", () => {
    expect(accessLogsSource).toContain('"legacy_fallback_read"');
  });
});
