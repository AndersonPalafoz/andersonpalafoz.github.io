import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { getCertificateVerificationUrl } from "@/lib/certificate-qr";

export interface CertificatePdfElement {
  id: string;
  type: "text" | "badge" | "line" | "image" | "shape";
  content: string;
  x: number;
  y: number;
  size: number;
  color: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  shape?: "rectangle" | "circle" | "pill" | "diamond";
  rotation?: number;
  letterSpacing?: number;
  fontFamily?: "sans" | "serif" | "mono";
  weight?: "normal" | "bold";
  align?: "left" | "center" | "right";
  src?: string;
  width?: number;
  height?: number;
  zIndex?: number;
  opacity?: number;
  visible?: boolean;
}

export interface CertificatePdfOptions {
  title: string;
  studentName: string;
  studentCpf: string;
  courseTitle: string;
  workload: string;
  period: string;
  dateStr: string;
  signerName: string;
  signerRole: string;
  organization: string;
  templateName: string;
  logoUrl?: string;
  fontSize?: number;
  additionalElements?: CertificatePdfElement[];
  verificationCode?: string;
}

export async function generateCertificatePdf(options: CertificatePdfOptions) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Fundo branco
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Moldura usando setDrawColor (método universal jsPDF)
  doc.setLineWidth(3);
  doc.setDrawColor(15, 118, 110);
  doc.rect(30, 30, pageWidth - 60, pageHeight - 60);

  // Organização / Topo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 118, 110);
  doc.text((options.organization || "ANDERSON PALAFOZ - PLATAFORMA OFICIAL").toUpperCase(), pageWidth / 2, 70, { align: "center" });

  // Título do Certificado
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59);
  doc.text(options.title || "Certificado de Conclusão", pageWidth / 2, 110, { align: "center" });

  // Corpo do Texto
  doc.setFont("helvetica", "normal");
  doc.setFontSize(options.fontSize || 13);
  doc.setTextColor(60, 60, 60);

  const bodyText = `Certificamos que ${options.studentName || "Estudante"}, CPF nº ${options.studentCpf || "000.000.000-00"}, concluiu com sucesso o curso/componente intitulado "${options.courseTitle || "Curso"}", com carga horária total de ${options.workload || "40 horas"}, realizado no período de ${options.period || "2026"}.`;
  
  // Largura máxima útil (página A4 paisagem = 841pt, menos margens de 90pt cada lado)
  const maxLineWidth = pageWidth - 180;
  const splitText = doc.splitTextToSize(bodyText, maxLineWidth);
  // Imprimir centralizado usando pageWidth / 2 e maxWidth para o bloco
  doc.text(splitText, pageWidth / 2, 170, { align: "center", maxWidth: maxLineWidth });

  // Data e Local
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text(options.dateStr || "Salvador, Bahia", pageWidth / 2, 310, { align: "center" });

  // Linha de Assinatura
  doc.setLineWidth(1);
  doc.setDrawColor(150, 150, 150);
  doc.line(pageWidth / 2 - 160, 400, pageWidth / 2 + 160, 400);

  // Signatário
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text(options.signerName || "Anderson Bacelar Palafoz", pageWidth / 2, 420, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(options.signerRole || "Professor & Coordenador Acadêmico", pageWidth / 2, 436, { align: "center" });

  // Elementos livres adicionados na prancheta. As coordenadas do editor são percentuais.
  for (const element of options.additionalElements || []) {
    const x = Math.max(40, Math.min(pageWidth - 40, (element.x / 100) * pageWidth));
    const y = Math.max(40, Math.min(pageHeight - 40, (element.y / 100) * pageHeight));

    if (element.type === "shape") {
      const width = Math.max(24, Math.min(720, element.width || 140));
      const height = Math.max(18, Math.min(420, element.height || 80));
      doc.setFillColor(element.fill || element.color || "#fee2e2");
      doc.setDrawColor(element.stroke || element.color || "#dc2626");
      doc.setLineWidth(Math.max(0, Math.min(12, element.strokeWidth || 0)));
      if (element.shape === "circle" || element.shape === "pill") {
        doc.ellipse(x, y, width / 2, height / 2, "FD");
      } else if (element.shape === "diamond") {
        doc.triangle(x, y - height / 2, x + width / 2, y, x, y + height / 2, "FD");
        doc.triangle(x, y - height / 2, x - width / 2, y, x, y + height / 2, "FD");
      } else {
        doc.roundedRect(x - width / 2, y - height / 2, width, height, 6, 6, "FD");
      }
      continue;
    }

    if (element.type === "image" && element.src) {
      try {
        const imageResponse = await fetch(element.src);
        const imageBlob = await imageResponse.blob();
        const imageData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("Não foi possível ler a imagem do elemento."));
          reader.readAsDataURL(imageBlob);
        });
        const width = Math.max(24, Math.min(240, element.width || 120));
        const height = Math.max(18, Math.min(160, element.height || width * 0.56));
        doc.addImage(imageData, "PNG", x - width / 2, y - height / 2, width, height);
      } catch (error) {
        console.warn("Elemento de imagem ignorado na exportação do certificado:", error);
      }
      continue;
    }

    if (element.type === "line") {
      doc.setDrawColor(element.color || "#333333");
      doc.setLineWidth(Math.max(1, element.size / 4));
      doc.line(x - 70, y, x + 70, y);
      continue;
    }

    const fontFamily = element.fontFamily === "serif" ? "times" : element.fontFamily === "mono" ? "courier" : "helvetica";
    doc.setFont(fontFamily, element.type === "badge" || element.weight === "bold" ? "bold" : "normal");
    doc.setFontSize(Math.max(7, Math.min(30, element.size || 12)));
    doc.setTextColor(element.color || "#333333");
    doc.text(element.content || "Elemento", x, y, { align: element.align || "center", angle: element.rotation || 0 });
  }

  if (options.verificationCode) {
    try {
      const qrDataUrl = await QRCode.toDataURL(getCertificateVerificationUrl(options.verificationCode), {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 180,
        color: { dark: "#111827", light: "#ffffff" },
      });
      doc.addImage(qrDataUrl, "PNG", pageWidth - 120, pageHeight - 105, 72, 72);
      doc.setFontSize(7);
      doc.setTextColor("#666666");
      doc.text("Validar documento", pageWidth - 120, pageHeight - 25);
    } catch (error) {
      console.warn("QR Code de validação ignorado na exportação:", error);
    }
  }

  // Salvar arquivo
  const safeName = (options.studentName || "certificado").toLowerCase().replace(/[^a-z0-9]/g, "-");
  doc.save(`certificado-${options.templateName}-${safeName}.pdf`);
  return true;
}
