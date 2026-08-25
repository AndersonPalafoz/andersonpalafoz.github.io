import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { certificates, courses } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { buildCertificatePdf } from "@/lib/certificate-pdf";
import JSZip from "jszip";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    const userCerts = await db.select({
      id: certificates.id,
      level: certificates.level,
      certificateCode: certificates.certificateCode,
      issuedAt: certificates.issuedAt,
      signedPdfUrl: certificates.signedPdfUrl,
      certificateUrl: certificates.certificateUrl,
      courseTitle: courses.title,
    })
      .from(certificates)
      .leftJoin(courses, eq(certificates.courseId, courses.id))
      .where(eq(certificates.userId, userId));

    if (userCerts.length === 0) {
      return NextResponse.json({ error: "Nenhum certificado encontrado para download." }, { status: 404 });
    }

    const zip = new JSZip();

    for (const cert of userCerts) {
      const title = cert.courseTitle || "Curso";
      const fileName = `Certificado_${title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

      // Gerar o PDF na hora ou buscar se houver URL válida
      const pdfBytes = await buildCertificatePdf({
        studentName: session.user.name || session.user.email || "Aluno",
        courseTitle: title,
        level: cert.level || "Geral",
        issuedAt: new Date(cert.issuedAt || Date.now()),
        certificateCode: cert.certificateCode || "VERIFICADO",
        workloadHours: 40,
      });

      zip.file(fileName, Buffer.from(pdfBytes));
    }

    const zipContent = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(new Uint8Array(zipContent), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=\"Meus_Certificados_Anderson_Palafoz.zip\"",
      },
    });
  } catch (error) {
    console.error("Error generating certificates batch download:", error);
    return NextResponse.json({ error: "Erro ao gerar arquivo compactado de certificados." }, { status: 500 });
  }
}
