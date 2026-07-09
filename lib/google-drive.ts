/**
 * Google Drive Helper Functions
 * Utilities for working with Google Drive API
 */

/**
 * Extract file ID from Google Drive/Docs/Sheets/Slides URL
 * Supports:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 * - https://docs.google.com/document/d/FILE_ID/edit
 * - https://docs.google.com/spreadsheets/d/FILE_ID/edit
 * - https://docs.google.com/presentation/d/FILE_ID/edit
 * - FILE_ID (raw ID)
 */
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url) return null;

  // If it's already just an ID (long alphanumeric string)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url)) {
    return url;
  }

  // Try to match /d/FILE_ID/ pattern (works for drive, docs, sheets, slides)
  const match1 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match1) return match1[1];

  // Try to match ?id=FILE_ID
  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) return match2[1];

  return null;
}

/**
 * Generate Google Drive preview URL from file ID
 */
export function getGoogleDrivePreviewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Generate Google Drive export URL for PDF
 */
export function getGoogleDriveExportUrl(fileId: string, format: "pdf" | "docx" | "xlsx" | "pptx" = "pdf"): string {
  const mimeTypes = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };
  return `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(mimeTypes[format])}`;
}

/**
 * Validate if a string is a valid Google Drive URL or ID
 */
export function isValidGoogleDriveUrl(url: string): boolean {
  return extractGoogleDriveFileId(url) !== null;
}

/**
 * Generate Google Drive embed URL (for iframes)
 */
export function getGoogleDriveEmbedUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Get file type from Google Drive URL or ID
 * Returns: 'document', 'spreadsheet', 'presentation', 'pdf', 'image', 'video', 'audio', 'unknown'
 */
export function getGoogleDriveFileType(url: string): string {
  const fileId = extractGoogleDriveFileId(url);
  if (!fileId) return "unknown";

  // This would require API call to get actual file type
  // For now, we can infer from URL patterns or file extensions
  if (url.includes("spreadsheet")) return "spreadsheet";
  if (url.includes("presentation")) return "presentation";
  if (url.includes("document")) return "document";
  if (url.includes(".pdf")) return "pdf";
  if (url.match(/\.(jpg|jpeg|png|gif|webp)/i)) return "image";
  if (url.match(/\.(mp4|avi|mov|mkv)/i)) return "video";
  if (url.match(/\.(mp3|wav|aac|flac)/i)) return "audio";

  return "unknown";
}

/**
 * Format Google Drive URL to standard preview format
 */
export function normalizeGoogleDriveUrl(url: string): string | null {
  const id = extractGoogleDriveFileId(url);
  if (!id) return null;
  return getGoogleDrivePreviewUrl(id);
}

// API-dependent functions are available in a future phase
// when Google Drive API authentication is fully configured
