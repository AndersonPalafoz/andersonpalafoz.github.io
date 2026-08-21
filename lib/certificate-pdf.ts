import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface CertificatePdfInput {
  studentName: string;
  courseTitle: string;
  level: string;
  issuedAt: Date;
  certificateCode: string;
  workloadHours?: number;
  signatureImageBytes?: Uint8Array;
}

export async function buildCertificatePdf(input: CertificatePdfInput) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const red = rgb(0.86, 0.08, 0.12);
  const graphite = rgb(0.14, 0.16, 0.19);
  const muted = rgb(0.36, 0.39, 0.43);

  page.drawRectangle({ x: 0, y: 0, width: 842, height: 595, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: 0, y: 0, width: 18, height: 595, color: red });
  page.drawRectangle({ x: 824, y: 0, width: 18, height: 595, color: red });
  
  page.drawText("ANDERSON PALAFOZ", { x: 70, y: 520, size: 15, font: bold, color: red });
  page.drawText("CERTIFICADO DE CONCLUSÃO", { x: 70, y: 455, size: 31, font: bold, color: graphite });
  page.drawText("Certificamos que", { x: 70, y: 402, size: 16, font: regular, color: muted });
  page.drawText(input.studentName, { x: 70, y: 355, size: 28, font: bold, color: graphite, maxWidth: 700 });
  page.drawLine({ start: { x: 70, y: 342 }, end: { x: 772, y: 342 }, thickness: 1.5, color: red });
  page.drawText("concluiu com aproveitamento o curso", { x: 70, y: 300, size: 16, font: regular, color: muted });
  page.drawText(input.courseTitle, { x: 70, y: 258, size: 23, font: bold, color: graphite, maxWidth: 700 });
  page.drawText(`Nível: ${input.level}  •  Carga Horária: ${input.workloadHours || 40} horas`, { x: 70, y: 218, size: 14, font: regular, color: muted });
  page.drawText(`Data de Conclusão e Emissão: ${input.issuedAt.toLocaleDateString("pt-BR")}`, { x: 70, y: 155, size: 13, font: regular, color: muted });
  page.drawText(`Código de autenticidade: ${input.certificateCode}`, { x: 70, y: 125, size: 11, font: regular, color: muted });

  if (input.signatureImageBytes) {
    try {
      let image;
      try {
        image = await pdf.embedPng(input.signatureImageBytes);
      } catch {
        image = await pdf.embedJpg(input.signatureImageBytes);
      }
      page.drawImage(image, { x: 560, y: 140, width: 160, height: 50 });
    } catch (e) {
      console.error("Failed to embed signature image in PDF", e);
    }
  }

  page.drawText("Anderson Palafoz · Ensino de Inglês", { x: 560, y: 115, size: 12, font: bold, color: graphite });
  page.drawLine({ start: { x: 560, y: 135 }, end: { x: 772, y: 135 }, thickness: 1, color: graphite });
  page.drawText("Documento digital assinado", { x: 560, y: 98, size: 10, font: regular, color: muted });

  return pdf.save();
}
