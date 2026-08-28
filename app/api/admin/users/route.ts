import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deleteUserPermanently } from "@/lib/db";
import { users, courseOfferStudents } from "@/drizzle/schema";
import { and, desc, eq, ilike, isNull, ne, not, or } from "drizzle-orm";
import { ADMIN_AUDIT_ACTIONS, logAdminActivity } from "@/lib/admin-audit";
import { requireAdmin } from "@/lib/admin-auth";

const SUPER_ADMIN_EMAIL = "palafozanderson@gmail.com";
const VALID_ROLES = ["user", "professor", "admin"] as const;
const VALID_APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;

type Role = (typeof VALID_ROLES)[number];
type ApprovalStatus = (typeof VALID_APPROVAL_STATUSES)[number];

function parseUserId(value: unknown) {
  const userId = typeof value === "number" ? value : Number(value);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

function serializeUser(user: typeof users.$inferSelect, offerCount = 0) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    approvalStatus: user.approvalStatus,
    teacherId: user.teacherId,
    deletedAt: user.deletedAt,
    phone: user.phone,
    location: user.location,
    bio: user.bio,
    loginMethod: user.loginMethod,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastSignedIn: user.lastSignedIn,
    offerCount,
  };
}

// GET /api/admin/users - Lista usuários, incluindo contas pendentes e excluídas logicamente.
export async function GET() {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json({ error: "Acesso restrito à administração." }, { status: 403 });
    }
    const hasGlobalGovernance = session.user.email?.toLowerCase() === SUPER_ADMIN_EMAIL || session.user.role === "super_admin";

    const allUsers = await db.query.users.findMany({
      where: and(
        or(isNull(users.loginMethod), ne(users.loginMethod, "manual_external")),
        or(isNull(users.email), not(ilike(users.email, "%@external.placeholder"))),
      ),
      orderBy: [desc(users.createdAt)],
    });

    const offerMemberships = await db.select({ userId: courseOfferStudents.userId }).from(courseOfferStudents);
    const offerCounts = offerMemberships.reduce<Map<number, number>>((counts, membership) => {
      if (membership.userId) counts.set(membership.userId, (counts.get(membership.userId) || 0) + 1);
      return counts;
    }, new Map());
    const visibleUsers = hasGlobalGovernance
      ? allUsers
      : allUsers.filter((user) => user.role !== "admin" && user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL);
    return NextResponse.json({ users: visibleUsers.map((user) => serializeUser(user, offerCounts.get(user.id) || 0)) });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Não foi possível carregar os usuários." }, { status: 500 });
  }
}

// PUT /api/admin/users - Edita papel/status e campos não sensíveis.
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json({ error: "Acesso restrito à administração." }, { status: 403 });
    }
    const hasGlobalGovernance = session.user.email?.toLowerCase() === SUPER_ADMIN_EMAIL || session.user.role === "super_admin";

    const body = await request.json();
    const userId = parseUserId(body.userId);

    if (!userId) {
      return NextResponse.json({ error: "userId inválido." }, { status: 400 });
    }

    const targetUser = await db.query.users.findFirst({ where: eq(users.id, userId) });

    if (!targetUser) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const isProtectedAccount = targetUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL;

    if (!hasGlobalGovernance && (isProtectedAccount || targetUser.role === "admin")) {
      return NextResponse.json({ error: "Administradores só podem gerenciar alunos e professores." }, { status: 403 });
    }

    if (body.action === "restore") {
      if (isProtectedAccount) {
        return NextResponse.json({ error: "A conta principal não precisa de recuperação." }, { status: 400 });
      }

      const restoredUser = await db
        .update(users)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();

      await logAdminActivity({
        adminEmail: session.user?.email ?? SUPER_ADMIN_EMAIL,
        action: ADMIN_AUDIT_ACTIONS.RESTORE,
        targetName: targetUser.name,
        targetEmail: targetUser.email,
        details: hasGlobalGovernance ? "Conta recuperada pelo superadministrador." : "Conta recuperada por administrador.",
      });

      return NextResponse.json({ message: "Usuário recuperado.", user: serializeUser(restoredUser[0]) });
    }

    const updates: Partial<typeof users.$inferInsert> = { updatedAt: new Date() };

    if (body.role !== undefined) {
      if (!VALID_ROLES.includes(body.role as Role)) {
        return NextResponse.json({ error: "Papel inválido." }, { status: 400 });
      }
      if (!hasGlobalGovernance && body.role === "admin") {
        return NextResponse.json({ error: "Somente o superadministrador pode promover uma conta a administrador." }, { status: 403 });
      }
      if (isProtectedAccount && body.role !== "admin") {
        return NextResponse.json({ error: "O super-admin principal não pode perder esse papel." }, { status: 403 });
      }
      updates.role = body.role as Role;
    }

    if (body.approvalStatus !== undefined) {
      if (!VALID_APPROVAL_STATUSES.includes(body.approvalStatus as ApprovalStatus)) {
        return NextResponse.json({ error: "Status de aprovação inválido." }, { status: 400 });
      }
      if (isProtectedAccount && body.approvalStatus !== "approved") {
        return NextResponse.json({ error: "A conta principal deve permanecer aprovada." }, { status: 403 });
      }
      updates.approvalStatus = body.approvalStatus as ApprovalStatus;
    }

    for (const field of ["name", "phone", "location", "bio"] as const) {
      if (body[field] !== undefined) {
        if (body[field] !== null && typeof body[field] !== "string") {
          return NextResponse.json({ error: `Campo ${field} inválido.` }, { status: 400 });
        }
        updates[field] = body[field] === null ? null : body[field].trim();
      }
    }

    if (body.teacherId !== undefined) {
      const tId = body.teacherId === null || body.teacherId === "" ? null : Number(body.teacherId);
      updates.teacherId = Number.isInteger(tId) ? tId : null;
    }

    const updatedUser = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();

    const auditEmail = session.user?.email ?? SUPER_ADMIN_EMAIL;
    if (body.role !== undefined && body.role !== targetUser.role) {
      await logAdminActivity({
        adminEmail: auditEmail,
        action: ADMIN_AUDIT_ACTIONS.ROLE_CHANGE,
        targetName: targetUser.name,
        targetEmail: targetUser.email,
        details: `Papel alterado de ${targetUser.role} para ${body.role}.`,
      });
    }
    if (body.approvalStatus !== undefined && body.approvalStatus !== targetUser.approvalStatus) {
      await logAdminActivity({
        adminEmail: auditEmail,
        action: body.approvalStatus === "approved" ? ADMIN_AUDIT_ACTIONS.APPROVE : ADMIN_AUDIT_ACTIONS.REJECT,
        targetName: targetUser.name,
        targetEmail: targetUser.email,
        details: `Status alterado de ${targetUser.approvalStatus} para ${body.approvalStatus}.`,
      });
    }

    return NextResponse.json({ message: "Usuário atualizado.", user: serializeUser(updatedUser[0]) });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Não foi possível atualizar o usuário." }, { status: 500 });
  }
}

