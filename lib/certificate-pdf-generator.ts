import { jsPDF } from "jspdf";

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
  
  const splitText = doc.splitTextToSize(bodyText, pageWidth - 140);
  doc.text(splitText, 70, 170, { align: "center" });

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

  // Salvar arquivo
  const safeName = (options.studentName || "certificado").toLowerCase().replace(/[^a-z0-9]/g, "-");
  doc.save(`certificado-${options.templateName}-${safeName}.pdf`);
  return true;
}
