import { readFile } from "node:fs/promises";
import path from "node:path";
import { degrees, rgb, type PDFDocument, type PDFPage, type PDFFont, type Rotation } from "pdf-lib";
import {
  type CertificateComposition,
  parseCertificateComposition,
  resolveCertificateText,
  type CertificateFieldKey,
} from "@/lib/certificate-composition";
import { getCertificateVisualVariant } from "@/lib/certificate-visual-variants";

export type PdfCompositionDocument = PDFDocument;
export type PdfCompositionPage = PDFPage;
export type PdfCompositionFont = PDFFont;

export type PdfCompositionFonts = {
  regular: PdfCompositionFont;
  bold: PdfCompositionFont;
  serif: PdfCompositionFont;
  serifBold: PdfCompositionFont;
  mono: PdfCompositionFont;
  monoBold: PdfCompositionFont;
};

function parseHexColor(value: string | undefined, fallback: ReturnType<typeof rgb>): ReturnType<typeof rgb> {
  if (!value || !/^#[0-9a-f]{6}$/i.test(value)) return fallback;
  const numeric = Number.parseInt(value.slice(1), 16);
  return rgb(((numeric >> 16) & 255) / 255, ((numeric >> 8) & 255) / 255, (numeric & 255) / 255);
}

function dataUriToBytes(source: string) {
  const match = source.match(/^data:(image\/(?:png|jpeg|jpg));base64,([a-z0-9+/=]+)$/i);
  if (!match) return null;
  return { bytes: new Uint8Array(Buffer.from(match[2], "base64")), type: match[1].toLowerCase() };
}

async function readCompositionImage(source: string) {
  const data = dataUriToBytes(source);
  if (data) return data;
  if (source.startsWith("/manus-storage/")) {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000";
      const absoluteUrl = source.startsWith("http") ? source : `${baseUrl.replace(/\/$/, "")}${source}`;
      const response = await fetch(absoluteUrl);
      if (!response.ok) return null;
      const bytes = new Uint8Array(await response.arrayBuffer());
      return { bytes, type: /\.jpe?g(?:$|\?)/i.test(source) ? "image/jpeg" : "image/png" };
    } catch {
      return null;
    }
  }
  if (!source.startsWith("/") || source.includes("..")) return null;
  try {
    const bytes = new Uint8Array(await readFile(path.join(process.cwd(), "public", source.slice(1))));
    return { bytes, type: /\.jpe?g$/i.test(source) ? "image/jpeg" : "image/png" };
  } catch {
    return null;
  }
}

export type PdfCompositionRenderInput = {
  studentName: string;
  courseTitle: string;
  level: string;
  issuedAt: Date;
  certificateCode: string;
  workloadHours?: number;
  studentCpf?: string;
  period?: string;
  coordinatorName?: string;
  institutionName?: string;
  hasTemplateBackground?: boolean;
};

function resolveRenderValues(input: PdfCompositionRenderInput): Record<CertificateFieldKey, string> {
  return {
    studentName: input.studentName,
    courseTitle: input.courseTitle,
    level: input.level,
    issuedAt: input.issuedAt.toLocaleDateString("pt-BR"),
    certificateCode: input.certificateCode,
    workloadHours: `${input.workloadHours || 40} horas`,
    studentCpf: input.studentCpf || "",
    period: input.period || "",
    coordinatorName: input.coordinatorName || "",
    institutionName: input.institutionName || "",
  };
}

function drawTrackedText(
  page: PdfCompositionPage,
  text: string,
  options: { x: number; y: number; size: number; font: PdfCompositionFont; color: ReturnType<typeof rgb>; maxWidth?: number; opacity?: number; rotate?: Rotation; letterSpacing?: number },
) {
  const tracking = options.letterSpacing || 0;
  if (!tracking) {
    page.drawText(text, options);
    return;
  }
  let cursor = options.x;
  for (const character of Array.from(text)) {
    page.drawText(character, { ...options, x: cursor, maxWidth: undefined });
    cursor += options.font.widthOfTextAtSize(character, options.size) + tracking;
  }
}

