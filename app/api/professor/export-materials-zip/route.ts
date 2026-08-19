import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getTeacherMaterials } from "@/lib/teacher";
import { extractGoogleDriveFileId } from "@/lib/google-drive";
import { createMaterialsZip, MAX_ZIP_ENTRIES, MAX_ZIP_INPUT_BYTES } from "@/lib/materials-zip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_DOWNLOAD_BYTES = MAX_ZIP_INPUT_BYTES;

function getDownloadUrl(fileUrl: string) {
  const driveFileId = extractGoogleDriveFileId(fileUrl);
  if (driveFileId && fileUrl.includes("drive.google.com")) {
    return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(driveFileId)}`;
  }
  return fileUrl;
}

function isAllowedRemoteUrl(rawUrl: string) {
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

async function fetchMaterialBytes(fileUrl: string) {
  if (!isAllowedRemoteUrl(fileUrl)) throw new Error("A origem deste material não é autorizada para exportação.");

  const response = await fetch(getDownloadUrl(fileUrl), {
    headers: { Accept: "application/pdf,image/*,audio/*,video/*,application/octet-stream" },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`O arquivo respondeu com HTTP ${response.status}.`);

  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MAX_DOWNLOAD_BYTES) throw new Error("Um dos materiais excede o limite de 40 MB.");
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/html")) throw new Error("O link do material não retornou o arquivo original.");

  const buffer = new Uint8Array(await response.arrayBuffer());
  if (buffer.byteLength === 0) throw new Error("Um dos materiais retornou um arquivo vazio.");
  return buffer;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!session?.user || (role !== "professor" && role !== "admin")) {
    return NextResponse.json({ error: "Acesso restrito a professores e administradores." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const rawIds = body?.materialIds;
    if (!Array.isArray(rawIds) || rawIds.length === 0 || rawIds.length > MAX_ZIP_ENTRIES) {
      return NextResponse.json({ error: `Selecione entre 1 e ${MAX_ZIP_ENTRIES} materiais.` }, { status: 400 });
    }

    const materialIds = [...new Set(rawIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))];
    if (materialIds.length !== rawIds.length) {
      return NextResponse.json({ error: "A seleção contém identificadores inválidos ou duplicados." }, { status: 400 });
    }

    const authorizedMaterials = await getTeacherMaterials(session.user.email ?? undefined);
    const byId = new Map(authorizedMaterials.map((material) => [material.id, material]));
    const selectedMaterials = materialIds.map((id) => byId.get(id));
    if (selectedMaterials.some((material) => !material)) {
      return NextResponse.json({ error: "Um ou mais materiais não pertencem ao escopo autorizado deste professor." }, { status: 403 });
    }

    const entries = [];
    let totalBytes = 0;
    for (const material of selectedMaterials) {
      if (!material?.fileUrl) {
        return NextResponse.json({ error: `O material “${material?.title ?? "sem título"}” não possui arquivo disponível.` }, { status: 422 });
      }
      const data = await fetchMaterialBytes(material.fileUrl);
      totalBytes += data.byteLength;
      if (totalBytes > MAX_DOWNLOAD_BYTES) {
        return NextResponse.json({ error: "A seleção excede o limite seguro de 40 MB." }, { status: 413 });
      }
      entries.push({ name: material.title, data });
    }

    const zip = createMaterialsZip(entries);
    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(Buffer.from(zip), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="materiais-anderson-palafoz-${date}.zip"`,
        "Content-Length": String(zip.byteLength),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Teacher materials ZIP export failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível gerar o ZIP." }, { status: 500 });
  }
}
