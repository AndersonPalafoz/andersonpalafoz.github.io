import type { CertificateCompositionElement } from "./certificate-composition";

export type CertificateElementPreset = {
  id: string;
  label: string;
  description: string;
  create: (index: number) => Omit<CertificateCompositionElement, "id">;
};

export const CERTIFICATE_ELEMENT_PRESETS: CertificateElementPreset[] = [
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
