import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, getCertificateTemplateById } from "@/lib/db";
import { certificates, courses, users } from "@/drizzle/schema";
import { and, eq, inArray } from "drizzle-orm";
import { buildCertificatePdf } from "@/lib/certificate-pdf";
import {
  downloadCertificateTemplate,
  uploadCertificatePdf,
} from "@/lib/learning-storage";
import { loadOfficialPrincipalLogoBytes } from "@/lib/brand-assets-server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function parseOptionalBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return undefined;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      !["admin", "super_admin", "professor"].includes(session.user.role || "")
    ) {
      return NextResponse.json(
        { error: "Acesso restrito a administradores e professores." },
        { status: 403 }
      );
    }

    const allCertificates = await db.query.certificates.findMany({
      with: {
        user: true,
        course: true,
      },
      orderBy: (certificates, { desc }) => [desc(certificates.issueDate)],
    });

    const formatted = allCertificates.map(c => ({
      id: c.id,
      studentName: c.user?.name || "Estudante",
      courseTitle: c.course?.title || "Curso Oficial",
      verificationCode: c.verificationCode || `AP-${c.id}`,
      issueDate: c.issueDate ? new Date(c.issueDate).toLocaleDateString("pt-BR") : "Hoje",
      certificateUrl: c.certificateUrl,
      signed: Boolean(c.certificateUrl),
    }));

    return NextResponse.json({ success: true, certificates: formatted });
  } catch (error: any) {
    console.error("API Error listing certificates:", error);
    return NextResponse.json(
      { error: error?.message || "Erro ao listar certificados." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      !["admin", "super_admin", "professor"].includes(session.user.role || "")
    ) {
      return NextResponse.json(
        { error: "Acesso restrito a administradores e professores." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Dados inválidos na requisição." },
        { status: 400 }
      );
    }

    let courseId = body.courseId ? Number(body.courseId) : null;
    let userId = body.userId ? Number(body.userId) : null;
    const directStudentName = typeof body.studentName === "string" ? body.studentName.trim() : "";
    const directStudentEmail = typeof body.studentEmail === "string" ? body.studentEmail.trim() : "";
    
    const customCourseTitle = typeof body.customCourseTitle === "string" ? body.customCourseTitle.trim() : "";
    const customCourseLevel = typeof body.customCourseLevel === "string" ? body.customCourseLevel.trim() : "Geral";
    const customWorkloadHours = body.customWorkloadHours ? Number(body.customWorkloadHours) : 40;
    const customInstitution = typeof body.customInstitution === "string" ? body.customInstitution.trim() : "";

    if (!userId && !directStudentName) {
      return NextResponse.json(
        { error: "Informe o aluno cadastrado (userId) ou o nome completo para emitir certificado a pessoa sem cadastro." },
        { status: 400 }
      );
    }

    if (!courseId && !customCourseTitle) {
      return NextResponse.json(
        { error: "Selecione um curso da lista ou preencha o título do curso manualmente." },
        { status: 400 }
      );
    }

    const templateId =
      body.templateId == null || body.templateId === ""
        ? null
        : Number(body.templateId);
    const requestedBranding = parseOptionalBoolean(body.includeSiteBranding);

    let student: any = null;
    if (userId) {
      student = await db.query.users.findFirst({ where: eq(users.id, userId) });
    } else if (directStudentName) {
      const placeholderEmail = directStudentEmail || `nao-cadastrado-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@external.placeholder`;
      const existingPlaceholder = await db.query.users.findFirst({
        where: eq(users.email, placeholderEmail),
      });
      if (existingPlaceholder) {
        student = existingPlaceholder;
        userId = student.id;
      } else {
        const placeholderOpenId = `manual-ext-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const insertedUsers = await db
          .insert(users)
          .values({
            openId: placeholderOpenId,
            name: directStudentName,
            email: placeholderEmail,
            role: "user",
            loginMethod: "manual_external",
            approvalStatus: "approved",
          })
          .returning({ id: users.id });
        const insertedUser = insertedUsers[0];
        student = await db.query.users.findFirst({ where: eq(users.id, insertedUser.id) });
      }
    }

    let course: any = null;
    if (courseId) {
      course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
    }

    if (!course && !customCourseTitle) {
      return NextResponse.json(
        { error: "Curso ou informações customizadas não encontrados." },
        { status: 404 }
      );
    }

    if (!courseId && customCourseTitle) {
      const existingCustomCourse = await db.query.courses.findFirst({
        where: eq(courses.title, customCourseTitle),
      });
      if (existingCustomCourse) {
        courseId = existingCustomCourse.id;
        course = existingCustomCourse;
      } else {
        const newCourses = await db
          .insert(courses)
          .values({
            title: customCourseTitle,
            level: customCourseLevel || "Geral",
            workloadHours: customWorkloadHours || 40,
            category: customInstitution || "Curso Externo / Avulso",
            isFree: false,
          })
          .returning({ id: courses.id });
        const newCourse = newCourses[0];
        courseId = newCourse.id;
        course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
      }
    }

    const selectedTemplate = templateId
      ? await getCertificateTemplateById(templateId)
      : null;
    if (templateId && !selectedTemplate) {
      return NextResponse.json(
        { error: "O modelo de certificado selecionado não foi encontrado." },
        { status: 404 }
      );
    }

    const includeSiteBranding =
      requestedBranding ?? selectedTemplate?.includeSiteBranding ?? true;
    const [templateBackgroundBytes, logoBytes] = await Promise.all([
      selectedTemplate?.templateUrl
        ? downloadCertificateTemplate(selectedTemplate.templateUrl)
        : Promise.resolve(undefined),
      includeSiteBranding
        ? loadOfficialPrincipalLogoBytes().catch(() => undefined)
        : Promise.resolve(undefined),
    ]);

    let fieldMappings: Parameters<
      typeof buildCertificatePdf
    >[0]["fieldMappings"];
    if (selectedTemplate?.fieldMappings) {
      try {
        fieldMappings = JSON.parse(selectedTemplate.fieldMappings);
      } catch {
        return NextResponse.json(
          { error: "O mapeamento de campos do modelo selecionado é inválido." },
          { status: 422 }
        );
      }
    }

    const verificationCode = `AP-${crypto.randomBytes(3).toString("hex").toUpperCase()}-${new Date().getFullYear()}`;
    const pdfBytes = await buildCertificatePdf({
      studentName: student.name || directStudentName,
      studentCip: student.id ? String(student.id) : "000",
      courseTitle: course?.title || customCourseTitle,
      workload: `${course?.workloadHours || customWorkloadHours} horas`,
      period: "2026",
      verificationCode,
      templateBackgroundBytes,
      logoBytes,
      fieldMappings,
    });

    const fileKey = `certificates/${userId}-${courseId}-${Date.now()}.pdf`;
    const certificateUrl = await uploadCertificatePdf(fileKey, pdfBytes);

    const existing = await db.query.certificates.findFirst({
      where: and(
        eq(certificates.userId, userId),
        eq(certificates.courseId, courseId)
      ),
    });

    let certificateRecord: any = null;
    if (existing) {
      const updated = await db
        .update(certificates)
        .set({
          certificateUrl,
          verificationCode,
          issueDate: new Date(),
        })
        .where(eq(certificates.id, existing.id))
        .returning();
      certificateRecord = updated[0];
    } else {
      const inserted = await db
        .insert(certificates)
        .values({
          userId,
          courseId,
          certificateUrl,
          verificationCode,
          issueDate: new Date(),
        })
        .returning();
      certificateRecord = inserted[0];
    }

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificateRecord.id,
        certificateCode: verificationCode,
        certificateUrl,
      },
    });
  } catch (error: any) {
    console.error("API Error issuing certificate:", error);
    return NextResponse.json(
      { error: error?.message || "Erro interno ao emitir certificado." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      !["admin", "super_admin", "professor"].includes(session.user.role || "")
    ) {
      return NextResponse.json(
        { error: "Acesso restrito a administradores e professores." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const idsParam = searchParams.get("ids");

    let idsToDelete: number[] = [];
    if (idsParam) {
      idsToDelete = idsParam.split(",").map(Number).filter(n => !isNaN(n));
    } else if (id && !isNaN(Number(id))) {
      idsToDelete = [Number(id)];
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json(
        { error: "IDs de certificados inválidos para exclusão." },
        { status: 400 }
      );
    }

    await db.delete(certificates).where(inArray(certificates.id, idsToDelete));

    return NextResponse.json({
      success: true,
      message: `${idsToDelete.length} certificado(s) excluído(s) com sucesso.`,
    });
  } catch (error: any) {
    console.error("API Error deleting certificate(s):", error);
    return NextResponse.json(
      { error: error?.message || "Erro interno ao excluir certificado(s)." },
      { status: 500 }
    );
  }
}
