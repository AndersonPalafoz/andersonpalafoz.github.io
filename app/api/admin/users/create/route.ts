import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { isSuperadmin } from "@/lib/role-capabilities";

const SUPER_ADMIN_EMAIL = "palafozanderson@gmail.com";
const VALID_ROLES = ["user", "professor", "admin"] as const;

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json({ error: "Acesso restrito à administração." }, { status: 403 });
    }
    const hasGlobalGovernance = isSuperadmin({
      email: session.user.email,
      role: session.user.role as "user" | "student" | "professor" | "admin" | "super_admin" | undefined,
    });

    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const role = body.role || "user";

    if (!email || !name) {
      return NextResponse.json({ error: "Nome e email são obrigatórios." }, { status: 400 });
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Papel inválido." }, { status: 400 });
    }
    if (!hasGlobalGovernance && role === "admin") {
      return NextResponse.json({ error: "Somente o superadministrador pode criar novas contas administrativas." }, { status: 403 });
    }

    const existingUser = await db.query.users.findFirst({
      where: (table, { eq }) => eq(table.email, email),
    });

    if (existingUser) {
      return NextResponse.json({ error: "Já existe uma conta com este email." }, { status: 409 });
    }

    const newUser = await db
      .insert(users)
      .values({
        email,
        name,
        role,
        approvalStatus: "approved",
        openId: `manual-${crypto.randomUUID()}`,
        loginMethod: "admin-created",
      })
      .returning();


    return NextResponse.json({
      message: "Usuário criado com acesso aprovado e progresso inicial zerado.",
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
        role: newUser[0].role,
        approvalStatus: newUser[0].approvalStatus,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Não foi possível criar o usuário." }, { status: 500 });
  }
}
