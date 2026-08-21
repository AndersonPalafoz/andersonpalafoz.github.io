import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { adminAuditLogs, certificateSignatureTypes, certificates, users } from "@/drizzle/schema";
import { canManageCourse, requireTeacherOrAdmin } from "@/lib/admin-auth";
import { db, getAllCertificatesForAdmin, updateCertificateSignature } from "@/lib/db";
import { uploadSignedCertificatePdf } from "@/lib/learning-storage";

const uploadableSignatureTypes = ["manual", "govbr"] as const;
type UploadableSignatureType = (typeof uploadableSignatureTypes)[number];

function isUploadableSignatureType(value: string): value is UploadableSignatureType {
  return uploadableSignatureTypes.includes(value as UploadableSignatureType);
}

async function resolveAdminUser(session: Awaited<ReturnType<typeof requireTeacherOrAdmin>>) {
  const email = session?.user?.email?.toLowerCase();
  if (!email) return null;
  return db.query.users.findFirst({ where: eq(users.email, email) });
}

export async function GET() {
  try {
    const session = await requireTeacherOrAdmin();
    if (!session) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const certificates = await getAllCertificatesForAdmin();
    return NextResponse.json({
      success: true,
      certificates: certificates.map((certificate) => ({
        id: certificate.id,
        userId: certificate.userId,
        studentName: certificate.user?.name || "Aluno(a)",
        studentEmail: certificate.user?.email || null,
        courseId: certificate.courseId,
        courseTitle: certificate.course?.title || "Curso",
        level: certificate.level,
        certificateCode: certificate.certificateCode,
        issuedAt: certificate.issuedAt,
        signatureType: certificate.signatureType,
        signedAt: certificate.signedAt,
        hasSignedPdf: Boolean(certificate.signedPdfUrl),
      })),
    });
  } catch (error) {
    console.error("Erro ao listar certificados para assinatura:", error);
    return NextResponse.json({ error: "Não foi possível carregar os certificados." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireTeacherOrAdmin();
    if (!session) {
      return NextResponse.json({ error: "Acesso restrito a professores e administradores." }, { status: 403 });
    }

    const adminUser = await resolveAdminUser(session);
    if (!adminUser) {
      return NextResponse.json({ error: "Usuário autenticado não encontrado no banco de dados." }, { status: 403 });
    }

    const formData = await request.formData();
    const certificateId = Number(formData.get("certificateId"));
    const signatureTypeValue = String(formData.get("signatureType") || "").trim().toLowerCase();
    const file = formData.get("file");

    if (!Number.isInteger(certificateId) || certificateId <= 0) {
      return NextResponse.json({ error: "Selecione um certificado válido." }, { status: 400 });
    }
    if (!isUploadableSignatureType(signatureTypeValue)) {
      return NextResponse.json({ error: "Escolha se o certificado foi assinado manualmente ou via gov.br." }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Selecione o PDF final assinado antes de enviar." }, { status: 400 });
    }

    const certificate = await db.query.certificates.findFirst({
      where: eq(certificates.id, certificateId),
      with: { course: true, user: true },
    });
    if (!certificate) {
      return NextResponse.json({ error: "Certificado não encontrado." }, { status: 404 });
    }

    if (!(await canManageCourse(session, certificate.courseId))) {
      return NextResponse.json({ error: "Você não tem permissão para gerenciar o curso deste certificado." }, { status: 403 });
    }

    const uploaded = await uploadSignedCertificatePdf(adminUser.id, certificateId, file);
    const updated = await updateCertificateSignature({
      certificateId,
      signatureType: signatureTypeValue,
      signedPdfUrl: uploaded.objectPath,
      signedAt: new Date(),
      signedBy: adminUser.id,
    });

    await db.insert(adminAuditLogs).values({
      adminEmail: adminUser.email || session.user.email || "desconhecido",
      action: "certificate_signed_pdf_uploaded",
      targetName: certificate.user?.name || "Aluno(a)",
      targetEmail: certificate.user?.email || null,
      details: JSON.stringify({
        certificateId,
        courseId: certificate.courseId,
        signatureType: signatureTypeValue,
        fileName: file.name,
        fileSize: file.size,
      }),
    });

    return NextResponse.json({
      success: true,
      message: signatureTypeValue === "govbr"
        ? "Certificado assinado via gov.br enviado com sucesso."
        : "Certificado assinado manualmente enviado com sucesso.",
      certificate: updated,
    });
  } catch (error) {
    console.error("Erro ao enviar certificado assinado:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Não foi possível salvar o certificado assinado.",
    }, { status: 500 });
  }
}
