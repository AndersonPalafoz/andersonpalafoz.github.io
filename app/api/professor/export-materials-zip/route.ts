import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { and, eq, inArray } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { courses, materials, users } from "@/drizzle/schema";
import { createMaterialsZip, MAX_ZIP_ENTRIES, MAX_ZIP_SOURCE_BYTES } from "@/lib/materials-zip";
import { extractGoogleDriveFileId } from "@/lib/google-drive";
import { downloadFromGoogleDriveStorage } from "@/lib/google-drive-upload";
import {
  downloadTeacherGoogleDriveFile,
  TeacherGoogleDriveError,
  uploadToTeacherGoogleDrive,
} from "@/lib/google-drive-teacher";

const MAX_URL_BYTES = MAX_ZIP_SOURCE_BYTES;

function safeArchiveName(value: unknown) {
  const normalized = String(value || "materiais-anderson-palafoz")
    .trim()
    .replace(/[^\p{L}\p{N}._ -]/gu, "-")
    .replace(/\s+/g, " ")
    .slice(0, 100)
    .replace(/\.zip$/i, "");
  return normalized || "materiais-anderson-palafoz";
}

function exportKeyFor(materialRows: Array<{ id: number; updatedAt: Date }>, ownerEmail: string) {
  const canonical = materialRows
    .sort((a, b) => a.id - b.id)
    .map((row) => `${row.id}:${new Date(row.updatedAt).toISOString()}`)
    .join("|");
  return createHash("sha256").update(`${ownerEmail.toLowerCase()}|${canonical}|zip-v1`).digest("hex");
}

async function fetchExternalMaterial(urlValue: string) {
  let url: URL;
  try {
    url = new URL(urlValue);
  } catch {
    throw new Error("O material possui uma URL inválida e não pode ser exportado.");
  }
  if (url.protocol !== "https:") {
    throw new Error("A exportação aceita somente arquivos servidos por HTTPS.");
  }
  if (["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(url.hostname.toLowerCase())) {
    throw new Error("A URL do material não é válida para exportação segura.");
  }

  const response = await fetch(url, { cache: "no-store", redirect: "error" });
  if (!response.ok) {
    throw new Error(`Não foi possível baixar o material (HTTP ${response.status}).`);
  }
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MAX_URL_BYTES) {
    throw new Error("O material excede o limite seguro de 40 MB para uma compactação.");
  }
  const data = new Uint8Array(await response.arrayBuffer());
  if (data.byteLength > MAX_URL_BYTES) {
    throw new Error("O material excede o limite seguro de 40 MB para uma compactação.");
  }
  return {
    data,
    mimeType: response.headers.get("content-type")?.split(";", 1)[0] || "application/octet-stream",
  };
}

async function getMaterialBytes(request: NextRequest, fileUrl: string) {
  const driveFileId = extractGoogleDriveFileId(fileUrl);
  if (driveFileId) {
    try {
      const file = await downloadTeacherGoogleDriveFile(request, driveFileId);
      return { data: file.data, mimeType: file.mimeType };
    } catch (teacherError) {
      try {
        const file = await downloadFromGoogleDriveStorage(driveFileId);
        return { data: file.data, mimeType: file.mimeType };
      } catch (storageError) {
        if (teacherError instanceof TeacherGoogleDriveError && ["NOT_CONNECTED", "INSUFFICIENT_SCOPE"].includes(teacherError.code)) {
          throw storageError;
        }
        throw teacherError;
      }
    }
  }
  return fetchExternalMaterial(fileUrl);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.trim().toLowerCase();
    const role = session?.user?.role;
    if (!email || (role !== "professor" && role !== "admin")) {
      return NextResponse.json({ error: "Apenas professores e administradores podem exportar materiais." }, { status: 403 });
    }

    const body = await request.json().catch(() => ({})) as { materialIds?: unknown; archiveName?: unknown };
    const materialIds = Array.isArray(body.materialIds)
      ? Array.from(new Set(body.materialIds.map(Number).filter((id) => Number.isInteger(id) && id > 0)))
      : [];
    if (materialIds.length === 0) {
      return NextResponse.json({ error: "Selecione pelo menos um material para compactar." }, { status: 400 });
    }
    if (materialIds.length > MAX_ZIP_ENTRIES) {
      return NextResponse.json({ error: `Selecione no máximo ${MAX_ZIP_ENTRIES} materiais por arquivo ZIP.` }, { status: 400 });
    }

    const currentUser = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!currentUser || currentUser.deletedAt) {
      return NextResponse.json({ error: "A conta do professor não está disponível." }, { status: 403 });
    }

    const rows = await db
      .select({
        id: materials.id,
        title: materials.title,
        fileUrl: materials.fileUrl,
        updatedAt: materials.updatedAt,
        courseId: materials.courseId,
        courseInstructor: courses.instructor,
      })
      .from(materials)
      .leftJoin(courses, eq(materials.courseId, courses.id))
      .where(inArray(materials.id, materialIds));

    if (rows.length !== materialIds.length) {
      return NextResponse.json({ error: "Um ou mais materiais não foram encontrados." }, { status: 404 });
    }

    const isOwner = role === "admin"
      ? () => true
      : (row: typeof rows[number]) => Boolean(row.courseId && row.courseInstructor && row.courseInstructor === currentUser.name);
    const unauthorized = rows.filter((row) => !isOwner(row));
    if (unauthorized.length > 0) {
      return NextResponse.json({ error: "Você só pode exportar materiais vinculados aos seus próprios cursos." }, { status: 403 });
    }

    const rowsWithoutFiles = rows.filter((row) => !row.fileUrl);
    if (rowsWithoutFiles.length > 0) {
      return NextResponse.json({ error: `O material “${rowsWithoutFiles[0].title}” não possui arquivo disponível para exportação.` }, { status: 422 });
    }

    const entries = [];
    let sourceBytes = 0;
    for (const row of rows) {
      const file = await getMaterialBytes(request, row.fileUrl as string);
      sourceBytes += file.data.byteLength;
      if (sourceBytes > MAX_ZIP_SOURCE_BYTES) {
        return NextResponse.json({ error: "O tamanho total dos materiais excede o limite seguro de 40 MB." }, { status: 413 });
      }
      entries.push({
        name: row.title || `material-${row.id}`,
        data: file.data,
      });
    }

    const archiveName = safeArchiveName(body.archiveName);
    const archive = createMaterialsZip(entries, archiveName);
    const exportKey = exportKeyFor(rows.map((row) => ({ id: row.id, updatedAt: row.updatedAt })), email);
    const uploaded = await uploadToTeacherGoogleDrive({
      request,
      ownerEmail: email,
      fileName: archive.fileName,
      mimeType: archive.mimeType,
      data: archive.data,
      exportKey,
    });

    return NextResponse.json({
      success: true,
      fileId: uploaded.fileId,
      fileName: uploaded.fileName,
      webViewLink: uploaded.webViewLink,
      entryCount: archive.entryCount,
      sourceBytes: archive.sourceBytes,
      zipBytes: archive.data.byteLength,
      reused: uploaded.reused,
      ownerEmail: uploaded.ownerEmail,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof TeacherGoogleDriveError) {
      const status = error.code === "NOT_CONNECTED" ? 401 : error.code === "INSUFFICIENT_SCOPE" ? 403 : 502;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }
    console.error("Erro ao compactar materiais para exportação:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível compactar os materiais." }, { status: 500 });
  }
}
