import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { certificates, courses, users } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { buildCertificatePdf } from "@/lib/certificate-pdf";
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

    const existing = await db.query.certificates.findFirst({
      where: and(eq(certificates.userId, userId), eq(certificates.courseId, courseId)),
    });

    const certificateCode = existing?.certificateCode || crypto.randomBytes(16).toString("hex");

    const pdfBytes = await buildCertificatePdf({
      studentName: student.name || student.email || "Aluno",
      courseTitle: course.title,
      level: course.level || "Geral",
      issuedAt: new Date(),
      certificateCode,
      workloadHours: 40,
    });

    const fileUrl = `https://storage.googleapis.com/andersonpalafoz-certificates/cert-${userId}-${courseId}-${Date.now()}.pdf`;

    if (existing) {
      const [updated] = await db.update(certificates)
        .set({
          certificateUrl: fileUrl,
          certificateCode,
          signatureType: "manual",
          signedPdfUrl: fileUrl,
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
        certificateUrl: fileUrl,
        certificateCode,
        signatureType: "manual",
        signedPdfUrl: fileUrl,
        signedAt: new Date(),
      }).returning();
      return NextResponse.json({ success: true, certificate: inserted, message: "Certificado emitido automaticamente com sucesso." });
    }
  } catch (error) {
    console.error("Error issuing certificate automatically:", error);
    return NextResponse.json({ error: "Erro ao emitir certificado." }, { status: 500 });
  }
}
