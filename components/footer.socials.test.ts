import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const footer = readFileSync(new URL("./footer.tsx", import.meta.url), "utf8");

describe("official social links", () => {
  it("renders Anderson Palafoz official profiles in the footer", () => {
    expect(footer).toContain("https://www.linkedin.com/in/andersonpalafoz/");
    expect(footer).toContain("http://instagram.com/andersonpalafoz");
    expect(footer).toContain("https://www.facebook.com/APalafoz/");
  });

  it("opens social profiles safely in a new tab", () => {
    expect(footer.match(/target=\"_blank\"/g)?.length).toBeGreaterThanOrEqual(3);
    expect(footer.match(/rel=\"noopener noreferrer\"/g)?.length).toBeGreaterThanOrEqual(3);
  });
});
