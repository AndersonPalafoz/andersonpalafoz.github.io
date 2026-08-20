import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Theme Persistence on Reload", () => {
  it("injects a blocking restoration script in the head to prevent FOUC", () => {
    const layoutContent = readFileSync(join(process.cwd(), "app/layout.tsx"), "utf8");

    expect(layoutContent).toContain("dangerouslySetInnerHTML");
    expect(layoutContent).toContain('localStorage.getItem("themeMode")');
    expect(layoutContent).toContain("root.classList.remove(\"dark\", \"high-contrast\")");
    expect(layoutContent).toContain('mode === "contrast"');
    expect(layoutContent).toContain('mode === "dark"');
    expect(layoutContent).toContain('mode === "light"');
    expect(layoutContent).toContain('window.matchMedia(\"(prefers-color-scheme: dark)\")');
  });

  it("uses one theme source of truth instead of a competing next-themes storage key", () => {
    const providerContent = readFileSync(join(process.cwd(), "components/theme-provider.tsx"), "utf8");
    const layoutContent = readFileSync(join(process.cwd(), "app/layout.tsx"), "utf8");
    const navbarContent = readFileSync(join(process.cwd(), "components/navbar.tsx"), "utf8");

    expect(providerContent).not.toContain("next-themes");
    expect(layoutContent).not.toContain('defaultTheme="system"');
    expect(layoutContent).not.toContain('enableSystem');
    expect(navbarContent).toContain('applyTheme(storedMode, false)');
    expect(navbarContent).toContain('applyTheme("system", false)');
  });
});
