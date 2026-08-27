import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db, getCertificates } from "@/lib/db";
import { users } from "@/drizzle/schema";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    const certificates = await getCertificates(user.id);
    return NextResponse.json({
      certificates: certificates.map(certificate => ({
        id: certificate.id,
        issuedAt: certificate.issuedAt,
        level: certificate.level,
        certificateCode: certificate.certificateCode,
        certificateUrl: certificate.certificateUrl,
        downloadUrl:
          certificate.signedPdfUrl || certificate.certificateUrl
            ? `/api/certificates/${certificate.id}/download`
            : null,
        courseTitle: certificate.course?.title || "Curso",

        signatureType: certificate.signatureType,
        hasSignedPdf: Boolean(certificate.signedPdfUrl),
        certificateTemplateId: certificate.certificateTemplateId ?? null,
        includeSiteBranding: certificate.includeSiteBranding ?? true,
        course: certificate.course
          ? {
              title: certificate.course.title,
              courseType: certificate.course.courseType ?? null,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("Erro ao carregar certificados do aluno:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar seus certificados." },
      { status: 500 }
    );
  }
}
