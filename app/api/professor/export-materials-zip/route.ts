import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getTeacherMaterials } from "@/lib/teacher";
import { createMaterialsZip, MAX_ZIP_ENTRIES, MAX_ZIP_INPUT_BYTES } from "@/lib/materials-zip";
import { fetchMaterialBytes } from "@/lib/material-download";
import { db } from "@/lib/db";
import { teacherZipExports, users } from "@/drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_DOWNLOAD_BYTES = MAX_ZIP_INPUT_BYTES;

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
      const data = await fetchMaterialBytes(material.fileUrl, MAX_DOWNLOAD_BYTES);
      totalBytes += data.byteLength;
      if (totalBytes > MAX_DOWNLOAD_BYTES) {
        return NextResponse.json({ error: "A seleção excede o limite seguro de 40 MB." }, { status: 413 });
      }
      entries.push({ name: material.title, data });
    }

    const zip = createMaterialsZip(entries);
    const date = new Date().toISOString().slice(0, 10);
    const filename = `materiais-anderson-palafoz-${date}.zip`;

    // Persistir histórico real da exportação para o professor autenticado
    try {
      const dbUser = await db.query.users.findFirst({
        where: and(eq(users.email, session.user.email ?? ""), isNull(users.deletedAt)),
      });
      if (dbUser) {
        await db.insert(teacherZipExports).values({
          userId: dbUser.id,
          filename,
          materialCount: entries.length,
          totalBytes,
          createdAt: new Date(),
        });
      }
    } catch (historyErr) {
      console.error("Failed to record teacher ZIP export history:", historyErr);
    }

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
