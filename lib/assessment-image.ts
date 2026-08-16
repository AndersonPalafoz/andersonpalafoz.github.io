export const assessmentImageExtensions: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export function validateAssessmentImage(type: string, size: number) {
  if (!assessmentImageExtensions[type]) return "Use uma imagem JPG, PNG, WEBP ou GIF.";
  if (size > 5 * 1024 * 1024) return "A imagem deve ter no máximo 5 MB.";
  return null;
}

export function buildAssessmentImageHtml(url: string, width: "30%" | "50%" | "80%" | "100%") {
  const safeUrl = url.replace(/"/g, "&quot;");
  return `<img src="${safeUrl}" style="width: ${width}; max-width: 100%; height: auto; border-radius: 12px; margin: 12px 0;" alt="Imagem da questão" />`;
}