// DELETE /api/admin/users?id=123           - Exclusão lógica, preservando histórico e recuperação.
// DELETE /api/admin/users?id=123&permanent=true - Exclusão definitiva. Só é permitida se o
// usuário já estiver na lixeira (exclusão lógica é sempre o primeiro passo).
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json({ error: "Acesso restrito à administração." }, { status: 403 });
    }
    const hasGlobalGovernance = session.user.email?.toLowerCase() === SUPER_ADMIN_EMAIL || session.user.role === "super_admin";

    const url = new URL(request.url);
    const userId = parseUserId(url.searchParams.get("id"));
    const permanent = url.searchParams.get("permanent") === "true";

    if (!userId) {
      return NextResponse.json({ error: "userId inválido." }, { status: 400 });
    }

    const targetUser = await db.query.users.findFirst({ where: eq(users.id, userId) });

    if (!targetUser) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    if (targetUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: "A conta principal não pode ser excluída." }, { status: 403 });
    }
    if (!hasGlobalGovernance && targetUser.role === "admin") {
      return NextResponse.json({ error: "Administradores não podem excluir outras contas administrativas." }, { status: 403 });
    }

    if (permanent) {
      if (!hasGlobalGovernance) {
        return NextResponse.json({ error: "A exclusão definitiva é exclusiva do superadministrador." }, { status: 403 });
      }
      if (!targetUser.deletedAt) {
        return NextResponse.json(
          { error: "Exclua o usuário logicamente primeiro (ele precisa estar na lixeira) antes de excluir definitivamente." },
          { status: 400 },
        );
      }

      try {
        await deleteUserPermanently(userId);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Não foi possível excluir o usuário definitivamente.";
        return NextResponse.json({ error: message }, { status: 409 });
      }

      await logAdminActivity({
        adminEmail: session.user?.email ?? SUPER_ADMIN_EMAIL,
        action: ADMIN_AUDIT_ACTIONS.PERMANENT_DELETE,
        targetName: targetUser.name,
        targetEmail: targetUser.email,
        details: "Conta e dados pessoais excluídos definitivamente pelo super-admin.",
      });

      return NextResponse.json({ message: "Usuário excluído definitivamente." });
    }

    const deletedUser = await db
      .update(users)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    await logAdminActivity({
      adminEmail: session.user?.email ?? SUPER_ADMIN_EMAIL,
      action: ADMIN_AUDIT_ACTIONS.SOFT_DELETE,
      targetName: targetUser.name,
      targetEmail: targetUser.email,
      details: hasGlobalGovernance ? "Conta excluída logicamente pelo superadministrador." : "Conta excluída logicamente por administrador.",
    });

    return NextResponse.json({ message: "Usuário excluído logicamente.", user: serializeUser(deletedUser[0]) });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Não foi possível excluir o usuário." }, { status: 500 });
  }
}
