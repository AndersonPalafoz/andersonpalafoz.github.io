export const CERTIFICATE_CANVAS = {
  width: 842,
  height: 595,
} as const;

export type CertificateVisualVariant =
  | "standard"
  | "isf"
  | "profici"
  | "minimal"
  | "laureate"
  | "botanical"
  | "geometric"
  | "midnight";

export type CertificateFieldKey =
  | "studentName"
  | "courseTitle"
  | "level"
  | "issuedAt"
  | "certificateCode"
  | "workloadHours"
  | "studentCpf"
  | "period"
  | "coordinatorName"
  | "institutionName";

export type CertificateFieldMapping = {
  x: number;
  y: number;
  size?: number;
  maxWidth?: number;
  color?: string;
  letterSpacing?: number;
  fontFamily?: "sans" | "serif" | "mono";
  weight?: "normal" | "bold";
  align?: "left" | "center" | "right";
};

export type CertificateCompositionElement = {
  id: string;
  type: "text" | "image" | "line" | "badge" | "shape";
  /** Texto estático ou variáveis como {{studentName}}. Para imagens, uma URL/path persistente. */
  content: string;
  /** Coordenadas no sistema PDF: origem no canto inferior esquerdo. */
  x: number;
  y: number;
  size?: number;
  width?: number;
  height?: number;
  color?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  radius?: number;
  rotation?: number;
  letterSpacing?: number;
  fontFamily?: "sans" | "serif" | "mono";
  shape?: "rectangle" | "circle" | "pill" | "diamond";
  weight?: "normal" | "bold";
  align?: "left" | "center" | "right";
  opacity?: number;
  zIndex?: number;
  visible?: boolean;
  locked?: boolean;
  /** True when the element is the platform logo and must obey includeSiteBranding. */
  isSiteBranding?: boolean;
};

export type CertificateComposition = {
  version: 1;
  visualVariant?: CertificateVisualVariant;
  canvas: {
    width: number;
    height: number;
  };
  fieldMappings: Partial<Record<CertificateFieldKey, CertificateFieldMapping>>;
  elements: CertificateCompositionElement[];
};

export const DEFAULT_FIELD_MAPPINGS: Partial<
  Record<CertificateFieldKey, CertificateFieldMapping>
> = {
  institutionName: { x: 70, y: 535, size: 14, maxWidth: 390, weight: "bold" },
  studentName: { x: 421, y: 342, size: 29, maxWidth: 650, weight: "bold", align: "center" },
  studentCpf: { x: 421, y: 303, size: 12, maxWidth: 420, align: "center" },
  courseTitle: { x: 421, y: 252, size: 20, maxWidth: 650, weight: "bold", align: "center" },
  level: { x: 421, y: 217, size: 13, maxWidth: 260, align: "center" },
  workloadHours: { x: 178, y: 178, size: 12, maxWidth: 180 },
  period: { x: 421, y: 178, size: 12, maxWidth: 260, align: "center" },
  issuedAt: { x: 70, y: 88, size: 11, maxWidth: 220 },
  coordinatorName: { x: 610, y: 88, size: 11, maxWidth: 220, weight: "bold", align: "center" },
  // A faixa inferior direita é reservada ao QR Code de validação.
  certificateCode: { x: 70, y: 54, size: 10, maxWidth: 340 },
};

export const DEFAULT_CERTIFICATE_COMPOSITION: CertificateComposition = {
  version: 1,
  visualVariant: "standard",
  canvas: { ...CERTIFICATE_CANVAS },
  fieldMappings: DEFAULT_FIELD_MAPPINGS,
  elements: [],
};

const FIELD_KEYS: CertificateFieldKey[] = [
  "studentName",
  "courseTitle",
  "level",
  "issuedAt",
  "certificateCode",
  "workloadHours",
  "studentCpf",
  "period",
  "coordinatorName",
  "institutionName",
];

function finiteNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function sanitizeMapping(value: unknown, fallback: CertificateFieldMapping) {
  const input = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    x: clamp(finiteNumber(input.x, fallback.x), 0, CERTIFICATE_CANVAS.width),
    y: clamp(finiteNumber(input.y, fallback.y), 0, CERTIFICATE_CANVAS.height),
    size: clamp(finiteNumber(input.size, fallback.size ?? 12), 6, 96),
    maxWidth: clamp(
      finiteNumber(input.maxWidth, fallback.maxWidth ?? 700),
      20,
      CERTIFICATE_CANVAS.width
    ),
    ...(typeof input.color === "string" && /^#[0-9a-f]{3,8}$/i.test(input.color)
      ? { color: input.color }
      : fallback.color
        ? { color: fallback.color }
        : {}),
    letterSpacing: clamp(finiteNumber(input.letterSpacing, fallback.letterSpacing ?? 0), -5, 20),
    fontFamily: input.fontFamily === "serif" || input.fontFamily === "mono" ? input.fontFamily : fallback.fontFamily ?? "sans",
    weight: input.weight === "bold" ? "bold" : fallback.weight ?? "normal",
    align:
      input.align === "center" || input.align === "right"
        ? input.align
        : fallback.align ?? "left",
  } satisfies CertificateFieldMapping;
}

