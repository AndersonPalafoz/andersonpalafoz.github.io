import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Navbar authenticated rendering regression", () => {
  it("keeps the avatar Image component explicitly imported for authenticated sessions", () => {
    const source = readFileSync(resolve(process.cwd(), "components/navbar.tsx"), "utf8");

    expect(source).toContain('import Image from "next/image";');
    expect(source).toMatch(/<Image\s+src=\{session\.user\.image\}/);
  });
});

