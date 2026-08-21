import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { certificates, courses, users } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { buildCertificatePdf } from "@/lib/certificate-pdf";
import { storagePut } from "@/server/storage";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["admin", "super_admin", "professor"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Acesso restrito a administradores e professores." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.userId || !body.courseId) {
      return NextResponse.json({ error: "Informe userId e courseId para emitir o certificado." }, { status: 400 });
    }

    const userId = Number(body.userId);
    const courseId = Number(body.courseId);

    const [student, course] = await Promise.all([
      db.query.users.findFirst({ where: eq(users.id, userId) }),
      db.query.courses.findFirst({ where: eq(courses.id, courseId) }),
    ]);

    if (!student || !course) {
      return NextResponse.json({ error: "Aluno ou curso não encontrado." }, { status: 404 });
    }

    // Verificar se já existe certificado emitido (idempotência)
    let existing = await db.query.certificates.findFirst({
      where: and(eq(certificates.userId, userId), eq(certificates.courseId, courseId)),
    });

    const certificateCode = existing?.certificateCode || crypto.randomBytes(16).toString("hex");

    // Gerar PDF padrão do certificado
    const pdfBytes = await buildCertificatePdf({
      studentName: student.name || student.email || "Aluno",
      courseTitle: course.title,
      level: course.level || "Geral",
      issuedAt: new Date(),
      certificateCode,
      workloadHours: course.modules ? course.modules * 10 : 40,
    });

    const storageKey = `certificates/${userId}-${courseId}-${Date.now()}.pdf`;
    const uploaded = await storagePut(storageKey, Buffer.from(pdfBytes), "application/pdf");

    if (existing) {
      const [updated] = await db.update(certificates)
        .set({
          certificateUrl: uploaded.url,
          certificateCode,
          signatureType: "manual",
          signedPdfUrl: uploaded.url,
          signedAt: new Date(),
        })
        .where(eq(certificates.id, existing.id))
        .returning();
      return NextResponse.json({ success: true, certificate: updated, message: "Certificado emitido e atualizado com sucesso." });
    } else {
      const [inserted] = await db.insert(certificates).values({
        userId,
        courseId,
        level: course.level || "Geral",
        certificateUrl: uploaded.url,
        certificateCode,
        signatureType: "manual",
        signedPdfUrl: uploaded.url,
        signedAt: new Date(),
      }).returning();
      return NextResponse.json({ success: true, certificate: inserted, message: "Certificado emitido automaticamente com sucesso." });
    }
  } catch (error) {
    console.error("Error issuing certificate automatically:", error);
    return NextResponse.json({ error: "Erro ao emitir certificado." }, { status: 500 });
  }
}
