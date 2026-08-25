import type {
  CertificateFieldKey,
  CertificateFieldMapping,
  CertificateVisualVariant,
} from "@/lib/certificate-composition";

export type CertificateLayoutPreset = Partial<
  Record<CertificateFieldKey, CertificateFieldMapping>
>;

const center = (
  x: number,
  y: number,
  size: number,
  maxWidth: number,
  extra: Partial<CertificateFieldMapping> = {}
): CertificateFieldMapping => ({
  x,
  y,
  size,
  maxWidth,
  align: "center",
  ...extra,
});

const left = (
  x: number,
  y: number,
  size: number,
  maxWidth: number,
  extra: Partial<CertificateFieldMapping> = {}
): CertificateFieldMapping => ({
  x,
  y,
  size,
  maxWidth,
  align: "left",
  ...extra,
});

const right = (
  x: number,
  y: number,
  size: number,
  maxWidth: number,
  extra: Partial<CertificateFieldMapping> = {}
): CertificateFieldMapping => ({
  x,
  y,
  size,
  maxWidth,
  align: "right",
  ...extra,
});

export const CERTIFICATE_LAYOUT_PRESETS: Record<
  CertificateVisualVariant,
  CertificateLayoutPreset
> = {
  standard: {
    institutionName: left(70, 535, 14, 390, { weight: "bold" }),
    studentName: center(421, 342, 29, 650, { weight: "bold" }),
    studentCpf: center(421, 303, 12, 420),
    courseTitle: center(421, 252, 20, 650, { weight: "bold" }),
    level: center(421, 217, 13, 260),
    workloadHours: left(178, 178, 12, 180),
    period: center(421, 178, 12, 260),
    issuedAt: left(70, 88, 11, 220),
    coordinatorName: center(610, 88, 11, 220, { weight: "bold" }),
    certificateCode: right(772, 54, 10, 220),
  },
  isf: {
    institutionName: left(62, 535, 12, 390, { weight: "bold" }),
    studentName: center(420, 332, 24, 610, { weight: "bold" }),
    studentCpf: center(420, 299, 12, 390),
    courseTitle: center(420, 253, 17, 600, { weight: "bold" }),
    level: center(420, 216, 13, 240),
    workloadHours: left(100, 178, 12, 180),
    period: left(300, 178, 12, 270),
    issuedAt: left(100, 95, 11, 190),
    coordinatorName: right(740, 95, 11, 260, { weight: "bold" }),
    certificateCode: right(740, 55, 10, 190),
  },
  profici: {
    institutionName: left(70, 78, 12, 370, { weight: "bold" }),
    studentName: left(120, 365, 23, 560, { weight: "bold" }),
    studentCpf: left(120, 332, 11, 300),
    courseTitle: left(120, 286, 17, 550, { weight: "bold" }),
    level: right(702, 286, 13, 180),
    workloadHours: left(120, 246, 12, 180),
    period: left(325, 246, 12, 280),
    issuedAt: left(120, 112, 11, 190),
    coordinatorName: right(690, 112, 11, 240, { weight: "bold" }),
    certificateCode: right(730, 72, 10, 200),
  },
  minimal: {
    institutionName: left(82, 525, 13, 390, { weight: "bold" }),
    studentName: left(86, 344, 30, 650, { weight: "bold" }),
    studentCpf: left(86, 305, 11, 300),
    courseTitle: left(86, 255, 20, 640, { weight: "bold" }),
    level: left(86, 215, 13, 250),
    workloadHours: left(390, 215, 13, 180),
    period: right(756, 215, 13, 230),
    issuedAt: left(86, 88, 11, 220),
    coordinatorName: right(756, 88, 11, 220, { weight: "bold" }),
    certificateCode: left(86, 54, 10, 280),
  },
  laureate: {
    institutionName: center(421, 526, 14, 440, { weight: "bold" }),
    studentName: center(421, 342, 30, 650, { weight: "bold" }),
    studentCpf: center(421, 303, 12, 400),
    courseTitle: center(421, 252, 20, 650, { weight: "bold" }),
    level: center(421, 216, 13, 250),
    workloadHours: left(160, 176, 12, 170),
    period: center(421, 176, 12, 260),
    issuedAt: left(86, 88, 11, 210),
    coordinatorName: right(756, 88, 11, 250, { weight: "bold" }),
    certificateCode: right(756, 54, 10, 220),
  },
  botanical: {
    institutionName: left(88, 526, 13, 420, { weight: "bold" }),
    studentName: center(421, 340, 28, 640, { weight: "bold" }),
    studentCpf: center(421, 302, 12, 420),
    courseTitle: center(421, 254, 19, 630, { weight: "bold" }),
    level: center(421, 218, 13, 260),
    workloadHours: left(120, 177, 12, 180),
    period: center(421, 177, 12, 260),
    issuedAt: left(88, 88, 11, 220),
    coordinatorName: right(754, 88, 11, 250, { weight: "bold" }),
    certificateCode: right(754, 54, 10, 220),
  },
  geometric: {
    institutionName: left(74, 526, 13, 420, { weight: "bold" }),
    studentName: left(118, 360, 26, 560, { weight: "bold" }),
    studentCpf: left(118, 325, 11, 300),
    courseTitle: left(118, 278, 18, 570, { weight: "bold" }),
    level: left(118, 238, 13, 220),
    workloadHours: left(118, 194, 12, 190),
    period: left(340, 194, 12, 270),
    issuedAt: left(118, 92, 11, 200),
    coordinatorName: right(730, 92, 11, 250, { weight: "bold" }),
    certificateCode: right(730, 54, 10, 220),
  },
  midnight: {
    institutionName: left(70, 526, 13, 420, { weight: "bold" }),
    studentName: center(421, 340, 29, 650, { weight: "bold" }),
    studentCpf: center(421, 302, 12, 420),
    courseTitle: center(421, 254, 20, 650, { weight: "bold" }),
    level: center(421, 218, 13, 260),
    workloadHours: left(132, 174, 12, 180),
    period: center(421, 174, 12, 260),
    issuedAt: left(70, 82, 11, 220),
    coordinatorName: right(772, 82, 11, 250, { weight: "bold" }),
    certificateCode: right(772, 50, 10, 220),
  },
};

export function getCertificateLayoutPreset(
  variant: CertificateVisualVariant
): CertificateLayoutPreset {
  return CERTIFICATE_LAYOUT_PRESETS[variant] ?? CERTIFICATE_LAYOUT_PRESETS.standard;
}
