import { readFile } from "node:fs/promises";
import path from "node:path";
import { rgb, type PDFDocument, type PDFPage, type PDFFont } from "pdf-lib";
import {
  type CertificateComposition,
  parseCertificateComposition,
  resolveCertificateText,
  type CertificateFieldKey,
} from "@/lib/certificate-composition";

export type PdfCompositionDocument = PDFDocument;
export type PdfCompositionPage = PDFPage;
export type PdfCompositionFont = PDFFont;

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
  if (!source.startsWith("/") || source.includes("..")) return null;
  try {
    const bytes = new Uint8Array(await readFile(path.join(process.cwd(), "public", source.slice(1))));
    return { bytes, type: /\\.jpe?g$/i.test(source) ? "image/jpeg" : "image/png" };
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

export async function drawCertificateComposition(
  pdf: PdfCompositionDocument,
  page: PdfCompositionPage,
  regular: PdfCompositionFont,
  bold: PdfCompositionFont,
  rawComposition: CertificateComposition,
  input: PdfCompositionRenderInput,
  includeBranding: boolean
) {
  const composition = parseCertificateComposition(rawComposition);
  const values = resolveRenderValues(input);
  const graphite = parseHexColor("#242a30", rgb(0.14, 0.16, 0.19));
  const fieldEntries = Object.entries(composition.fieldMappings) as [
    CertificateFieldKey,
    NonNullable<CertificateComposition["fieldMappings"][CertificateFieldKey]>
  ][];
  for (const [key, mapping] of fieldEntries) {
    const text = resolveCertificateText(`{{${key}}}`, values);
    if (!text) continue;
    const size = mapping.size || 14;
    const font = mapping.weight === "bold" ? bold : regular;
    const measuredWidth = font.widthOfTextAtSize(text, size);
    const baseX = mapping.x;
    const drawX = mapping.align === "center" ? baseX - measuredWidth / 2 : mapping.align === "right" ? baseX - measuredWidth : baseX;
    page.drawText(text, {
      x: Math.max(0, Math.min(842 - Math.min(measuredWidth, 842), drawX)),
      y: Math.max(0, Math.min(595, mapping.y)),
      size,
      maxWidth: mapping.maxWidth,
      font,
      color: parseHexColor(mapping.color, graphite),
    });
  }
  const elements = [...composition.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  for (const element of elements) {
    if (element.visible === false || (!includeBranding && element.isSiteBranding)) continue;
    const x = Math.max(0, Math.min(842, element.x));
    const y = Math.max(0, Math.min(595, element.y));
    const color = parseHexColor(element.color, graphite);
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
    const font = element.weight === "bold" || element.type === "badge" ? bold : regular;
    const measuredWidth = font.widthOfTextAtSize(text, size);
    const drawX = element.align === "center" ? x - measuredWidth / 2 : element.align === "right" ? x - measuredWidth : x;
    page.drawText(text, {
      x: Math.max(0, Math.min(842 - Math.min(measuredWidth, 842), drawX)),
      y,
      size,
      maxWidth: element.width || undefined,
      font,
      color,
      opacity: element.opacity ?? 1,
    });
  }
}
