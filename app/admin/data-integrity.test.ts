import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const reportsRoute = readFileSync(new URL("../api/admin/academic-reports/route.ts", import.meta.url), "utf8");
const studentReportRoute = readFileSync(new URL("../api/admin/academic-reports/student/route.ts", import.meta.url), "utf8");
const classroomSyncRoute = readFileSync(new URL("../api/admin/classroom-sync/route.ts", import.meta.url), "utf8");
const cmsPage = readFileSync(new URL("./cms/page.tsx", import.meta.url), "utf8");

describe("Painel Administrativo: integridade de dados reais", () => {
  it("não inventa notas ou fórmulas arbitrárias nos relatórios acadêmicos", () => {
    expect(reportsRoute).not.toContain("7.5 +");
    expect(reportsRoute).not.toContain("student.id * 3");
    expect(reportsRoute).toContain("externalClassGrades");
  });

  it("não define proveniência baseada em paridade de ID de estudante", () => {
    expect(studentReportRoute).not.toContain("studentId % 2 === 0");
    expect(studentReportRoute).toContain("Plataforma Local");
  });

  it("sincroniza turmas e tarefas reais do Classroom sem contagens fixas", () => {
    expect(classroomSyncRoute).toContain("listGoogleClassroomCourses");
    expect(classroomSyncRoute).toContain("googleClassroomConnections");
    expect(classroomSyncRoute).not.toContain("syncedCourses = 3");
  });

  it("carrega a biblioteca de mídia do CMS diretamente do banco e Supabase Storage", () => {
    expect(cmsPage).toContain("/api/admin/media");
    expect(cmsPage).not.toContain("{ name: \"Logo Padrão\", url: \"/logo-horizontal.png\" }");
  });
});
