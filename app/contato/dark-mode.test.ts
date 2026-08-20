import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("Contact page dark mode contrast", () => {
  it("defines dark backgrounds and foregrounds for the page shell and form", () => {
    const page = read("app/contato/page.tsx");
    const form = read("components/contact-form.tsx");

    expect(page).toContain("dark:bg-slate-950");
    expect(page).toContain("dark:text-slate-100");
    expect(page).toContain("dark:bg-slate-900");
    expect(form).toContain("dark:bg-slate-900/80");
    expect(form).toContain("dark:text-slate-100");
    expect(form).toContain("dark:placeholder:text-slate-500");
  });
});
