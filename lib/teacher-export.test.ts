import { describe, it, expect } from "vitest";
import { exportTeacherPublicationToGoogle } from "./teacher-google-export";

describe("Teacher Google Export Contract", () => {
  it("deve exportar publicações para o Google Drive particular do professor com sucesso", async () => {
    const res = await exportTeacherPublicationToGoogle({
      title: "Curso de Inglês Instrumental",
      description: "Material avançado para leitura técnica.",
      targetType: "drive",
    });

    expect(res.success).toBe(true);
    expect(res.target).toBe("drive");
    expect(res.destinationId).toBeDefined();
  });

  it("deve exportar publicações para o Google Classroom do professor com sucesso", async () => {
    const res = await exportTeacherPublicationToGoogle({
      title: "Quiz 01 - Present Perfect",
      description: "Atividade prática de gramática.",
      targetType: "classroom",
      courseId: "course_123",
    });

    expect(res.success).toBe(true);
    expect(res.target).toBe("classroom");
    expect(res.destinationId).toBeDefined();
  });
});
