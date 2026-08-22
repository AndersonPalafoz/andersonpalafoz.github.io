import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { courses, users, certificateTemplates } from "@/drizzle/schema";
import { buildCertificatePdf } from "@/lib/certificate-pdf";
import { downloadCertificateTemplate } from "@/lib/learning-storage";
import { loadOfficialPrincipalLogoBytes } from "@/lib/brand-assets-server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      !["admin", "super_admin", "professor"].includes(session.user.role || "")
    ) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const body = await req.json();
    const { userId, courseId, templateId, includeSiteBranding, studentName, studentCourseTitle, studentLevel, studentCpf, customStudentNameSize, customStudentNameColor } = body;

    let studentNameVal = studentName;
    let courseTitleVal = studentCourseTitle;
    let levelVal = studentLevel || "Geral";
    let studentCpfVal = studentCpf || "";

    if (userId && !studentNameVal) {
      const student = await db.query.users.findFirst({ where: eq(users.id, Number(userId)) });
      if (student) {
        studentNameVal = student.name || student.email || "Aluno";
        studentCpfVal = student.cpf || "";
      }
    }

    if (courseId && !courseTitleVal) {
      const course = await db.query.courses.findFirst({ where: eq(courses.id, Number(courseId)) });
      if (course) {
        courseTitleVal = course.title;
        levelVal = course.level || "Geral";
      }
    }

    let selectedTemplate = null;
    if (templateId) {
      selectedTemplate = await db.query.certificateTemplates.findFirst({
        where: eq(certificateTemplates.id, Number(templateId)),
      });
    }

    const includeBranding = includeSiteBranding ?? selectedTemplate?.includeSiteBranding ?? true;

    const [templateBackgroundBytes, logoBytes] = await Promise.all([
      selectedTemplate?.templateUrl
        ? downloadCertificateTemplate(selectedTemplate.templateUrl)
        : Promise.resolve(undefined),
      includeBranding ? loadOfficialPrincipalLogoBytes().catch(() => undefined) : Promise.resolve(undefined),
    ]);

    let fieldMappings: any[] = [];
    if (selectedTemplate?.fieldMappings) {
      try {
        fieldMappings = JSON.parse(selectedTemplate.fieldMappings);
      } catch {
        fieldMappings = [];
      }
    }

    if (customStudentNameSize || customStudentNameColor) {
      const studentField = fieldMappings.find((f: any) => f.key === "studentName");
      if (studentField) {
        studentField.size = customStudentNameSize ? Number(customStudentNameSize) : studentField.size;
        studentField.color = customStudentNameColor || studentField.color;
      } else {
        fieldMappings.push({
          key: "studentName",
          x: 100,
          y: 280,
          size: customStudentNameSize ? Number(customStudentNameSize) : 32,
          color: customStudentNameColor || "#1e293b",
          weight: "bold",
          align: "center",
        });
      }
    }

    const pdfBytes = await buildCertificatePdf({
      studentName: studentNameVal || "Aluno(a) Exemplo",
      studentCpf: studentCpfVal || undefined,
      courseTitle: courseTitleVal || "Curso de Inglês Avançado",
      level: levelVal,
      issuedAt: new Date(),
      certificateCode: "PREVIEW-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      workloadHours: 40,
      includeSiteBranding: includeBranding,
      institutionName: selectedTemplate?.institution || undefined,
      templateBackgroundBytes,
      logoBytes,
      fieldMappings,
    });

    const base64Pdf = Buffer.from(pdfBytes).toString("base64");
    return NextResponse.json({
      success: true,
      pdfDataUri: `data:application/pdf;base64,${base64Pdf}`,
    });
  } catch (error) {
    console.error("Erro ao gerar prévia efetiva do certificado:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao gerar prévia." },
      { status: 500 }
    );
  }
}
