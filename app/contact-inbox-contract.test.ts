import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(`./${path}`, import.meta.url), "utf8");

describe("contact inbox workflow", () => {
  it("submits the public form to the contact API", () => {
    const source = read("../components/contact-form.tsx");
    expect(source).toContain('fetch("/api/contact"');
    expect(source).toContain("Enviando sua mensagem para a central administrativa");
    expect(source).not.toContain("window.location.href = url");
    expect(source).not.toContain("buildContactMailto");
  });

  it("persists administrative replies internally", () => {
    const route = read("api/admin/messages/route.ts");
    expect(route).toContain("adminReply: reply");
    expect(route).toContain("repliedAt: new Date()");
    expect(route).toContain("repliedBy: email || null");
    expect(route).not.toContain("sendEmailNotification");
  });

  it("keeps external courses out of the public catalog by type and category", () => {
    const page = read("cursos/page.tsx");
    expect(page).toContain('Number(c.courseType) !== 4');
    expect(page).toContain('c.category !== "Curso Externo / Avulso"');
  });
});

