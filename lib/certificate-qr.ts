import QRCode from "qrcode";

export const CERTIFICATE_PUBLIC_BASE_URL = "https://andersonpalafoz.vercel.app/verificar";

export function getCertificateVerificationUrl(code: string, origin?: string) {
  const normalizedCode = encodeURIComponent(code.trim());
  const base = origin?.replace(/\/$/, "") || CERTIFICATE_PUBLIC_BASE_URL;
  return `${base}/${normalizedCode}`;
}

export async function generateCertificateQrDataUrl(
  code: string,
  options?: { margin?: number; width?: number },
) {
  return QRCode.toDataURL(getCertificateVerificationUrl(code), {
    errorCorrectionLevel: "M",
    margin: options?.margin ?? 1,
    width: options?.width ?? 180,
    color: { dark: "#111827", light: "#ffffff" },
  });
}

export function isCertificateCode(value: unknown): value is string {
  return typeof value === "string" && /^AP-CERT-[A-Za-z0-9-]+$/.test(value.trim());
}
