export type CertificateCourseInput = {
  title: string;
  description: string;
  level: string;
  category: string;
  modules: number;
  instructor: string;
  modality: "individual" | "group" | "hybrid";
  isFree: boolean;
  price: string;
  workloadHours: number;
  maxAbsencePercent: number;
  courseType: number;
  syncModality: "none" | "online_individual" | "online_group" | "presencial";
};

export function buildCertificateCourseInput(input: {
  title: string;
  level?: string | null;
  institution?: string | null;
  workloadHours?: number | null;
}): CertificateCourseInput {
  return {
    title: input.title.trim(),
    description: "Curso cadastrado para emissão de certificado.",
    level: input.level?.trim() || "Geral",
    category: input.institution?.trim() || "Curso Externo / Avulso",
    modules: 0,
    instructor: "Anderson Palafoz",
    modality: "individual",
    isFree: false,
    price: "0.00",
    workloadHours: input.workloadHours && input.workloadHours > 0 ? input.workloadHours : 40,
    maxAbsencePercent: 25,
    courseType: 1,
    syncModality: "none",
  };
}
