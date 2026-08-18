import { NextRequest, NextResponse } from "next/server";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { mediaAssets, users } from "@/drizzle/schema";
import { requireAdmin, requireTeacherOrAdmin } from "@/lib/admin-auth";
import { uploadEducationalImage, MEDIA_IMAGE_BUCKET } from "@/lib/media-image";
import { createClient } from "@supabase/supabase-js";
import { getMediaPaginationMeta, parseMediaListQuery } from "@/lib/media-pagination";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase Storage não está configurado.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireTeacherOrAdmin();
    if (!session) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const query = parseMediaListQuery(new URL(request.url).searchParams);
    const filters = [];
    if (query.search) {
      filters.push(or(ilike(mediaAssets.name, `%${query.search}%`), ilike(mediaAssets.tag, `%${query.search}%`)));
    }
    if (query.type && query.type !== "all") {
      filters.push(eq(mediaAssets.type, query.type));
    }
    if (query.tag && query.tag !== "all") {
      filters.push(eq(mediaAssets.tag, query.tag));
    }

    const where = filters.length > 0 ? and(...filters) : undefined;
    const [totalResult, assets] = await Promise.all([
      db.select({ total: count() }).from(mediaAssets).where(where),
      db.select({
        id: mediaAssets.id,
        name: mediaAssets.name,
        type: mediaAssets.type,
        url: mediaAssets.url,
        fileKey: mediaAssets.fileKey,
        size: mediaAssets.size,
        tag: mediaAssets.tag,
        uploaderId: mediaAssets.uploaderId,
        uploadedAt: mediaAssets.createdAt,
      })
        .from(mediaAssets)
        .where(where)
        .orderBy(desc(mediaAssets.createdAt), desc(mediaAssets.id))
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
    ]);

    const total = Number(totalResult[0]?.total ?? 0);
    const pagination = getMediaPaginationMeta(total, query);

    // Se a página solicitada ultrapassar o total, refazemos apenas a leitura com a página válida.
    if (pagination.page !== query.page && total > 0) {
      const adjustedAssets = await db.select({
        id: mediaAssets.id,
        name: mediaAssets.name,
        type: mediaAssets.type,
        url: mediaAssets.url,
        fileKey: mediaAssets.fileKey,
        size: mediaAssets.size,
        tag: mediaAssets.tag,
        uploaderId: mediaAssets.uploaderId,
        uploadedAt: mediaAssets.createdAt,
      })
        .from(mediaAssets)
        .where(where)
        .orderBy(desc(mediaAssets.createdAt), desc(mediaAssets.id))
        .limit(query.pageSize)
        .offset((pagination.page - 1) * query.pageSize);

      return NextResponse.json({ success: true, assets: adjustedAssets, pagination });
    }

    return NextResponse.json({ success: true, assets, pagination });
  } catch (error) {
    console.error("Erro ao listar ativos de mídia:", error);
    return NextResponse.json({ error: "Erro interno ao buscar ativos de mídia." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireTeacherOrAdmin();
    if (!session) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const email = session.user.email?.toLowerCase();
    const user = email ? await db.query.users.findFirst({ where: eq(users.email, email) }) : null;
    if (!user) {
      return NextResponse.json({ error: "Usuário autenticado não encontrado no banco de dados." }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const tag = String(formData.get("tag") || "Geral").trim().slice(0, 64);
    const type = String(formData.get("type") || "image").trim().slice(0, 64);

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    const uploaded = await uploadEducationalImage(user.id, file, "material");
    const sizeKb = (file.size / 1024).toFixed(1);
    const sizeStr = Number(sizeKb) > 1024 ? `${(Number(sizeKb) / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

    const inserted = await db.insert(mediaAssets).values({
      name: file.name,
      type,
      url: uploaded.url,
      fileKey: uploaded.objectPath,
      size: sizeStr,
      tag,
      uploaderId: user.id,
    }).returning();

    return NextResponse.json({ success: true, asset: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar ativo de mídia:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro interno ao salvar arquivo." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    }

    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "ID do arquivo inválido." }, { status: 400 });
    }

    const asset = await db.query.mediaAssets.findFirst({ where: eq(mediaAssets.id, id) });
    if (!asset) {
      return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
    }

    const supabase = getSupabaseAdmin();
    const storageResult = await supabase.storage.from(MEDIA_IMAGE_BUCKET).remove([asset.fileKey]);
    if (storageResult.error) {
      console.error("Erro ao remover arquivo do Storage:", storageResult.error);
      return NextResponse.json({ error: "Não foi possível remover o arquivo do Storage." }, { status: 502 });
    }

    await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
    return NextResponse.json({ success: true, message: "Arquivo removido com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir ativo de mídia:", error);
    return NextResponse.json({ error: "Erro interno ao excluir arquivo." }, { status: 500 });
  }
}
