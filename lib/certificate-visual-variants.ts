import type { CertificateVisualVariant } from "@/lib/certificate-composition";

export type CertificateVisualVariantDefinition = {
  id: CertificateVisualVariant;
  label: string;
  shortLabel: string;
  description: string;
  accent: string;
  accentDark: string;
  accentSoft: string;
  ink: string;
  muted: string;
  paper: string;
  panel: string;
  border: string;
  motif: "double" | "institutional" | "editorial" | "minimal";
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
    description: "A composição oficial da plataforma, com moldura dupla e hierarquia central.",
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
    description: "Estrutura acadêmica com faixa superior, assinatura destacada e dados bem separados.",
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
    description: "Layout limpo e flexível para cursos internos ou modelos personalizados.",
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
    value === "minimal"
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
