import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFPage,
  type PDFFont,
} from "pdf-lib";

export type CertificateFieldMapping = {
  x: number;
  y: number;
  size?: number;
  maxWidth?: number;
};

export interface CertificatePdfInput {
  studentName: string;
  courseTitle: string;
  level: string;
  issuedAt: Date;
  certificateCode: string;
  workloadHours?: number;
  signatureImageBytes?: Uint8Array;
  logoBytes?: Uint8Array;
  /** Decisão explícita: true adiciona a identidade do site; false não adiciona. */
  includeSiteBranding?: boolean;
  institutionName?: string;
  /** PDF ou PNG/JPG de terceiros usado como fundo do certificado. */
  templateBackgroundBytes?: Uint8Array;
  /** Coordenadas opcionais para campos de modelos institucionais. */
  fieldMappings?: Partial<
    Record<
      | "studentName"
      | "courseTitle"
      | "level"
      | "issuedAt"
      | "certificateCode"
      | "workloadHours",
      CertificateFieldMapping
    >
  >;
}

function drawTextAt(
  page: PDFPage,
  font: PDFFont,
  text: string,
  mapping: CertificateFieldMapping | undefined,
  fallback: { x: number; y: number; size: number; maxWidth?: number },
  color: ReturnType<typeof rgb>
) {
  page.drawText(text, {
    x: mapping?.x ?? fallback.x,
    y: mapping?.y ?? fallback.y,
    size: mapping?.size ?? fallback.size,
    maxWidth: mapping?.maxWidth ?? fallback.maxWidth,
    font,
    color,
  });
}