function sanitizeElement(value: unknown, index: number): CertificateCompositionElement | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const type = input.type === "image" || input.type === "line" || input.type === "badge" || input.type === "shape" || input.type === "text" ? input.type : null;
  if (!type || typeof input.content !== "string" || !input.content.trim()) return null;
  const width = finiteNumber(input.width, type === "image" ? 120 : 240);
  const height = finiteNumber(input.height, type === "image" ? 80 : 40);
  return {
    id: typeof input.id === "string" && input.id.trim() ? input.id : `element_${index}`,
    type,
    content: input.content.trim().slice(0, 5000),
    x: clamp(finiteNumber(input.x, 80), 0, CERTIFICATE_CANVAS.width),
    y: clamp(finiteNumber(input.y, 200), 0, CERTIFICATE_CANVAS.height),
    size: clamp(finiteNumber(input.size, 14), 6, 96),
    width: clamp(width, 12, CERTIFICATE_CANVAS.width),
    height: clamp(height, 12, CERTIFICATE_CANVAS.height),
    ...(typeof input.color === "string" && /^#[0-9a-f]{3,8}$/i.test(input.color)
      ? { color: input.color }
      : {}),
    ...(typeof input.fill === "string" && /^#[0-9a-f]{3,8}$/i.test(input.fill)
      ? { fill: input.fill }
      : {}),
    ...(typeof input.stroke === "string" && /^#[0-9a-f]{3,8}$/i.test(input.stroke)
      ? { stroke: input.stroke }
      : {}),
    strokeWidth: clamp(finiteNumber(input.strokeWidth, 0), 0, 24),
    radius: clamp(finiteNumber(input.radius, 0), 0, 100),
    rotation: clamp(finiteNumber(input.rotation, 0), -180, 180),
    letterSpacing: clamp(finiteNumber(input.letterSpacing, 0), -5, 20),
    fontFamily: input.fontFamily === "serif" || input.fontFamily === "mono" ? input.fontFamily : "sans",
    ...(input.shape === "circle" || input.shape === "pill" || input.shape === "diamond" ? { shape: input.shape } : input.type === "shape" ? { shape: "rectangle" as const } : {}),
    weight: input.weight === "bold" ? "bold" : "normal",
    align:
      input.align === "center" || input.align === "right" ? input.align : "left",
    opacity: clamp(finiteNumber(input.opacity, 1), 0, 1),
    zIndex: Math.round(finiteNumber(input.zIndex, index)),
    visible: input.visible !== false,
    locked: input.locked === true,
    ...(input.isSiteBranding === true ? { isSiteBranding: true } : {}),
  };
}

/**
 * Normaliza tanto o formato novo `{ version, fieldMappings, elements }` quanto
 * os JSON legados que continham somente os campos nomeados.
 */
export function parseCertificateComposition(raw: unknown): CertificateComposition {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = raw.trim() ? JSON.parse(raw) : null;
    } catch {
      parsed = null;
    }
  }

  const object = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  const sourceMappings =
    object.fieldMappings && typeof object.fieldMappings === "object"
      ? (object.fieldMappings as Record<string, unknown>)
      : object;
  const fields: Partial<Record<CertificateFieldKey, CertificateFieldMapping>> = {};
  for (const key of FIELD_KEYS) {
    if (sourceMappings[key]) {
      fields[key] = sanitizeMapping(sourceMappings[key], DEFAULT_FIELD_MAPPINGS[key]!);
    }
  }
  for (const key of FIELD_KEYS) {
    if (!fields[key]) fields[key] = DEFAULT_FIELD_MAPPINGS[key];
  }

  const rawElements = Array.isArray(object.elements)
    ? object.elements
    : Array.isArray(object.customElements)
      ? object.customElements
      : [];
  const elements = rawElements
    .map((element, index) => sanitizeElement(element, index))
    .filter((element): element is CertificateCompositionElement => Boolean(element));

  const visualVariant =
    object.visualVariant === "isf" ||
    object.visualVariant === "profici" ||
    object.visualVariant === "minimal" ||
    object.visualVariant === "laureate" ||
    object.visualVariant === "botanical" ||
    object.visualVariant === "geometric" ||
    object.visualVariant === "midnight" ||
    object.visualVariant === "standard"
      ? object.visualVariant
      : "standard";

  return {
    version: 1,
    visualVariant,
    canvas: { ...CERTIFICATE_CANVAS },
    fieldMappings: fields,
    elements,
  };
}

export function serializeCertificateComposition(composition: CertificateComposition) {
  return JSON.stringify(parseCertificateComposition(composition));
}

export type CertificateRenderValues = Partial<Record<CertificateFieldKey, string>>;

export function resolveCertificateText(text: string, values: CertificateRenderValues) {
  return text.replace(/\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g, (_, key: string) => {
    return values[key as CertificateFieldKey] ?? "";
  });
}

export function compositionHasCustomElements(composition: CertificateComposition) {
  return composition.elements.length > 0;
}
