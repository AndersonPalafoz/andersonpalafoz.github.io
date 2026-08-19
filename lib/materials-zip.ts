import { zipSync } from "fflate";

export const MAX_ZIP_ENTRIES = 50;
export const MAX_ZIP_INPUT_BYTES = 40 * 1024 * 1024;

export type ZipMaterialEntry = {
  name: string;
  data: Uint8Array;
};

function normalizeName(name: string, fallbackIndex: number) {
  const extensionMatch = name.trim().match(/(\.[a-z0-9]{1,10})$/i);
  const extension = extensionMatch?.[1] ?? "";
  const base = name
    .trim()
    .replace(/\.[a-z0-9]{1,10}$/i, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 120);

  return `${base || `material-${fallbackIndex + 1}`}${extension.toLowerCase()}`;
}

function uniqueName(candidate: string, used: Set<string>) {
  if (!used.has(candidate)) return candidate;
  const extensionIndex = candidate.lastIndexOf(".");
  const base = extensionIndex > 0 ? candidate.slice(0, extensionIndex) : candidate;
  const extension = extensionIndex > 0 ? candidate.slice(extensionIndex) : "";
  let suffix = 2;
  let result = `${base}-${suffix}${extension}`;
  while (used.has(result)) {
    suffix += 1;
    result = `${base}-${suffix}${extension}`;
  }
  return result;
}

export function createMaterialsZip(entries: ZipMaterialEntry[]) {
  if (entries.length === 0) throw new Error("Selecione pelo menos um material.");
  if (entries.length > MAX_ZIP_ENTRIES) {
    throw new Error(`Selecione no máximo ${MAX_ZIP_ENTRIES} materiais por arquivo ZIP.`);
  }

  const files: Record<string, Uint8Array> = {};
  const usedNames = new Set<string>();
  let totalBytes = 0;

  entries.forEach((entry, index) => {
    if (!(entry.data instanceof Uint8Array) || entry.data.byteLength === 0) {
      throw new Error("Um dos materiais selecionados está vazio ou indisponível.");
    }

    totalBytes += entry.data.byteLength;
    if (totalBytes > MAX_ZIP_INPUT_BYTES) {
      throw new Error("O conjunto selecionado excede o limite seguro de 40 MB.");
    }

    const safeName = uniqueName(normalizeName(entry.name, index), usedNames);
    usedNames.add(safeName);
    files[safeName] = entry.data;
  });

  return zipSync(files, { level: 6 });
}
