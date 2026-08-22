export interface CertificatePreset {
  id: "standard" | "isf" | "profici";
  name: string;
  organization: string;
  borderColor: string;
  primaryColor: string;
  descriptionTemplate: (name: string, cpf: string, course: string, workload: string, period: string) => string;
  defaultSigner: string;
  defaultTitle: string;
}

export const CERTIFICATE_PRESETS: Record<string, CertificatePreset> = {
  standard: {
    id: "standard",
    name: "Padrão Anderson Palafoz",
    organization: "Anderson Palafoz Platform",
    borderColor: "#991b1b",
    primaryColor: "#dc2626",
    descriptionTemplate: (name, cpf, course, workload, period) =>
      `Certificamos para os devidos fins que ${name} concluiu com êxito o programa acadêmico ${course}, no período de ${period}, com carga horária total de ${workload}.`,
    defaultSigner: "Anderson Bacelar Palafoz — Professor e Pesquisador",
    defaultTitle: "CERTIFICADO DE CONCLUSÃO",
  },
  isf: {
    id: "isf",
    name: "Rede IsF / Andifes (DOCX)",
    organization: "Rede Andifes Idiomas sem Fronteiras — UFBA",
    borderColor: "#0f766e",
    primaryColor: "#0d9488",
    descriptionTemplate: (name, cpf, course, workload, period) =>
      `Certificamos que ${name} (CPF nº ${cpf}) concluiu o curso de Língua Inglesa intitulado ${course}, ofertado pela Rede Andifes Idiomas sem Fronteiras em parceria com a Universidade Federal da Bahia, realizado no período de ${period}, com carga horária total de ${workload}.`,
    defaultSigner: "Coordenador(a) Administrativo(a) da Rede IsF na UFBA",
    defaultTitle: "CERTIFICADO DE CONCLUSÃO",
  },
  profici: {
    id: "profici",
    name: "PROFICI / UFBA (DOCX)",
    organization: "PROFICI — UFBA (Programa de Proficiência)",
    borderColor: "#1e40af",
    primaryColor: "#2563eb",
    descriptionTemplate: (name, cpf, course, workload, period) =>
      `Certifico que ${name} concluiu o ${course} do PROFICI (Programa de Proficiência em Língua Estrangeira para Estudantes e Servidores da UFBA), realizado no período de ${period} com carga horária de ${workload}.`,
    defaultSigner: "Fernanda Mota Pereira — Coordenadora Geral do PROFICI",
    defaultTitle: "CERTIFICADO DE CONCLUSÃO",
  },
};
