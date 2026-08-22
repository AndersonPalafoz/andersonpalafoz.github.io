export interface CertificateComposition {
  id: "standard" | "isf" | "profici";
  name: string;
  organization: string;
  borderColor: string;
  primaryColor: string;
  title: string;
  subtitle: string;
  bodyTemplate: (name: string, cpf: string, course: string, workload: string, period: string) => string;
  locationAndDate: string;
  signerName: string;
  signerRole: string;
  showLogo: boolean;
  fontSize: number;
}

export const CERTIFICATE_PRESETS: Record<string, CertificateComposition> = {
  standard: {
    id: "standard",
    name: "Padrão Anderson Palafoz",
    organization: "Anderson Palafoz Platform",
    borderColor: "#991b1b",
    primaryColor: "#dc2626",
    title: "CERTIFICADO DE CONCLUSÃO",
    subtitle: "PROGRAMA OFICIAL DE ENSINO",
    bodyTemplate: (name, cpf, course, workload, period) =>
      `Certificamos para os devidos fins que ${name} (CPF: ${cpf}) concluiu com êxito o programa acadêmico ${course}, realizado no período de ${period}, com carga horária total de ${workload}.`,
    locationAndDate: "Salvador, Bahia — Brasil, 22 de agosto de 2026.",
    signerName: "Anderson Bacelar Palafoz",
    signerRole: "Professor e Pesquisador — Fundador da Plataforma",
    showLogo: true,
    fontSize: 14,
  },
  isf: {
    id: "isf",
    name: "Rede IsF / Andifes (DOCX Oficial)",
    organization: "REDE ANDIFES IDIOMAS SEM FRONTEIRAS — UFBA",
    borderColor: "#0f766e",
    primaryColor: "#0d9488",
    title: "CERTIFICADO",
    subtitle: "Ofertado pela Rede Andifes Idiomas sem Fronteiras em parceria com a UFBA",
    bodyTemplate: (name, cpf, course, workload, period) =>
      `Certificamos que ${name} CPF nº ${cpf} concluiu o curso de Língua Inglesa intitulado ${course}, ofertado pela Rede Andifes Idiomas sem Fronteiras na Oferta [Coletiva] em parceria com a Universidade Federal da Bahia, realizado no período de ${period}, com carga horária total de ${workload}.`,
    locationAndDate: "Salvador, 22 de agosto de 2026.",
    signerName: "Coordenador(a) Administrativo(a) da Rede IsF na UFBA",
    signerRole: "Rede IsF — Andifes / UFBA",
    showLogo: false,
    fontSize: 13,
  },
  profici: {
    id: "profici",
    name: "PROFICI / UFBA (DOCX Oficial)",
    organization: "PROFICI — PROGRAMA DE PROFICIÊNCIA DA UFBA",
    borderColor: "#1e40af",
    primaryColor: "#2563eb",
    title: "CERTIFICADO",
    subtitle: "Programa de Proficiência em Língua Estrangeira para Estudantes e Servidores da UFBA",
    bodyTemplate: (name, cpf, course, workload, period) =>
      `Certifico que ${name} concluiu o ${course} do PROFICI (Programa de Proficiência em Língua Estrangeira para Estudantes e Servidores da UFBA), realizado no período de ${period} com carga horária de ${workload}.`,
    locationAndDate: "Salvador, 22 de agosto de 2026.",
    signerName: "Fernanda Mota Pereira",
    signerRole: "Coordenadora Geral do PROFICI",
    showLogo: false,
    fontSize: 13,
  },
};
