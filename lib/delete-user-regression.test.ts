import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("exclusive permanente de usuário", () => {
  it("remove mensagens diretas por remetente ou destinatário antes do registro do usuário", () => {
    const source = readFileSync(join(process.cwd(), "lib/db.ts"), "utf8");
    const functionStart = source.indexOf("export async function deleteUserPermanently");
    const functionSource = source.slice(functionStart, source.indexOf("\n}\n", functionStart) + 3);

    expect(functionStart).toBeGreaterThanOrEqual(0);
    expect(functionSource).toContain(".delete(schema.directMessages)");
    expect(functionSource).toContain("eq(schema.directMessages.senderId, id)");
    expect(functionSource).toContain("eq(schema.directMessages.receiverId, id)");
    expect(functionSource.indexOf(".delete(schema.directMessages)")).toBeLessThan(
      functionSource.indexOf(".delete(schema.users)")
    );
  });
});
