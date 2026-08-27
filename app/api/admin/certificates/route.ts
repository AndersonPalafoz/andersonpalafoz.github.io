import { eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
  adminAuditLogs,
  certificateSignatureTypes,
  certificates,
  users,
} from "@/drizzle/schema";
import { canManageCourse, requireTeacherOrAdmin } from "@/lib/admin-auth";
import {
  db,
  getAllCertificatesForAdmin,
  updateCertificateSignature,
} from "@/lib/db";
import {
  deleteCertificatePdfFiles,
  uploadSignedCertificatePdf,
} from "@/lib/learning-storage";
import { isTechnicalCourse } from "@/lib/course-visibility";

const uploadableSignatureTypes = ["manual", "govbr"] as const;
type UploadableSignatureType = (typeof uploadableSignatureTypes)[number];

function isManualExternalUser(user: { loginMethod?: string | null; email?: string | null } | null | undefined) {
  const email = user?.email?.trim().toLowerCase() || "";
  return user?.loginMethod === "manual_external" || email.endsWith("@external.placeholder");
}

function getDisplayEmail(user: { loginMethod?: string | null; email?: string | null } | null | undefined) {
  const email = user?.email?.trim() || "";
  return email && !email.toLowerCase().endsWith("@external.placeholder") ? email : null;
}

function isUploadableSignatureType(
  value: string
): value is UploadableSignatureType {
  return uploadableSignatureTypes.includes(value as UploadableSignatureType);
}

