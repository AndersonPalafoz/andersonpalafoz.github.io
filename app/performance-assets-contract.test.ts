import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("performance asset contract", () => {
  it("loads brand fonts through next/font without duplicate CSS imports", () => {
    const layout = readFileSync(resolve(process.cwd(), "app/layout.tsx"), "utf8");
    const globals = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");

    expect(layout).toContain('from "next/font/google"');
    expect(layout).toContain('variable: "--font-poppins"');
    expect(layout).toContain('display: "swap"');
    expect(globals).not.toContain("fonts.googleapis.com");
  });

  it("uses responsive Next image optimization for the public brand assets", () => {
    const home = readFileSync(resolve(process.cwd(), "app/page.tsx"), "utf8");
    const navbar = readFileSync(resolve(process.cwd(), "components/navbar.tsx"), "utf8");
    const footer = readFileSync(resolve(process.cwd(), "components/footer.tsx"), "utf8");
    const config = readFileSync(resolve(process.cwd(), "next.config.ts"), "utf8");

    expect(home).toContain('<Image');
    expect(home).toContain('sizes="(max-width: 1024px) 80vw, 32rem"');
    expect(navbar).toContain("priority");
    expect(footer).toContain('<Image');
    expect(config).toContain('formats: ["image/avif", "image/webp"]');
    expect(config).toContain("minimumCacheTTL: 60 * 60 * 24 * 30");
  });
});
