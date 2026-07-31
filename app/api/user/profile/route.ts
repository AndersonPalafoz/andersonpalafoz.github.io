import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserByEmail, updateUserProfile } from "@/lib/db";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, location, bio } = body;

    if (typeof name === "string" && name.trim().length === 0) {
      return NextResponse.json({ error: "Nome não pode ficar vazio" }, { status: 400 });
    }

    const currentUser = await getUserByEmail(session.user.email);
    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const updated = await updateUserProfile(currentUser.id, {
      ...(typeof name === "string" && { name: name.trim() }),
      ...(typeof phone === "string" && { phone: phone.trim() || undefined }),
      ...(typeof location === "string" && { location: location.trim() || undefined }),
      ...(typeof bio === "string" && { bio: bio.trim() || undefined }),
    });

    return NextResponse.json({ success: true, user: updated[0] });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Falha ao atualizar perfil" },
      { status: 500 }
    );
  }
}