function drawVariantShell(
  page: PdfCompositionPage,
  regular: PdfCompositionFont,
  bold: PdfCompositionFont,
  composition: CertificateComposition,
  includeBranding: boolean,
  hasTemplateBackground: boolean
) {
  if (hasTemplateBackground) return;

  const variant = getCertificateVisualVariant(composition.visualVariant);
  const paper = parseHexColor(variant.paper, rgb(1, 1, 1));
  const accent = parseHexColor(variant.accent, rgb(0.84, 0.16, 0.16));
  const accentDark = parseHexColor(variant.accentDark, accent);
  const ink = parseHexColor(variant.ink, rgb(0.12, 0.12, 0.12));
  const muted = parseHexColor(variant.muted, rgb(0.42, 0.45, 0.48));
  const border = parseHexColor(variant.border, rgb(0.9, 0.91, 0.92));
  const panel = parseHexColor(variant.panel, rgb(0.97, 0.98, 0.98));

  page.drawRectangle({ x: 0, y: 0, width: 842, height: 595, color: paper });
  if (variant.motif === "double") {
    page.drawRectangle({ x: 0, y: 0, width: 18, height: 595, color: accent });
    page.drawRectangle({ x: 824, y: 0, width: 18, height: 595, color: accent });
    page.drawRectangle({ x: 34, y: 28, width: 774, height: 539, borderColor: border, borderWidth: 1 });
    page.drawRectangle({ x: 48, y: 42, width: 746, height: 511, borderColor: accent, borderWidth: 0.8, opacity: 0.42 });
  } else if (variant.motif === "institutional") {
    page.drawRectangle({ x: 0, y: 0, width: 20, height: 595, color: accent });
    page.drawLine({ start: { x: 52, y: 550 }, end: { x: 790, y: 550 }, thickness: 1.2, color: accent });
    page.drawLine({ start: { x: 52, y: 44 }, end: { x: 790, y: 44 }, thickness: 0.8, color: border });
    page.drawCircle({ x: 752, y: 523, size: 31, borderColor: accent, borderWidth: 1.2 });
    page.drawText("IsF", { x: 738, y: 518, size: 10, font: bold, color: accentDark });
  } else if (variant.motif === "editorial") {
    page.drawRectangle({ x: 0, y: 555, width: 842, height: 40, color: ink });
    page.drawRectangle({ x: 52, y: 535, width: 160, height: 3, color: accent });
    page.drawRectangle({ x: 52, y: 42, width: 62, height: 54, borderColor: accent, borderWidth: 1 });
    page.drawRectangle({ x: 728, y: 42, width: 62, height: 54, borderColor: border, borderWidth: 1 });
  } else if (variant.motif === "laureate") {
    page.drawRectangle({ x: 30, y: 30, width: 782, height: 535, borderColor: border, borderWidth: 1.1 });
    page.drawRectangle({ x: 42, y: 42, width: 758, height: 511, borderColor: accent, borderWidth: 0.8 });
    page.drawLine({ start: { x: 66, y: 530 }, end: { x: 190, y: 530 }, thickness: 1.8, color: accent });
    page.drawLine({ start: { x: 652, y: 530 }, end: { x: 776, y: 530 }, thickness: 1.8, color: accent });
    page.drawCircle({ x: 421, y: 482, size: 24, borderColor: accent, borderWidth: 1.1, color: parseHexColor(variant.accentSoft, panel) });
  } else if (variant.motif === "botanical") {
    page.drawRectangle({ x: 30, y: 30, width: 782, height: 535, borderColor: border, borderWidth: 1 });
    page.drawLine({ start: { x: 62, y: 510 }, end: { x: 150, y: 550 }, thickness: 1.4, color: accent, opacity: 0.55 });
    page.drawLine({ start: { x: 62, y: 85 }, end: { x: 150, y: 45 }, thickness: 1.4, color: accent, opacity: 0.55 });
    page.drawLine({ start: { x: 780, y: 510 }, end: { x: 692, y: 550 }, thickness: 1.4, color: accent, opacity: 0.55 });
    page.drawLine({ start: { x: 780, y: 85 }, end: { x: 692, y: 45 }, thickness: 1.4, color: accent, opacity: 0.55 });
  } else if (variant.motif === "geometric") {
    page.drawRectangle({ x: 30, y: 30, width: 782, height: 535, borderColor: border, borderWidth: 1 });
    page.drawRectangle({ x: 718, y: 410, width: 94, height: 155, color: parseHexColor(variant.accentSoft, panel), opacity: 0.9 });
    page.drawRectangle({ x: 30, y: 30, width: 82, height: 112, color: accent, opacity: 0.12 });
    page.drawLine({ start: { x: 716, y: 455 }, end: { x: 780, y: 519 }, thickness: 1.3, color: accent });
  } else if (variant.motif === "midnight") {
    page.drawRectangle({ x: 30, y: 30, width: 782, height: 535, borderColor: border, borderWidth: 1.1 });
    page.drawRectangle({ x: 42, y: 42, width: 758, height: 511, borderColor: accent, borderWidth: 0.65, opacity: 0.7 });
    page.drawRectangle({ x: 0, y: 555, width: 842, height: 40, color: accent, opacity: 0.12 });
    page.drawCircle({ x: 752, y: 520, size: 22, borderColor: accent, borderWidth: 1 });
  } else {
    page.drawRectangle({ x: 28, y: 28, width: 786, height: 539, borderColor: border, borderWidth: 1 });
    page.drawRectangle({ x: 52, y: 540, width: 150, height: 4, color: accent });
  }

  page.drawRectangle({
    x: 68,
    y: 82,
    width: 706,
    height: 430,
    color: panel,
    opacity: 0.58,
    borderColor: border,
    borderWidth: 0.65,
  });
  page.drawRectangle({ x: 68, y: 510, width: 128, height: 2, color: accent });
  const editorialLabel = "RECONHECIMENTO ACADÊMICO";
  page.drawText(editorialLabel, {
    x: (842 - regular.widthOfTextAtSize(editorialLabel, 6)) / 2,
    y: 498,
    size: 6,
    font: bold,
    color: muted,
  });

  const watermarkSize = variant.watermarkLabel.length > 2 ? 84 : 128;
  const watermarkWidth = bold.widthOfTextAtSize(variant.watermarkLabel, watermarkSize);
  page.drawText(variant.watermarkLabel, {
    x: (842 - watermarkWidth) / 2,
    y: 176,
    size: watermarkSize,
    font: bold,
    color: accent,
    opacity: 0.045,
  });

  page.drawText(variant.headerLabel, {
    x: 52,
    y: variant.motif === "editorial" ? 520 : 520,
    size: 10,
    font: bold,
    color: accentDark,
  });
  page.drawText(variant.shortLabel.toUpperCase(), {
    x: 718,
    y: 520,
    size: 8,
    font: bold,
    color: accentDark,
  });
  page.drawText(includeBranding ? variant.footerLabel : "Documento acadêmico", {
    x: 52,
    y: 24,
    size: 8,
    font: regular,
    color: muted,
  });
}

