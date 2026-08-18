import { describe, expect, it } from "vitest";
import { filterPlatformDriveFiles } from "@/lib/google-drive";
import { filterPlatformClassroomCourses } from "@/lib/google-classroom-filter";

describe("Google Workspace Scope Restriction", () => {
  it("filters Google Drive files to platform-relevant items only", () => {
    const rawFiles = [
      { id: "1", name: "Anderson Palafoz - Worksheet B1.pdf", description: "Aula de phrasal verbs" },
      { id: "2", name: "Receita de Bolo da Vovó.pdf", description: "Familiar" },
      { id: "3", name: "Curso de Inglês - Modulo 1.docx", description: "Gramática" },
      { id: "4", name: "Fotos de Férias 2024.zip", description: "Pessoal" },
    ];
    const filtered = filterPlatformDriveFiles(rawFiles);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((f) => f.id)).toEqual(["1", "3"]);
  });

  it("filters Google Classroom courses to platform-relevant classes only", () => {
    const rawCourses = [
      { id: "c1", name: "English Grammar Advanced B2/C1", section: "Anderson Palafoz" },
      { id: "c2", name: "Física Quântica Avançada", section: "Turma B" },
      { id: "c3", name: "Projeto SIMAL - Inglês para Comunidades", section: "UFBA" },
    ];
    const filtered = filterPlatformClassroomCourses(rawCourses);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((c) => c.id)).toEqual(["c1", "c3"]);
  });
});
