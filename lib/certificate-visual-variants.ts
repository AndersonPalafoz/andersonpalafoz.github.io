import type { CertificateVisualVariant } from "@/lib/certificate-composition";

export type CertificateVisualVariantDefinition = {
  id: CertificateVisualVariant;
  label: string;
  shortLabel: string;
  description: string;
  family: string;
  recommendedFor: string;
  accent: string;
  accentDark: string;
  accentSoft: string;
  ink: string;
  muted: string;
  paper: string;
  panel: string;
  border: string;
  motif:
    | "double"
    | "institutional"
    | "editorial"
    | "minimal"
    | "laureate"
    | "botanical"
    | "geometric"
    | "midnight";
  headerLabel: string;
  footerLabel: string;
  watermarkLabel: string;
  defaultBranding: boolean;
};

/**
 * Variações oficiais do editor. Elas mudam a composição visual sem alterar a
 * identidade da marca: vermelho institucional, grafite, cinzas e branco.
 */
export const CERTIFICATE_VISUAL_VARIANTS: Record<
  CertificateVisualVariant,
  CertificateVisualVariantDefinition
> = {
  standard: {
    id: "standard",
    label: "Padrão Executivo",
    shortLabel: "Padrão",
    description: "Composição oficial com moldura dupla, centro de destaque e leitura institucional.",
    family: "Institucional",
    recommendedFor: "Emissões gerais e documentos oficiais",
    accent: "#D62828",
    accentDark: "#B91C1C",
    accentSoft: "#FDECEC",
    ink: "#1F1F1F",
    muted: "#6B7280",
    paper: "#FFFFFF",
    panel: "#F8F9FA",
    border: "#E5E7EB",
    motif: "double",
    headerLabel: "CERTIFICADO DE CONCLUSÃO",
    footerLabel: "Anderson Palafoz · Ensino de Inglês",
    watermarkLabel: "AP",
    defaultBranding: true,
  },
  isf: {
    id: "isf",
    label: "IsF Institucional",
    shortLabel: "IsF",
    description: "Tratamento formal para programas institucionais, com eixo lateral e selo discreto.",
    family: "Institucional",
    recommendedFor: "Programas IsF, UFBA e parcerias acadêmicas",
    accent: "#991B1B",
    accentDark: "#7F1D1D",
    accentSoft: "#FCE8E8",
    ink: "#242424",
    muted: "#5F6368",
    paper: "#FFFDFC",
    panel: "#F7F4F1",
    border: "#D9D1CA",
    motif: "institutional",
    headerLabel: "CERTIFICADO INSTITUCIONAL",
    footerLabel: "Programa de Idiomas · IsF",
    watermarkLabel: "IsF",
    defaultBranding: false,
  },
  profici: {
    id: "profici",
    label: "PROFICI Acadêmico",
    shortLabel: "PROFICI",
    description: "Estrutura acadêmica com faixa superior, assinatura destacada e dados separados.",
    family: "Acadêmico",
    recommendedFor: "Proficiência, extensão e formação universitária",
    accent: "#333333",
    accentDark: "#1F1F1F",
    accentSoft: "#F1F2F3",
    ink: "#1F1F1F",
    muted: "#6B7280",
    paper: "#FFFFFF",
    panel: "#F3F4F6",
    border: "#D1D5DB",
    motif: "editorial",
    headerLabel: "CERTIFICADO ACADÊMICO",
    footerLabel: "Programa de Proficiência · PROFICI",
    watermarkLabel: "P",
    defaultBranding: false,
  },
  minimal: {
    id: "minimal",
    label: "Moderno Minimalista",
    shortLabel: "Minimal",
    description: "Layout limpo, flexível e com amplo espaço para títulos de cursos internos.",
    family: "Contemporâneo",
    recommendedFor: "Cursos internos, workshops e modelos personalizados",
    accent: "#D62828",
    accentDark: "#B91C1C",
    accentSoft: "#FFF5F5",
    ink: "#1F1F1F",
    muted: "#6B7280",
    paper: "#FFFFFF",
    panel: "#FAFAFA",
    border: "#E5E7EB",
    motif: "minimal",
    headerLabel: "CERTIFICADO",
    footerLabel: "Documento acadêmico",
    watermarkLabel: "A",
    defaultBranding: true,
  },
  laureate: {
    id: "laureate",
    label: "Laureate Clássico",
    shortLabel: "Laureate",
    description: "Moldura cerimonial em marfim, dourado e grafite para conquistas de destaque.",
    family: "Cerimonial",
    recommendedFor: "Mérito, conclusão e reconhecimento especial",
    accent: "#B88A3B",
    accentDark: "#76551F",
    accentSoft: "#F6EEDC",
    ink: "#29251F",
    muted: "#7B7162",
    paper: "#FFFCF5",
    panel: "#FBF6E9",
    border: "#DCCCA8",
    motif: "laureate",
    headerLabel: "CERTIFICADO DE MÉRITO",
    footerLabel: "Reconhecimento de excelência · Anderson Palafoz",
    watermarkLabel: "L",
    defaultBranding: true,
  },
  botanical: {
    id: "botanical",
    label: "Botânico Terracota",
    shortLabel: "Botânico",
    description: "Composição acolhedora em verde profundo e terracota, com cantos orgânicos.",
    family: "Orgânico",
    recommendedFor: "Participação, projetos e formação continuada",
    accent: "#315C4A",
    accentDark: "#214234",
    accentSoft: "#E5EFE8",
    ink: "#25352D",
    muted: "#718078",
    paper: "#FCFBF7",
    panel: "#F2F5EF",
    border: "#C9D8CC",
    motif: "botanical",
    headerLabel: "CERTIFICADO DE PARTICIPAÇÃO",
    footerLabel: "Formação contínua · Anderson Palafoz",
    watermarkLabel: "B",
    defaultBranding: true,
  },
  geometric: {
    id: "geometric",
    label: "Geometric Blue",
    shortLabel: "Geometric",
    description: "Visual contemporâneo com diagonais, azul profundo e sinalização modular.",
    family: "Contemporâneo",
    recommendedFor: "Tecnologia, idiomas e cursos de curta duração",
    accent: "#2F6FED",
    accentDark: "#1D3F91",
    accentSoft: "#E8F0FF",
    ink: "#17243D",
    muted: "#61708B",
    paper: "#FBFCFF",
    panel: "#F1F5FB",
    border: "#C8D5EA",
    motif: "geometric",
    headerLabel: "CERTIFICADO DE FORMAÇÃO",
    footerLabel: "Aprendizagem aplicada · Anderson Palafoz",
    watermarkLabel: "G",
    defaultBranding: true,
  },
  midnight: {
    id: "midnight",
    label: "Midnight Premium",
    shortLabel: "Midnight",
    description: "Fundo azul-noite, tipografia clara e acentos metálicos para uma presença premium.",
    family: "Premium",
    recommendedFor: "Certificados especiais, turmas avançadas e eventos",
    accent: "#D7AE5A",
    accentDark: "#F4D28A",
    accentSoft: "#263955",
    ink: "#F7F8FC",
    muted: "#B4C0D3",
    paper: "#101B2D",
    panel: "#162740",
    border: "#3A5274",
    motif: "midnight",
    headerLabel: "CERTIFICADO DE EXCELÊNCIA",
    footerLabel: "Anderson Palafoz · Formação de alto nível",
    watermarkLabel: "M",
    defaultBranding: false,
  },
};

export const CERTIFICATE_VISUAL_VARIANT_LIST = Object.values(
  CERTIFICATE_VISUAL_VARIANTS
);

export function getCertificateVisualVariant(
  variant: unknown
): CertificateVisualVariantDefinition {
  if (
    variant === "isf" ||
    variant === "profici" ||
    variant === "minimal" ||
    variant === "laureate" ||
    variant === "botanical" ||
    variant === "geometric" ||
    variant === "midnight" ||
    variant === "standard"
  ) {
    return CERTIFICATE_VISUAL_VARIANTS[variant];
  }
  return CERTIFICATE_VISUAL_VARIANTS.standard;
}

export function isCertificateVisualVariant(
  value: unknown
): value is CertificateVisualVariant {
  return (
    value === "standard" ||
    value === "isf" ||
    value === "profici" ||
    value === "minimal" ||
    value === "laureate" ||
    value === "botanical" ||
    value === "geometric" ||
    value === "midnight"
  );
}

export function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map(char => `${char}${char}`).join("")
    : normalized;
  const parsed = Number.parseInt(value, 16);
  return {
    r: ((parsed >> 16) & 255) / 255,
    g: ((parsed >> 8) & 255) / 255,
    b: (parsed & 255) / 255,
  };
}
