import { describe, it, expect } from "vitest";
import FaqPage from "./page";

describe("FaqPage Component Contract", () => {
  it("deve exportar metadata válida e o componente FaqPage", () => {
    expect(FaqPage).toBeDefined();
    expect(typeof FaqPage).toBe("function");
  });
});
