import { and, eq } from "drizzle-orm";
import { lessonProgress, users } from "@/drizzle/schema";
import { buildCertificatePdf } from "@/lib/certificate-pdf";
import {
  createCertificate,
  db,
  getCertificateByUserCourse,
  getCertificateTemplateById,
  getCourseById,
  getLessonsByModule,
  getModulesByCourse,
} from "@/lib/db";
import {
  downloadCertificateTemplate,
  uploadCertificatePdf,
} from "@/lib/learning-storage";
import crypto from "node:crypto";
import { loadOfficialPrincipalLogoBytes } from "@/lib/brand-assets-server";
import { parseCertificateComposition } from "@/lib/certificate-composition";

export async function getCourseCompletion(userId: number, courseId: number) {
  const modules = await getModulesByCourse(courseId);
  const lessonIds: number[] = [];
  for (const module of modules) {
    const lessons = await getLessonsByModule(module.id);
    lessonIds.push(...lessons.map(lesson => lesson.id));
  }
  if (lessonIds.length === 0)
    return { percentage: 0, completedCount: 0, totalLessons: 0 };
  const progressRows = await db.query.lessonProgress.findMany({
    where: and(
      eq(lessonProgress.userId, userId),
      eq(lessonProgress.completed, 1)
    ),
  });
  const completedCount = progressRows.filter(row =>
    lessonIds.includes(row.lessonId)
  ).length;
  return {
    percentage: Math.round((completedCount / lessonIds.length) * 100),
    completedCount,
    totalLessons: lessonIds.length,
  };
}

export async function issueCertificateIfEligible(
  userId: number,
  courseId: number,
  options?: { includeSiteBranding?: boolean; templateId?: number | null }
) {
  const course = await getCourseById(courseId);
  if (!course) throw new Error("Curso não encontrado.");
  const completion = await getCourseCompletion(userId, courseId);
  const student = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  const existing = await getCertificateByUserCourse(userId, courseId);
  const isExternalCourse = course.courseType === 4;

  // A emissão externa exige decisão do administrador; o endpoint administrativo é o lugar adequado para registrá-la.
  if (
    isExternalCourse &&
    options?.includeSiteBranding === undefined &&
    !existing
  ) {
    return {
      eligible: completion.percentage >= 100,
      requiresBrandingDecision: true,
      percentage: completion.percentage,
      certificate: null,
      course,
      student,
    };
  }
  if (completion.percentage < 100) {
    return {
      eligible: false,
      percentage: completion.percentage,
      certificate: existing || null,
      course,
      student,
    };
  }
  if (existing) {
    return {
      eligible: true,
      percentage: completion.percentage,
      certificate: existing,
      course,
      student,
    };
  }

  const template = options?.templateId
    ? await getCertificateTemplateById(options.templateId)
    : null;
  if (options?.templateId && !template)
    throw new Error("Modelo de certificado não encontrado.");
  const includeSiteBranding =
    options?.includeSiteBranding ?? template?.includeSiteBranding ?? true;
  let templateBackgroundBytes: Uint8Array | undefined = undefined;
  if (template?.templateUrl) {
    const rawBytes = await downloadCertificateTemplate(template.templateUrl);
    // Se o arquivo for DOCX (identificado pela extensão .docx no URL ou pelos bytes mágicos PK),
    // geramos um fundo PDF compatível para que o gerador de PDF não corrompa o stream binário.
    const isDocx =
      template.templateUrl.toLowerCase().endsWith(".docx") ||
      (rawBytes.length > 4 &&
        rawBytes[0] === 0x50 &&
        rawBytes[1] === 0x4b &&
        rawBytes[2] === 0x03 &&
        rawBytes[3] === 0x04);
    if (isDocx) {
      // Como o PDF-lib não interpreta DOCX diretamente, criamos uma folha padrão limpa
      // e aplicamos o layout institucional com base no nome do template e da instituição.
      templateBackgroundBytes = undefined;
    } else {
      templateBackgroundBytes = rawBytes;
    }
  }

  const [logoBytes] = await Promise.all([
    includeSiteBranding
      ? loadOfficialPrincipalLogoBytes().catch(() => undefined)
      : Promise.resolve(undefined),
  ]);
  // A emissão automática usa o mesmo contrato da prévia e da emissão manual.
  // A normalização também mantém compatibilidade com os mapeamentos legados.
  const composition = parseCertificateComposition(template?.fieldMappings || null);

  const certificateCode = `AP-CERT-${courseId}-${userId}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const bytes = await buildCertificatePdf({
    studentName: student?.name || "Aluno(a)",
    courseTitle: course.title,
    level: course.level,
    issuedAt: new Date(),
    certificateCode,
    workloadHours: course.workloadHours || 40,
    includeSiteBranding,
    logoBytes,
    institutionName: template?.institution || undefined,
    templateBackgroundBytes,
    composition,
  });
  const uploaded = await uploadCertificatePdf(userId, courseId, bytes);
  const certificate = await createCertificate({
    userId,
    courseId,
    level: course.level,
    certificateCode,
    certificateUrl: uploaded.url,
    certificateTemplateId: template?.id ?? null,
    includeSiteBranding,
  });
  return {
    eligible: true,
    requiresBrandingDecision: false,
    percentage: completion.percentage,
    certificate,
    course,
    student,
  };
}
