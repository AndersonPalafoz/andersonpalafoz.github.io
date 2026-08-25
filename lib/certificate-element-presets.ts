import type { CertificateCompositionElement } from "./certificate-composition";

export type CertificateElementPreset = {
  id: string;
  label: string;
  description: string;
  create: (index: number) => Omit<CertificateCompositionElement, "id">;
};

export const CERTIFICATE_ELEMENT_PRESETS: CertificateElementPreset[] = [
  {
    id: "profici-header",
    label: "Cabeçalho PROFICI / UFBA",
    description: "Brasão da UFBA, logotipo PROFICI e identificação institucional do modelo enviado.",
    create: index => ({
      type: "image",
      content: "/manus-storage/image4-reference_863640d0.jpeg",
      x: 704,
      y: 548,
      width: 122,
      height: 92,
      opacity: 0.96,
      zIndex: index,
      visible: true,
      locked: false,
    }),
  },
  {
    id: "profici-crest",
    label: "Brasão UFBA",
    description: "Brasão institucional extraído do certificado PROFICI enviado.",
    create: index => ({
      type: "image",
      content: "/manus-storage/ufba-crest_db3e90ef.jpeg",
      x: 78,
      y: 536,
      width: 34,
      height: 46,
      opacity: 1,
      zIndex: index,
      visible: true,
      locked: false,
    }),
  },
  {
    id: "profici-signature",
    label: "Assinatura PROFICI",
    description: "Assinatura manuscrita extraída do modelo, posicionada acima do nome da coordenadora.",
    create: index => ({
      type: "image",
      content: "/manus-storage/profici-wordmark_7b5435b0.jpeg",
      x: 421,
      y: 112,
      width: 150,
      height: 42,
      opacity: 0.9,
      zIndex: index,
      visible: true,
      locked: false,
    }),
  },

  {
    id: "seal",
    label: "Selo circular",
    description: "Selo de reconhecimento com preenchimento e contorno editáveis.",
    create: index => ({
      type: "shape",
      content: "Selo de reconhecimento",
      x: 720,
      y: 470,
      width: 74,
      height: 74,
      size: 10,
      fill: "#fef3c7",
      stroke: "#b45309",
      strokeWidth: 2,
      shape: "circle",
      opacity: 0.95,
      zIndex: index,
      visible: true,
      align: "center",
    }),
  },
  {
    id: "ribbon",
    label: "Faixa de destaque",
    description: "Pílula horizontal para destacar turma, modalidade ou edição.",
    create: index => ({
      type: "shape",
      content: "Faixa de destaque",
      x: 421,
      y: 190,
      width: 280,
      height: 38,
      size: 12,
      fill: "#fee2e2",
      stroke: "#dc2626",
      strokeWidth: 1,
      shape: "pill",
      opacity: 0.92,
      zIndex: index,
      visible: true,
      align: "center",
    }),
  },
  {
    id: "divider",
    label: "Separador editorial",
    description: "Linha com presença visual para dividir título, corpo e assinatura.",
    create: index => ({
      type: "line",
      content: "Separador editorial",
      x: 421,
      y: 300,
      width: 330,
      height: 8,
      size: 3,
      color: "#b45309",
      stroke: "#b45309",
      strokeWidth: 2,
      opacity: 0.8,
      zIndex: index,
      visible: true,
      align: "center",
    }),
  },
  {
    id: "quote",
    label: "Frase institucional",
    description: "Bloco de texto com fonte serifada para uma assinatura editorial.",
    create: index => ({
      type: "text",
      content: "Excelência que se transforma em trajetória.",
      x: 421,
      y: 155,
      width: 500,
      height: 42,
      size: 15,
      color: "#7c2d12",
      fontFamily: "serif",
      letterSpacing: 0.2,
      weight: "bold",
      opacity: 0.9,
      zIndex: index,
      visible: true,
      align: "center",
    }),
  },
  {
    id: "verification",
    label: "Bloco de verificação",
    description: "Mensagem monoespaçada para código, turma ou referência institucional.",
    create: index => ({
      type: "text",
      content: "VERIFICAÇÃO · {{certificateCode}}",
      x: 421,
      y: 76,
      width: 360,
      height: 28,
      size: 10,
      color: "#334155",
      fontFamily: "mono",
      letterSpacing: 0.4,
      zIndex: index,
      visible: true,
      align: "center",
    }),
  },
];

export function createCertificateElementPreset(
  presetId: string,
  index: number,
): CertificateCompositionElement | null {
  const preset = CERTIFICATE_ELEMENT_PRESETS.find(item => item.id === presetId);
  if (!preset) return null;
  return {
    id: `${preset.id}_${Date.now()}_${index}`,
    ...preset.create(index),
  };
}

export function createProficiCertificateElements() {
  const assets = ["profici-header", "profici-crest", "profici-signature"].map((presetId, index) =>
    createCertificateElementPreset(presetId, index),
  ).filter((element): element is CertificateCompositionElement => Boolean(element));
  const textElements: CertificateCompositionElement[] = [
    { id: "profici-institution", type: "text", content: "UNIVERSIDADE FEDERAL DA BAHIA", x: 421, y: 548, size: 14, width: 540, color: "#111827", weight: "bold", align: "center", zIndex: 20, visible: true, locked: false },
    { id: "profici-program", type: "text", content: "PROFICI - Programa de Proficiência em Língua Estrangeira para", x: 421, y: 526, size: 11, width: 620, color: "#111827", weight: "bold", align: "center", zIndex: 20, visible: true, locked: false },
    { id: "profici-audience", type: "text", content: "Estudantes e Servidores da UFBA", x: 421, y: 509, size: 11, width: 620, color: "#111827", weight: "bold", align: "center", zIndex: 20, visible: true, locked: false },
    { id: "profici-title", type: "text", content: "CERTIFICADO", x: 421, y: 450, size: 20, width: 420, color: "#111827", weight: "bold", align: "center", letterSpacing: 0.4, zIndex: 20, visible: true, locked: false },
    { id: "profici-body-prefix", type: "text", content: "Certifico que", x: 86, y: 392, size: 12, width: 660, color: "#111827", align: "left", zIndex: 20, visible: true, locked: false },
    { id: "profici-body-course", type: "text", content: "concluiu o curso em nível {{level}} do PROFICI", x: 86, y: 315, size: 11, width: 660, color: "#111827", align: "left", zIndex: 20, visible: true, locked: false },
    { id: "profici-body-program", type: "text", content: "(Programa de Proficiência em Língua Estrangeira para Estudantes e Servidores da UFBA)", x: 86, y: 280, size: 10, width: 660, color: "#111827", align: "left", zIndex: 20, visible: true, locked: false },
    { id: "profici-body-period", type: "text", content: "realizado no período de {{period}} com carga horária de {{workloadHours}}.", x: 86, y: 260, size: 10, width: 660, color: "#111827", align: "left", zIndex: 20, visible: true, locked: false },
    { id: "profici-signer-line", type: "line", content: "Linha de assinatura", x: 421, y: 112, width: 190, size: 1, color: "#1f2937", zIndex: 20, visible: true, locked: false },
    { id: "profici-signer-role", type: "text", content: "Coordenadora Geral do PROFICI", x: 421, y: 72, size: 10, width: 300, color: "#111827", align: "center", zIndex: 20, visible: true, locked: false },
  ];
  return [...assets, ...textElements];
}
