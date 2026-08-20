import { and, eq } from "drizzle-orm";
import { lessonProgress, users } from "@/drizzle/schema";
import { buildCertificatePdf } from "@/lib/certificate-pdf";
import { createCertificate, db, getCertificateByUserCourse, getCourseById, getLessonsByModule, getModulesByCourse } from "@/lib/db";
import { uploadCertificatePdf } from "@/lib/learning-storage";

export async function getCourseCompletion(userId: number, courseId: number) {
  const modules = await getModulesByCourse(courseId);
  const lessonIds: number[] = [];
  for (const module of modules) {
    const lessons = await getLessonsByModule(module.id);
    lessonIds.push(...lessons.map((lesson) => lesson.id));
  }
  if (lessonIds.length === 0) return { percentage: 0, completedCount: 0, totalLessons: 0 };
  const progressRows = await db.query.lessonProgress.findMany({
    where: and(eq(lessonProgress.userId, userId), eq(lessonProgress.completed, 1)),
  });
  const completedCount = progressRows.filter((row) => lessonIds.includes(row.lessonId)).length;
  return {
    percentage: Math.round((completedCount / lessonIds.length) * 100),
    completedCount,
    totalLessons: lessonIds.length,
  };
}

export async function issueCertificateIfEligible(userId: number, courseId: number) {
  const course = await getCourseById(courseId);
  if (!course) throw new Error("Curso não encontrado.");
  const completion = await getCourseCompletion(userId, courseId);
  const student = await db.query.users.findFirst({ where: eq(users.id, userId) });
  const existing = await getCertificateByUserCourse(userId, courseId);
  if (completion.percentage < 100) {
    return { eligible: false, percentage: completion.percentage, certificate: existing || null, course, student };
  }
  if (existing) {
    return { eligible: true, percentage: completion.percentage, certificate: existing, course, student };
  }

  const certificateCode = `AP-CERT-${courseId}-${userId}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const bytes = await buildCertificatePdf({
    studentName: student?.name || "Aluno(a)",
    courseTitle: course.title,
    level: course.level,
    issuedAt: new Date(),
    certificateCode,
    workloadHours: course.workloadHours || 40,
  });
  const uploaded = await uploadCertificatePdf(userId, courseId, bytes);
  const certificate = await createCertificate({
    userId,
    courseId,
    level: course.level,
    certificateCode,
    certificateUrl: uploaded.url,
  });
  return { eligible: true, percentage: completion.percentage, certificate, course, student };
}
