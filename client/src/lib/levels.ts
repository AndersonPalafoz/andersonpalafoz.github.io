export function formatLevel(level: string | null | undefined): string {
  if (!level) return "Básico [A1-A2]";
  const upper = level.trim().toUpperCase();
  if (upper.includes("A1") || upper.includes("A2") || upper.includes("BÁSICO") || upper.includes("BASICO")) {
    return "Básico [A1-A2]";
  }
  if (upper.includes("B1") || upper.includes("B2") || upper.includes("INTERMEDIÁRIO") || upper.includes("INTERMEDIARIO")) {
    return "Intermediário [B1-B2]";
  }
  if (upper.includes("C1") || upper.includes("C2") || upper.includes("AVANÇADO") || upper.includes("AVANCADO")) {
    return "Avançado [C1-C2]";
  }
  return `Geral [${level}]`;
}
