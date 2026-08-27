export type CertificateFlowStep = "create" | "validate" | "download";
export type CertificateFlowRole = "admin" | "professor" | "student";

export type CertificateFlowAvailability = {
  certificateCode?: string | null;
  certificateUrl?: string | null;
  signedPdfUrl?: string | null;
};

export const CERTIFICATE_FLOW = [
  {
    id: "create" as const,
    title: "Criar",
    description: "Dados e prévia do documento",
  },
  {
    id: "validate" as const,
    title: "Validar",
    description: "Código e assinatura conferidos",
  },
  {
    id: "download" as const,
    title: "Baixar",
    description: "PDF oficial disponível",
  },
] as const;

export function resolveCertificateFlowStep(
  certificate: CertificateFlowAvailability
): CertificateFlowStep {
  if (certificate.signedPdfUrl || certificate.certificateUrl) return "download";
  if (certificate.certificateCode) return "validate";
  return "create";
}

export function getCertificateFlowCopy(role: CertificateFlowRole) {
  if (role === "admin") {
    return "Configure o modelo, confira os dados, valide a emissão e disponibilize o PDF.";
  }
  if (role === "professor") {
    return "Emita para os cursos sob sua gestão, valide o documento e entregue o PDF ao aluno.";
  }
  return "Consulte o documento emitido, valide sua autenticidade e baixe sua cópia em PDF.";
}
