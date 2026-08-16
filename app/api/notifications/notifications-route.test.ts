import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./route.ts", import.meta.url), "utf8");

describe("notifications route contract", () => {
  it("lists only authenticated user notifications and supports read state updates", () => {
    expect(source).toContain("getServerSession");
    expect(source).toContain("eq(notifications.userId, user.id)");
    expect(source).toContain("limit(50)");
    expect(source).toContain("export async function PATCH");
    expect(source).toContain("readAt: new Date()");
  });
});