export async function buildCertificatePdf(input: CertificatePdfInput) {
  const pdf = await PDFDocument.create();
  const includeBranding = input.includeSiteBranding ?? true;
  const hasTemplate = Boolean(input.templateBackgroundBytes?.length);

  if (hasTemplate) {
    try {
      const templatePdf = await PDFDocument.load(
        input.templateBackgroundBytes!
      );
      const [templatePage] = await pdf.copyPages(templatePdf, [0]);
      pdf.addPage(templatePage);
    } catch {
      const page = pdf.addPage([842, 595]);
      try {
        const image = await pdf.embedPng(input.templateBackgroundBytes!);
        page.drawImage(image, { x: 0, y: 0, width: 842, height: 595 });
      } catch {
        const image = await pdf.embedJpg(input.templateBackgroundBytes!);
        page.drawImage(image, { x: 0, y: 0, width: 842, height: 595 });
      }
    }
  } else {
    pdf.addPage([842, 595]);
  }

  const page = pdf.getPage(0);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const red = rgb(0.86, 0.08, 0.12);
  const navy = rgb(0.1, 0.2, 0.4);
  const graphite = rgb(0.14, 0.16, 0.19);
  const muted = rgb(0.36, 0.39, 0.43);
  const lineColor = includeBranding ? red : navy;

  if (!hasTemplate) {
    page.drawRectangle({
      x: 0,
      y: 0,
      width: 842,
      height: 595,
      color: rgb(1, 1, 1),
    });
    page.drawRectangle({
      x: 0,
      y: 0,
      width: 18,
      height: 595,
      color: lineColor,
    });
    page.drawRectangle({
      x: 824,
      y: 0,
      width: 18,
      height: 595,
      color: lineColor,
    });

    if (includeBranding) {
      page.drawText("ANDERSON PALAFOZ", {
        x: 155,
        y: 520,
        size: 15,
        font: bold,
        color: red,
      });
      page.drawText("CERTIFICADO DE CONCLUSÃO", {
        x: 70,
        y: 455,
        size: 31,
        font: bold,
        color: graphite,
      });
    } else {
      const institutionLabel =
        input.institutionName?.trim().toUpperCase() || "CERTIFICADO ACADÊMICO";
      page.drawText(institutionLabel, {
        x: 70,
        y: 520,
        size: 15,
        font: bold,
        color: navy,
      });
      page.drawText("CERTIFICADO DE PARTICIPAÇÃO E CONCLUSÃO", {
        x: 70,
        y: 455,
        size: 26,
        font: bold,
        color: graphite,
      });
    }
  }

  if (includeBranding && input.logoBytes?.length) {
    try {
      let logo;
      try {
        logo = await pdf.embedPng(input.logoBytes);
      } catch {
        logo = await pdf.embedJpg(input.logoBytes);
      }
      page.drawImage(logo, {
        x: 70,
        y: 480,
        width: 64,
        height: 64,
        opacity: 0.96,
      });
    } catch (error) {
      console.error("Failed to embed site logo in certificate PDF", error);
    }
  }

  const issuedAtText = input.issuedAt.toLocaleDateString("pt-BR");
  const workloadText = `${input.workloadHours || 40} horas`;
  const mappings = input.fieldMappings || {};

  drawTextAt(
    page,
    regular,
    "Certificamos que",
    undefined,
    { x: 70, y: 402, size: 16 },
    muted
  );
  drawTextAt(
    page,
    bold,
    input.studentName,
    mappings.studentName,
    { x: 70, y: 355, size: 28, maxWidth: 700 },
    graphite
  );
  page.drawLine({
    start: { x: 70, y: 342 },
    end: { x: 772, y: 342 },
    thickness: 1.5,
    color: lineColor,
  });
  drawTextAt(
    page,
    regular,
    "concluiu com aproveitamento o curso",
    undefined,
    { x: 70, y: 300, size: 16 },
    muted
  );
  drawTextAt(
    page,
    bold,
    input.courseTitle,
    mappings.courseTitle,
    { x: 70, y: 258, size: 23, maxWidth: 700 },
    graphite
  );
  drawTextAt(
    page,
    regular,
    `Nível: ${input.level}  •  Carga Horária: ${workloadText}`,
    mappings.level,
    { x: 70, y: 218, size: 14 },
    muted
  );
  drawTextAt(
    page,
    regular,
    `Data de Conclusão e Emissão: ${issuedAtText}`,
    mappings.issuedAt,
    { x: 70, y: 155, size: 13 },
    muted
  );
  drawTextAt(
    page,
    regular,
    `Código de autenticidade: ${input.certificateCode}`,
    mappings.certificateCode,
    { x: 70, y: 125, size: 11 },
    muted
  );

  if (includeBranding) {
    page.drawText(
      `Validação online: https://andersonpalafoz.vercel.app/verificar/${input.certificateCode}`,
      { x: 70, y: 105, size: 10, font: bold, color: red }
    );
  } else {
    page.drawText("Documento emitido para fins acadêmicos e institucionais.", {
      x: 70,
      y: 105,
      size: 10,
      font: regular,
      color: muted,
    });
  }

  if (input.signatureImageBytes?.length) {
    try {
      let image;
      try {
        image = await pdf.embedPng(input.signatureImageBytes);
      } catch {
        image = await pdf.embedJpg(input.signatureImageBytes);
      }
      page.drawImage(image, { x: 560, y: 140, width: 160, height: 50 });
    } catch (error) {
      console.error("Failed to embed signature image in PDF", error);
    }
  }

  const signerTitle = includeBranding
    ? "Anderson Palafoz · Ensino de Inglês"
    : input.institutionName || "Coordenação Acadêmica";
  page.drawText(signerTitle, {
    x: 560,
    y: 115,
    size: 12,
    font: bold,
    color: graphite,
  });
  page.drawLine({
    start: { x: 560, y: 135 },
    end: { x: 772, y: 135 },
    thickness: 1,
    color: graphite,
  });
  page.drawText("Documento digital assinado", {
    x: 560,
    y: 98,
    size: 10,
    font: regular,
    color: muted,
  });

  return pdf.save();
}
