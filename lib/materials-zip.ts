import { zipSync } from "fflate";

export const MAX_ZIP_ENTRIES = 50;
export const MAX_ZIP_SOURCE_BYTES = 40 * 1024 * 1024;
export const MAX_ZIP_OUTPUT_BYTES = 40 * 1024 * 1024;

export interface MaterialZipEntry {
  name: string;
  data: Uint8Array;
}

export interface MaterialsZipResult {
  fileName: string;
  mimeType: "application/zip";
  data: Uint8Array;
  sourceBytes: number;
  entryCount: number;
}

function normalizeFileName(value: string, fallback: string) {
  const baseName = value.trim().replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").replace(/\s+/g, " ").slice(0, 160);
  return baseName || fallback;
}

function uniqueFileName(name: string, usedNames: Set<string>) {
  if (!usedNames.has(name)) {
    usedNames.add(name);
    return name;
  }

  const dotIndex = name.lastIndexOf(".");
  const stem = dotIndex > 0 ? name.slice(0, dotIndex) : name;
  const extension = dotIndex > 0 ? name.slice(dotIndex) : "";
  let suffix = 2;
  let candidate = `${stem} (${suffix})${extension}`;
  while (usedNames.has(candidate)) {
    suffix += 1;
    candidate = `${stem} (${suffix})${extension}`;
  }
  usedNames.add(candidate);
  return candidate;
}

function assertEntryData(data: Uint8Array, index: number) {
  if (!(data instanceof Uint8Array)) {
    throw new Error(`O material ${index + 1} não possui dados binários válidos.`);
  }
  if (data.byteLength === 0) {
    throw new Error(`O material ${index + 1} está vazio e não pode ser exportado.`);
  }
}

export function createMaterialsZip(
  entries: MaterialZipEntry[],
  archiveName = "materiais-anderson-palafoz",
): MaterialsZipResult {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error("Selecione pelo menos um material para compactar.");
  }
  if (entries.length > MAX_ZIP_ENTRIES) {
    throw new Error(`A compactação aceita no máximo ${MAX_ZIP_ENTRIES} materiais por arquivo ZIP.`);
  }

  const usedNames = new Set<string>();
  const files: Record<string, Uint8Array> = {};
  let sourceBytes = 0;

  entries.forEach((entry, index) => {
    assertEntryData(entry.data, index);
    sourceBytes += entry.data.byteLength;
    if (sourceBytes > MAX_ZIP_SOURCE_BYTES) {
      throw new Error("O tamanho total dos materiais excede o limite seguro de 40 MB para uma compactação.");
    }

    const safeName = normalizeFileName(entry.name, `material-${index + 1}`);
    const uniqueName = uniqueFileName(safeName, usedNames);
    files[uniqueName] = entry.data;
  });

  const data = zipSync(files, { level: 6 });
  if (data.byteLength > MAX_ZIP_OUTPUT_BYTES) {
    throw new Error("O arquivo ZIP excede o limite seguro de 40 MB para envio ao Google Drive.");
  }

  const safeArchiveName = normalizeFileName(archiveName, "materiais-anderson-palafoz").replace(/\.zip$/i, "");
  return {
    fileName: `${safeArchiveName}.zip`,
    mimeType: "application/zip",
    data,
    sourceBytes,
    entryCount: entries.length,
  };
}
