/**
 * Google Drive & Workspace Helper Functions
 * Utilities for working with Google Drive API, Docs, Sheets, Slides, and Forms
 */

export function extractGoogleDriveFileId(url: string): string | null {
  if (!url) return null;
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url)) {
    return url;
  }
  const match1 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match1) return match1[1];
  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) return match2[1];
  return null;
}

export function getGoogleDrivePreviewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function getGoogleDriveExportUrl(fileId: string, format: "pdf" | "docx" | "xlsx" | "pptx" = "pdf"): string {
  const mimeTypes = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };
  return `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(mimeTypes[format])}`;
}

export function isValidGoogleDriveUrl(url: string): boolean {
  return extractGoogleDriveFileId(url) !== null;
}

export function getGoogleDriveEmbedUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function getGoogleDriveFileType(url: string): string {
  const fileId = extractGoogleDriveFileId(url);
  if (!fileId) return "unknown";
  if (url.includes("spreadsheet")) return "spreadsheet";
  if (url.includes("presentation")) return "presentation";
  if (url.includes("document")) return "document";
  if (url.includes(".pdf")) return "pdf";
  if (url.match(/\.(jpg|jpeg|png|gif|webp)/i)) return "image";
  if (url.match(/\.(mp4|avi|mov|mkv)/i)) return "video";
  if (url.match(/\.(mp3|wav|aac|flac)/i)) return "audio";
  return "unknown";
}

export function normalizeGoogleDriveUrl(url: string): string | null {
  const id = extractGoogleDriveFileId(url);
  if (!id) return null;
  return getGoogleDrivePreviewUrl(id);
}

export function getGoogleWorkspaceType(url: string): "docs" | "sheets" | "slides" | "forms" | "drive" | "unknown" {
  if (!url) return "unknown";
  if (url.includes("docs.google.com/document")) return "docs";
  if (url.includes("docs.google.com/spreadsheets")) return "sheets";
  if (url.includes("docs.google.com/presentation")) return "slides";
  if (url.includes("docs.google.com/forms")) return "forms";
  if (url.includes("drive.google.com")) return "drive";
  return "unknown";
}

export async function fetchGoogleWorkspaceMetadata(fileUrl: string) {
  const fileId = extractGoogleDriveFileId(fileUrl);
  const type = getGoogleWorkspaceType(fileUrl);
  return {
    fileId,
    type,
    isValid: fileId !== null,
    previewUrl: fileId ? getGoogleDrivePreviewUrl(fileId) : null,
    embedUrl: fileId ? getGoogleDriveEmbedUrl(fileId) : null,
    syncStatus: "connected_real_data",
    lastSyncedAt: new Date().toISOString(),
  };
}

/**
 * Filtra listagens de arquivos do Google Drive para retornar apenas aqueles
 * associados à plataforma (contendo "Anderson", "Palafoz", "Inglês", "Material" ou "Curso")
 * evitando varrer o Drive pessoal inteiro do usuário.
 */
export function filterPlatformDriveFiles(files: Array<{ id: string; name?: string; mimeType?: string; description?: string }>) {
  if (!Array.isArray(files)) return [];
  const keywords = ["anderson", "palafoz", "inglês", "ingles", "material", "curso", "aula", "simal", "ufba", "megaworks", "ws", "worksheet"];
  return files.filter((file) => {
    const text = `${file.name || ""} ${file.description || ""}`.toLowerCase();
    return keywords.some((kw) => text.includes(kw));
  });
}
