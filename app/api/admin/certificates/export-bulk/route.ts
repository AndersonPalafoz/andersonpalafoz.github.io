import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { certificates, courses, users, certificateTemplates } from "@/drizzle/schema";
import { inArray, eq } from "drizzle-orm";
import { buildCertificatePdf } from "@/lib/certificate-pdf";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user.role !== "admin" && session.user.role !== "professor")) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const body = await request.json();
    const { certificateIds, format } = body as { certificateIds: number[]; format: "pdf" | "zip" };

    if (!Array.isArray(certificateIds) || certificateIds.length === 0) {
      return NextResponse.json({ error: "Nenhum certificado selecionado para exportação." }, { status: 400 });
    }

    const targetFormat = format === "pdf" ? "pdf" : "zip";

    // Buscar certificados selecionados
    const certRows = await db.select({
      id: certificates.id,
      studentName: users.name,
      studentEmail: users.email,
      studentCpf: certificates.studentCpf,
      courseTitle: courses.title,
      level: certificates.level,
      issuedAt: certificates.issuedAt,
      certificateCode: certificates.certificateCode,
      workloadHours: certificates.workloadHours,
      period: certificates.period,
      coordinatorName: certificates.coordinatorName,
      institutionName: certificates.institutionName,
      includeSiteBranding: certificates.includeSiteBranding,
      templateId: certificates.certificateTemplateId,
    })
      .from(certificates)
      .leftJoin(users, eq(certificates.userId, users.id))
      .leftJoin(courses, eq(certificates.courseId, courses.id))
      .where(inArray(certificates.id, certificateIds));

    if (certRows.length === 0) {
      return NextResponse.json({ error: "Nenhum registro correspondente encontrado." }, { status: 404 });
    }

    // Carregar templates se houver
    const templates = await db.select().from(certificateTemplates);
    const templateMap = new Map(templates.map(t => [t.id, t]));

    const generatedPdfs: Array<{ name: string; bytes: Uint8Array }> = [];

    for (const cert of certRows) {
      const name = cert.studentName || cert.studentEmail || "Estudante";
      const title = cert.courseTitle || "Curso de Inglês";
      const code = cert.certificateCode || `AP-${cert.id}`;
      const template = cert.templateId ? templateMap.get(cert.templateId) : undefined;

      let fieldMappings: any = undefined;
      if (template?.fieldMappings) {
        try {
          fieldMappings = JSON.parse(template.fieldMappings);
        } catch {
          // fallback
        }
      }

      const pdfBytes = await buildCertificatePdf({
        studentName: name,
        courseTitle: title,
        level: cert.level || "Intermediário (B1)",
        issuedAt: new Date(cert.issuedAt || Date.now()),
        certificateCode: code,
        workloadHours: cert.workloadHours || 40,
        studentCpf: cert.studentCpf || undefined,
        period: cert.period || undefined,
        coordinatorName: cert.coordinatorName || undefined,
        institutionName: cert.institutionName || undefined,
        includeSiteBranding: cert.includeSiteBranding ?? true,
        templateUrl: template?.templateUrl || undefined,
        fieldMappings,
      });

      const safeName = name.replace(/[^a-zA-Z0-9]/g, "_");
      const safeCourse = title.replace(/[^a-zA-Z0-9]/g, "_");
      generatedPdfs.push({
        name: `Certificado_${safeName}_${safeCourse}.pdf`,
        bytes: pdfBytes,
      });
    }

    if (targetFormat === "pdf") {
      // Mesclar todos os PDFs em um único documento consolidado
      const mergedPdfDoc = await PDFDocument.create();

      for (const item of generatedPdfs) {
        const subPdf = await PDFDocument.load(item.bytes);
        const copiedPages = await mergedPdfDoc.copyPages(subPdf, subPdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdfDoc.addPage(page));
      }

      const mergedPdfBytes = await mergedPdfDoc.save();

      return new NextResponse(new Uint8Array(mergedPdfBytes), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="Certificados_Consolidados_${Date.now()}.pdf"`,
        },
      });
    } else {
      // Empacotar em arquivo ZIP
      const zip = new JSZip();
      for (const item of generatedPdfs) {
        zip.file(item.name, Buffer.from(item.bytes));
      }

      const zipContent = await zip.generateAsync({ type: "nodebuffer" });

      return new NextResponse(new Uint8Array(zipContent), {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="Certificados_Lote_${Date.now()}.zip"`,
        },
      });
    }
  } catch (error) {
    console.error("Erro na exportação em lote de certificados:", error);
    return NextResponse.json({ error: "Erro interno ao exportar certificados." }, { status: 500 });
  }
}