async function resolveAdminUser(
  session: Awaited<ReturnType<typeof requireTeacherOrAdmin>>
) {
  const email = session?.user?.email?.toLowerCase();
  if (!email) return null;
  return db.query.users.findFirst({ where: eq(users.email, email) });
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireTeacherOrAdmin();
    if (!session) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 403 }
      );
    }

    let items: any[] = [];
    try {
      items = await getAllCertificatesForAdmin();
    } catch (dbErr) {
      console.error("Falha na consulta getAllCertificatesForAdmin:", dbErr);
      // Fallback seguro caso a tabela ou relações estejam inconsistentes
      const rawCertificates = await db.query.certificates.findMany();
      items = rawCertificates.map(c => ({
        ...c,
        user: { name: "Aluno", email: null },
        course: { title: "Curso Acadêmico", courseType: 1 },
      }));
    }

    const requestedView = new URL(request.url).searchParams.get("view");
    const isTeacher = session.user.role === "professor";
    if (isTeacher) {
      const managementChecks = await Promise.all(
        items.map(async certificate => ({
          certificate,
          canManage: await canManageCourse(session, certificate.courseId),
        }))
      );
      items = managementChecks
        .filter(({ canManage }) => canManage)
        .map(({ certificate }) => certificate);
    }
    // Cursos usados para validar documentos e templates permanecem
    // administráveis, mas não integram a fila pedagógica de professores.
    if (requestedView === "teacher") {
      items = items.filter(certificate => !isTechnicalCourse({ title: certificate.course?.title }));
    }

    return NextResponse.json({
      success: true,
      certificates: (items || []).map(certificate => {
        const isManualEntry = !certificate.user || isManualExternalUser(certificate.user);
        return {
          id: certificate.id,
          userId: certificate.userId ?? null,
          studentName:
            certificate.recipientName?.trim() || certificate.user?.name?.trim() || certificate.user?.fullName?.trim() || "Pessoa sem cadastro",
          studentEmail: certificate.recipientEmail || getDisplayEmail(certificate.user),
          studentCpf: certificate.recipientCpf || certificate.studentCpf || certificate.user?.cpf || "",
          isManualEntry,
          courseId: certificate.courseId,
          courseTitle: certificate.course?.title || "Curso",
          courseType: certificate.course?.courseType ?? null,
          level: certificate.level || "Geral",
          certificateCode: certificate.certificateCode || null,
          issuedAt: certificate.issuedAt || new Date().toISOString(),
          signatureType: certificate.signatureType || "none",
          signedAt: certificate.signedAt || null,
          hasSignedPdf: Boolean(certificate.signedPdfUrl),
          certificateUrl: certificate.certificateUrl
            ? `/api/certificates/${certificate.id}/download`
            : null,
          signedPdfUrl: certificate.signedPdfUrl
            ? `/api/certificates/${certificate.id}/download`
            : null,
          downloadUrl:
            certificate.signedPdfUrl || certificate.certificateUrl
              ? `/api/certificates/${certificate.id}/download`
              : null,
          certificateTemplateId: certificate.certificateTemplateId ?? null,
          includeSiteBranding: certificate.includeSiteBranding ?? true,
        };
      }),
    });
  } catch (error) {
    console.error("Erro fatal ao listar certificados para assinatura:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os certificados.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireTeacherOrAdmin();
    if (!session) {
      return NextResponse.json(
        { error: "Acesso restrito a professores e administradores." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");
    const singleId = searchParams.get("id");
    const rawIds = idsParam ? idsParam.split(",") : singleId ? [singleId] : [];
    const idsToDelete = Array.from(
      new Set(
        rawIds
          .map(value => Number(value.trim()))
          .filter(value => Number.isInteger(value) && value > 0)
      )
    );

    if (idsToDelete.length === 0) {
      return NextResponse.json(
        { error: "IDs de certificados inválidos para exclusão." },
        { status: 400 }
      );
    }

    const records = await db
      .select({ id: certificates.id, courseId: certificates.courseId })
      .from(certificates)
      .where(inArray(certificates.id, idsToDelete));

    if (records.length === 0) {
      return NextResponse.json(
        { error: "Nenhum dos certificados selecionados foi encontrado." },
        { status: 404 }
      );
    }

    for (const record of records) {
      if (!(await canManageCourse(session, record.courseId))) {
        return NextResponse.json(
          { error: "Você não tem permissão para excluir um ou mais certificados selecionados." },
          { status: 403 }
        );
      }
    }

    const existingIds = records.map(record => record.id);
    await db.delete(certificates).where(inArray(certificates.id, existingIds));

    return NextResponse.json({
      success: true,
      deletedIds: existingIds,
      message: `${existingIds.length} certificado(s) excluído(s) definitivamente.`,
    });
  } catch (error) {
    console.error("Erro ao excluir certificado(s) no painel administrativo:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir os certificados selecionados.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireTeacherOrAdmin();
    if (!session) {
      return NextResponse.json(
        { error: "Acesso restrito a professores e administradores." },
        { status: 403 }
      );
    }

    const adminUser = await resolveAdminUser(session);
    if (!adminUser) {
      return NextResponse.json(
        { error: "Usuário autenticado não encontrado no banco de dados." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const certificateId = Number(formData.get("certificateId"));
    const signatureTypeValue = String(formData.get("signatureType") || "")
      .trim()
      .toLowerCase();
    const file = formData.get("file");

    if (!Number.isInteger(certificateId) || certificateId <= 0) {
      return NextResponse.json(
        { error: "Selecione um certificado válido." },
        { status: 400 }
      );
    }
    if (!isUploadableSignatureType(signatureTypeValue)) {
      return NextResponse.json(
        {
          error:
            "Escolha se o certificado foi assinado manualmente ou via gov.br.",
        },
        { status: 400 }
      );
    }
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Selecione o PDF final assinado antes de enviar." },
        { status: 400 }
      );
    }

    const certificate = await db.query.certificates.findFirst({
      where: eq(certificates.id, certificateId),
      with: { course: true, user: true },
    });
    if (!certificate) {
      return NextResponse.json(
        { error: "Certificado não encontrado." },
        { status: 404 }
      );
    }

    if (!(await canManageCourse(session, certificate.courseId))) {
      return NextResponse.json(
        {
          error:
            "Você não tem permissão para gerenciar o curso deste certificado.",
        },
        { status: 403 }
      );
    }

    const previousSignedPdfUrl = certificate.signedPdfUrl;
    const uploaded = await uploadSignedCertificatePdf(
      adminUser.id,
      certificateId,
      file
    );
    let updated;
    try {
      updated = await updateCertificateSignature({
        certificateId,
        signatureType: signatureTypeValue,
        signedPdfUrl: uploaded.objectPath,
        signedAt: new Date(),
        signedBy: adminUser.id,
      });
    } catch (error) {
      const uploadRollback = await deleteCertificatePdfFiles({
        signedPdfUrl: uploaded.objectPath,
      });
      if (uploadRollback.failed > 0) {
        console.warn("Falha ao limpar PDF assinado recém-enviado após falha de persistência.", {
          attempted: uploadRollback.attempted,
          removed: uploadRollback.removed,
          failed: uploadRollback.failed,
        });
      }
      throw error;
    }

    const storageCleanup = previousSignedPdfUrl
      ? await deleteCertificatePdfFiles({ signedPdfUrl: previousSignedPdfUrl })
      : { attempted: 0, removed: 0, failed: 0 };
    if (storageCleanup.failed > 0) {
      console.warn("Falha ao limpar versão anterior de PDF assinado.", {
        attempted: storageCleanup.attempted,
        removed: storageCleanup.removed,
        failed: storageCleanup.failed,
      });
    }

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
        replacedExistingSignedPdf: Boolean(previousSignedPdfUrl),
        storageCleanup,
      }),
    });

    return NextResponse.json({
      success: true,
      message:
        signatureTypeValue === "govbr"
          ? "Certificado assinado via gov.br enviado com sucesso."
          : "Certificado assinado manualmente enviado com sucesso.",
      certificate: updated,
      storageCleanup,
    });
  } catch (error) {
    console.error("Erro ao enviar certificado assinado:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar o certificado assinado.",
      },
      { status: 500 }
    );
  }
}
