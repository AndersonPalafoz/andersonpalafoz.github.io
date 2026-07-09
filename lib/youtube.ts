/**
 * YouTube Helper Functions
 * Utilities for working with YouTube videos and IDs
 */

/**
 * Extract YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - dQw4w9WgXcQ (raw ID)
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  // If it's already just an ID (11 characters, alphanumeric with - and _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  // Try to match youtube.com/watch?v=ID
  const match1 = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/.*[?&]v=)([a-zA-Z0-9_-]{11})/);
  if (match1) return match1[1];

  // Try to match youtu.be/ID
  const match2 = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (match2) return match2[1];

  // Try to match youtube.com/embed/ID
  const match3 = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (match3) return match3[1];

  // Try to match youtube.com/v/ID
  const match4 = url.match(/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/);
  if (match4) return match4[1];

  return null;
}

/**
 * Generate YouTube embed URL from video ID
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Generate YouTube thumbnail URL from video ID
 * Sizes: default, medium, high, standard, maxres
 */
export function getYouTubeThumbnail(videoId: string, size: "default" | "medium" | "high" | "standard" | "maxres" = "high"): string {
  const sizeMap = {
    default: "default",
    medium: "mqdefault",
    high: "hqdefault",
    standard: "sddefault",
    maxres: "maxresdefault",
  };
  return `https://img.youtube.com/vi/${videoId}/${sizeMap[size]}.jpg`;
}

/**
 * Validate if a string is a valid YouTube URL or ID
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}

/**
 * Format YouTube URL to standard embed format
 */
export function normalizeYouTubeUrl(url: string): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return getYouTubeEmbedUrl(id);
}
