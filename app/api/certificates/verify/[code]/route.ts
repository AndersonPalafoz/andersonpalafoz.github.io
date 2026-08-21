import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { certificates, courses, users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const code = params.code;
    if (!code) {
      return NextResponse.json({ valid: false, error: "Código de certificado não informado." }, { status: 400 });
    }

    const cert = await db.select({
      id: certificates.id,
      level: certificates.level,
      issuedAt: certificates.issuedAt,
      certificateCode: certificates.certificateCode,
      signatureType: certificates.signatureType,
      signedPdfUrl: certificates.signedPdfUrl,
      certificateUrl: certificates.certificateUrl,
      studentName: users.name,
      courseTitle: courses.title,
    })
      .from(certificates)
      .leftJoin(users, eq(certificates.userId, users.id))
      .leftJoin(courses, eq(certificates.courseId, courses.id))
      .where(eq(certificates.certificateCode, code))
      .limit(1);

    if (cert.length === 0) {
      return NextResponse.json({ valid: false, error: "Certificado não encontrado ou inválido." }, { status: 404 });
    }

    const item = cert[0];
    return NextResponse.json({
      valid: true,
      certificate: {
        id: item.id,
        studentName: item.studentName || "Aluno(a)",
        courseTitle: item.courseTitle || "Curso de Inglês",
        level: item.level,
        issuedAt: item.issuedAt,
        certificateCode: item.certificateCode,
        signatureType: item.signatureType,
        downloadUrl: item.signedPdfUrl || item.certificateUrl,
      },
    });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return NextResponse.json({ valid: false, error: "Erro ao verificar certificado." }, { status: 500 });
  }
}
