import { extractGoogleDriveFileId } from "@/lib/google-drive";

const ALLOWED_ACCEPT = "application/pdf,image/*,audio/*,video/*,application/octet-stream";

export function getMaterialDownloadUrl(fileUrl: string) {
  const driveFileId = extractGoogleDriveFileId(fileUrl);
  if (driveFileId && fileUrl.includes("drive.google.com")) {
    return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(driveFileId)}`;
  }
  return fileUrl;
}

export function isAllowedMaterialRemoteUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:") return false;
    const hostname = url.hostname.toLowerCase();
    if (["localhost", "127.0.0.1", "::1"].includes(hostname)) return false;
    if (hostname === "drive.google.com" || hostname === "docs.google.com" || hostname === "storage.googleapis.com") return true;
    if (hostname.endsWith(".googleusercontent.com") || hostname.endsWith(".storage.googleapis.com")) return true;
    const configuredHost = process.env.GOOGLE_STORAGE_HOST?.toLowerCase();
    return Boolean(configuredHost && hostname === configuredHost);
  } catch {
    return false;
  }
}

function parseContentRange(value: string | null) {
  const match = value?.match(/^bytes\s+\d+-\d+\/(\d+)$/i);
  const total = match?.[1] ? Number(match[1]) : 0;
  return Number.isSafeInteger(total) && total > 0 ? total : null;
}

export async function estimateMaterialSize(fileUrl: string): Promise<number | null> {
  if (!isAllowedMaterialRemoteUrl(fileUrl)) return null;
  const url = getMaterialDownloadUrl(fileUrl);
  const init = { redirect: "follow" as RequestRedirect, signal: AbortSignal.timeout(10_000) };

  const head = await fetch(url, { ...init, method: "HEAD", headers: { Accept: ALLOWED_ACCEPT } });
  const headLength = Number(head.headers.get("content-length") || 0);
  if (head.ok && Number.isSafeInteger(headLength) && headLength > 0) return headLength;

  const ranged = await fetch(url, {
    ...init,
    headers: { Accept: ALLOWED_ACCEPT, Range: "bytes=0-0" },
  });
  if (!ranged.ok && ranged.status !== 206) return null;
  return parseContentRange(ranged.headers.get("content-range")) || Number(ranged.headers.get("content-length") || 0) || null;
}

export async function fetchMaterialBytes(fileUrl: string, maxBytes: number) {
  if (!isAllowedMaterialRemoteUrl(fileUrl)) throw new Error("A origem deste material não é autorizada para exportação.");

  const response = await fetch(getMaterialDownloadUrl(fileUrl), {
    headers: { Accept: ALLOWED_ACCEPT },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`O arquivo respondeu com HTTP ${response.status}.`);

  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > maxBytes) throw new Error(`Um dos materiais excede o limite de ${Math.round(maxBytes / 1024 / 1024)} MB.`);
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/html")) throw new Error("O link do material não retornou o arquivo original.");

  const buffer = new Uint8Array(await response.arrayBuffer());
  if (buffer.byteLength === 0) throw new Error("Um dos materiais retornou um arquivo vazio.");
  if (buffer.byteLength > maxBytes) throw new Error(`Um dos materiais excede o limite de ${Math.round(maxBytes / 1024 / 1024)} MB.`);
  return buffer;
}
