import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { mediaAssets, users } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { uploadEducationalImage, MEDIA_IMAGE_BUCKET } from "@/lib/media-image";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase Storage não está configurado.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "professor")) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const assets = await db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt));
    return NextResponse.json({ success: true, assets });
  } catch (error) {
    console.error("Erro ao listar ativos de mídia:", error);
    return NextResponse.json({ error: "Erro interno ao buscar ativos de mídia." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "professor")) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const email = session.user.email;
    const user = email ? await db.query.users.findFirst({ where: eq(users.email, email) }) : null;
    const ownerId = user?.id || 1;

    const formData = await request.formData();
    const file = formData.get("file");
    const tag = String(formData.get("tag") || "Geral");
    const type = String(formData.get("type") || "image");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    const uploaded = await uploadEducationalImage(ownerId, file, "material");
    const sizeKb = (file.size / 1024).toFixed(1);
    const sizeStr = Number(sizeKb) > 1024 ? `${(Number(sizeKb) / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

    const inserted = await db.insert(mediaAssets).values({
      name: file.name,
      type,
      url: uploaded.url,
      fileKey: uploaded.objectPath,
      size: sizeStr,
      tag,
      uploaderId: ownerId,
    }).returning();

    return NextResponse.json({ success: true, asset: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar ativo de mídia:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro interno ao salvar arquivo." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID do arquivo não informado." }, { status: 400 });
    }

    const asset = await db.query.mediaAssets.findFirst({ where: eq(mediaAssets.id, Number(id)) });
    if (asset) {
      const supabase = getSupabaseAdmin();
      await supabase.storage.from(MEDIA_IMAGE_BUCKET).remove([asset.fileKey]);
      await db.delete(mediaAssets).where(eq(mediaAssets.id, Number(id)));
    }

    return NextResponse.json({ success: true, message: "Arquivo removido com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir ativo de mídia:", error);
    return NextResponse.json({ error: "Erro interno ao excluir arquivo." }, { status: 500 });
  }
}
