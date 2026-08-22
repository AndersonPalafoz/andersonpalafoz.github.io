import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, getCertificateTemplateById } from "@/lib/db";
import { certificates, courses, users } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
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
        userId = student.id;
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

    const existing = await db.query.certificates.findFirst({
      where: and(
        eq(certificates.userId, userId),
        eq(certificates.courseId, courseId)
      ),
    });

    const certificateCode =
      existing?.certificateCode || crypto.randomBytes(16).toString("hex");

    const pdfBytes = await buildCertificatePdf({
      studentName: student.name || student.email || "Aluno",
      courseTitle: course.title,
      level: course.level || "Geral",
      issuedAt: new Date(),
      certificateCode,
      workloadHours: course.workloadHours || 40,
      includeSiteBranding,
      institutionName: customInstitution || selectedTemplate?.institution || undefined,
      templateBackgroundBytes,
      logoBytes,
      fieldMappings,
    });

    const uploaded = await uploadCertificatePdf(userId, courseId, pdfBytes);
    const fileUrl = uploaded.url;

    if (existing) {
      const updatedRows = await db
        .update(certificates)
        .set({
          certificateUrl: fileUrl,
          certificateCode,
          certificateTemplateId: templateId,
          includeSiteBranding,
          signatureType: "manual",
          signedPdfUrl: fileUrl,
          signedAt: new Date(),
        })
        .where(eq(certificates.id, existing.id))
        .returning();
      const updated = updatedRows[0];
      return NextResponse.json({
        success: true,
        certificate: updated,
        message: "Certificado emitido e atualizado com sucesso.",
        includeSiteBranding,
      });
    } else {
      const insertedRows = await db
        .insert(certificates)
        .values({
          userId,
          courseId,
          level: course.level || "Geral",
          certificateUrl: fileUrl,
          certificateCode,
          certificateTemplateId: templateId,
          includeSiteBranding,
          signatureType: "manual",
          signedPdfUrl: fileUrl,
          signedAt: new Date(),
        })
        .returning({ id: certificates.id });
      const inserted = insertedRows[0];
      const created = await db.query.certificates.findFirst({
        where: eq(certificates.id, inserted.id),
      });
      return NextResponse.json({
        success: true,
        certificate: created,
        message: "Certificado emitido com sucesso para a pessoa sem cadastro.",
        includeSiteBranding,
      }, { status: 201 });
    }
  } catch (error) {
    console.error("Error issuing certificate:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao emitir certificado." },
      { status: 500 }
    );
  }
}
