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
import { readFile } from "node:fs/promises";
import path from "node:path";
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
    if (!body || !body.courseId) {
      return NextResponse.json(
        { error: "Informe pelo menos o courseId para emitir o certificado." },
        { status: 400 }
      );
    }

    const courseId = Number(body.courseId);
    let userId = body.userId ? Number(body.userId) : null;
    const directStudentName = typeof body.studentName === "string" ? body.studentName.trim() : "";
    const directStudentEmail = typeof body.studentEmail === "string" ? body.studentEmail.trim() : "";
    const directStudentCpf = typeof body.studentCpf === "string" ? body.studentCpf.trim() : "";

    if (!userId && !directStudentName) {
      return NextResponse.json(
        { error: "Informe o aluno cadastrado (userId) ou o nome completo para emitir certificado a pessoa sem cadastro." },
        { status: 400 }
      );
    }
    const templateId =
      body.templateId == null || body.templateId === ""
        ? null
        : Number(body.templateId);
    const requestedBranding = parseOptionalBoolean(body.includeSiteBranding);

    if (
      !Number.isInteger(userId) ||
      userId <= 0 ||
      !Number.isInteger(courseId) ||
      courseId <= 0
    ) {
      return NextResponse.json(
        { error: "Informe identificadores válidos de aluno e curso." },
        { status: 400 }
      );
    }
    if (
      templateId !== null &&
      (!Number.isInteger(templateId) || templateId <= 0)
    ) {
      return NextResponse.json(
        { error: "Selecione um modelo de certificado válido." },
        { status: 400 }
      );
    }

    let student: any = null;
    if (userId) {
      student = await db.query.users.findFirst({ where: eq(users.id, userId) });
    } else if (directStudentName) {
      // Cria ou localiza um registro de usuário placeholder para a pessoa sem cadastro
      const placeholderEmail = directStudentEmail || `nao-cadastrado-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@external.placeholder`;
      const existingPlaceholder = await db.query.users.findFirst({
        where: eq(users.email, placeholderEmail),
      });
      if (existingPlaceholder) {
        student = existingPlaceholder;
        userId = student.id;
      } else {
        const [insertedUser] = await db
          .insert(users)
          .values({
            fullName: directStudentName,
            email: placeholderEmail,
            role: "student",
          })
          .$returningId();
        student = await db.query.users.findFirst({ where: eq(users.id, insertedUser.id) });
        userId = student.id;
      }
    }

    const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });

    if (!student || !course) {
      return NextResponse.json(
        { error: "Aluno ou curso não encontrado." },
        { status: 404 }
      );
    }

    const isExternalCourse = course.courseType === 4;
    // Cursos externos não têm uma regra global: a decisão é obrigatória na emissão.
    if (isExternalCourse && requestedBranding === undefined) {
      return NextResponse.json(
        {
          error:
            "Antes de emitir este certificado externo, escolha se a logo do site deve ser incluída.",
          code: "CERTIFICATE_BRANDING_DECISION_REQUIRED",
          requiresBrandingDecision: true,
          options: [
            { value: true, label: "Incluir logo do site" },
            { value: false, label: "Não incluir logo do site" },
          ],
        },
        { status: 400 }
      );
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
        ? readFile(
            path.join(process.cwd(), "public", "logo-principal.png")
          ).catch(() => undefined)
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
      institutionName: selectedTemplate?.institution || undefined,
      templateBackgroundBytes,
      logoBytes,
      fieldMappings,
    });

    const uploaded = await uploadCertificatePdf(userId, courseId, pdfBytes);
    const fileUrl = uploaded.url;

    if (existing) {
      const [updated] = await db
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
      return NextResponse.json({
        success: true,
        certificate: updated,
        message: "Certificado emitido e atualizado com sucesso.",
        includeSiteBranding,
      });
    } else {
      const [inserted] = await db
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
        .returning();
      return NextResponse.json({
        success: true,
        certificate: inserted,
        message: "Certificado emitido automaticamente com sucesso.",
        includeSiteBranding,
      });
    }
  } catch (error) {
    console.error("Error issuing certificate automatically:", error);
    return NextResponse.json(
      { error: "Erro ao emitir certificado." },
      { status: 500 }
    );
  }
}