export async function drawCertificateComposition(
  pdf: PdfCompositionDocument,
  page: PdfCompositionPage,
  regular: PdfCompositionFont,
  bold: PdfCompositionFont,
  rawComposition: CertificateComposition,
  input: PdfCompositionRenderInput,
  includeBranding: boolean,
  fonts?: Partial<PdfCompositionFonts>
) {
  const composition = parseCertificateComposition(rawComposition);
  const values = resolveRenderValues(input);
  const fontSet: PdfCompositionFonts = {
    regular,
    bold,
    serif: fonts?.serif || regular,
    serifBold: fonts?.serifBold || bold,
    mono: fonts?.mono || regular,
    monoBold: fonts?.monoBold || bold,
  };
  drawVariantShell(
    page,
    regular,
    bold,
    composition,
    includeBranding,
    input.hasTemplateBackground ?? false
  );
  const variant = getCertificateVisualVariant(composition.visualVariant);
  const graphite = parseHexColor(variant.ink, rgb(0.14, 0.16, 0.19));
  const fieldEntries = Object.entries(composition.fieldMappings) as [
    CertificateFieldKey,
    NonNullable<CertificateComposition["fieldMappings"][CertificateFieldKey]>
  ][];
  for (const [key, mapping] of fieldEntries) {
    // Em composições institucionais geradas, a assinatura já possui um bloco
    // próprio e fixo no rodapé. Não duplicamos o coordenador sobre esse bloco.
    if (key === "coordinatorName" && !input.hasTemplateBackground) continue;
    const text = resolveCertificateText(`{{${key}}}`, values);
    if (!text) continue;
    const size = mapping.size || 14;
    const font = mapping.fontFamily === "serif"
      ? (mapping.weight === "bold" ? fontSet.serifBold : fontSet.serif)
      : mapping.fontFamily === "mono"
        ? (mapping.weight === "bold" ? fontSet.monoBold : fontSet.mono)
        : (mapping.weight === "bold" ? bold : regular);
    const tracking = mapping.letterSpacing || 0;
    const measuredWidth = font.widthOfTextAtSize(text, size) + Math.max(0, Array.from(text).length - 1) * tracking;
    const baseX = mapping.x;
    const drawX = mapping.align === "center" ? baseX - measuredWidth / 2 : mapping.align === "right" ? baseX - measuredWidth : baseX;
    drawTrackedText(page, text, {
      x: Math.max(0, Math.min(842 - Math.min(measuredWidth, 842), drawX)),
      y: Math.max(0, Math.min(595, mapping.y)),
      size,
      maxWidth: mapping.maxWidth,
      font,
      color: parseHexColor(mapping.color, graphite),
      letterSpacing: tracking,
    });
  }
  const elements = [...composition.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  for (const element of elements) {
    if (element.visible === false || (!includeBranding && element.isSiteBranding)) continue;
    const x = Math.max(0, Math.min(842, element.x));
    const y = Math.max(0, Math.min(595, element.y));
    const color = parseHexColor(element.color, graphite);
    if (element.type === "shape") {
      const width = element.width || 140;
      const height = element.height || 80;
      const fill = parseHexColor(element.fill || element.color, parseHexColor(variant.accentSoft, rgb(0.95, 0.95, 0.95)));
      const stroke = parseHexColor(element.stroke || element.color, parseHexColor(variant.accent, rgb(0.84, 0.16, 0.16)));
      const shapeOptions = {
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        color: fill,
        opacity: element.opacity ?? 1,
        borderColor: stroke,
        borderWidth: element.strokeWidth || 0,
        rotate: degrees((element.rotation || 0) + (element.shape === "diamond" ? 45 : 0)),
      };
      if (element.shape === "circle" || element.shape === "pill") {
        page.drawEllipse({
          x,
          y,
          xScale: width / 2,
          yScale: height / 2,
          color: fill,
          opacity: element.opacity ?? 1,
          borderColor: stroke,
          borderWidth: element.strokeWidth || 0,
          rotate: degrees(element.rotation || 0),
        });
      } else {
        page.drawRectangle(shapeOptions);
      }
      continue;
    }
    if (element.type === "image") {
      const imageData = await readCompositionImage(element.content);
      if (!imageData) continue;
      try {
        const image = imageData.type === "image/jpeg" ? await pdf.embedJpg(imageData.bytes) : await pdf.embedPng(imageData.bytes);
        page.drawImage(image, {
          x: x - (element.width || 120) / 2,
          y: y - (element.height || 80) / 2,
          width: element.width || 120,
          height: element.height || 80,
          opacity: element.opacity ?? 1,
        });
      } catch {
        // Um asset incompatível não deve invalidar o certificado inteiro.
      }
      continue;
    }
    if (element.type === "line") {
      page.drawLine({
        start: { x: Math.max(0, x - (element.width || 140) / 2), y },
        end: { x: Math.min(842, x + (element.width || 140) / 2), y },
        thickness: Math.max(1, (element.size || 2) / 2),
        color,
        opacity: element.opacity ?? 1,
      });
      continue;
    }
    const text = resolveCertificateText(element.content, values);
    if (!text) continue;
    const size = element.size || 14;
    const font = element.fontFamily === "serif"
      ? (element.weight === "bold" || element.type === "badge" ? fontSet.serifBold : fontSet.serif)
      : element.fontFamily === "mono"
        ? (element.weight === "bold" || element.type === "badge" ? fontSet.monoBold : fontSet.mono)
        : (element.weight === "bold" || element.type === "badge" ? bold : regular);
    const tracking = element.letterSpacing || 0;
    const measuredWidth = font.widthOfTextAtSize(text, size) + Math.max(0, Array.from(text).length - 1) * tracking;
    const drawX = element.align === "center" ? x - measuredWidth / 2 : element.align === "right" ? x - measuredWidth : x;
    drawTrackedText(page, text, {
      x: Math.max(0, Math.min(842 - Math.min(measuredWidth, 842), drawX)),
      y,
      size,
      maxWidth: element.width || undefined,
      font,
      color,
      opacity: element.opacity ?? 1,
      rotate: degrees(element.rotation || 0),
      letterSpacing: tracking,
    });
  }
}
