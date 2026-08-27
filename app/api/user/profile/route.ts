import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserByEmail, updateUserProfile } from "@/lib/db";
import { uploadAvatar } from "@/lib/avatar";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    const user = await getUserByEmail(session.user.email);
    if (!user || user.deletedAt) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    return NextResponse.json(
      { user: { id: user.id, name: user.name, socialName: user.socialName, cpf: user.cpf, email: user.email, phone: user.phone, location: user.location, bio: user.bio, avatarUrl: user.avatarUrl } },
      { headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    console.error("Error loading profile:", error);
    return NextResponse.json({ error: "Falha ao carregar perfil" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const currentUser = await getUserByEmail(session.user.email);
    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (currentUser.deletedAt) {
      return NextResponse.json({ error: "Esta conta está desativada" }, { status: 403 });
    }

    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Selecione uma imagem" }, { status: 400 });
      }

      const uploaded = await uploadAvatar(currentUser.id, file);
      const updated = await updateUserProfile(currentUser.id, {
        avatarUrl: uploaded.url,
      });

      return NextResponse.json({ success: true, user: updated[0] });
    }

    const body = await request.json();
    const { name, socialName, cpf, phone, location, bio } = body;

    if (typeof name === "string" && name.trim().length === 0) {
      return NextResponse.json({ error: "Nome não pode ficar vazio" }, { status: 400 });
    }

    const updated = await updateUserProfile(currentUser.id, {
      ...(typeof name === "string" && { name: name.trim() }),
      ...(typeof socialName === "string" && { socialName: socialName.trim() || undefined }),
      ...(typeof cpf === "string" && { cpf: cpf.trim() || undefined }),
      ...(typeof phone === "string" && { phone: phone.trim() || undefined }),
      ...(typeof location === "string" && { location: location.trim() || undefined }),
      ...(typeof bio === "string" && { bio: bio.trim() || undefined }),
    });

    return NextResponse.json({ success: true, user: updated[0] });
  } catch (error) {
    console.error("Error updating profile:", error);
    const message = error instanceof Error ? error.message : "Falha ao atualizar perfil";
    const isValidationError = /imagem|foto|2 MB|JPG|PNG|WebP|Selecione/i.test(message);

    return NextResponse.json(
      { error: isValidationError ? message : "Falha ao atualizar perfil" },
      { status: isValidationError ? 400 : 500 }
    );
  }
}
