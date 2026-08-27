import { NextRequest, NextResponse } from "next/server";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { ADMIN_AUDIT_ACTIONS, logAdminActivity } from "@/lib/admin-audit";
import { forumPosts, forumReplies, users } from "@/drizzle/schema";
import { requireAdmin } from "@/lib/admin-auth";

const VALID_STATUSES = ["pending", "approved", "rejected", "resolved"] as const;
type ForumStatus = (typeof VALID_STATUSES)[number];

function parseId(value: unknown) {
  const id = typeof value === "number" ? value : Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    }

    const status = request.nextUrl.searchParams.get("status")?.trim() || "";
    const search = request.nextUrl.searchParams.get("search")?.trim().slice(0, 160) || "";
    const filters = [
      ...(status && VALID_STATUSES.includes(status as ForumStatus) ? [eq(forumPosts.status, status as ForumStatus)] : []),
      ...(search ? [or(ilike(forumPosts.title, `%${search}%`), ilike(forumPosts.content, `%${search}%`))] : []),
    ];

    const rows = await db
      .select({
        id: forumPosts.id,
        title: forumPosts.title,
        category: forumPosts.category,
        content: forumPosts.content,
        audioUrl: forumPosts.audioUrl,
        status: forumPosts.status,
        moderationNote: forumPosts.moderationNote,
        moderatedAt: forumPosts.moderatedAt,
        createdAt: forumPosts.createdAt,
        updatedAt: forumPosts.updatedAt,
        authorId: forumPosts.authorId,
        authorName: users.name,
        authorEmail: users.email,
      })
      .from(forumPosts)
      .innerJoin(users, eq(forumPosts.authorId, users.id))
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(forumPosts.createdAt));

    const counts = rows.length
      ? await db.select({ postId: forumReplies.postId, total: count() })
          .from(forumReplies)
          .where(or(...rows.map((row) => eq(forumReplies.postId, row.id))))
          .groupBy(forumReplies.postId)
      : [];
    const repliesByPost = new Map(counts.map((row) => [row.postId, Number(row.total)]));

    return NextResponse.json({
      posts: rows.map((row) => ({ ...row, replies: repliesByPost.get(row.id) || 0 })),
    });
  } catch (error) {
    console.error("Error loading admin forum moderation:", error);
    return NextResponse.json({ error: "Não foi possível carregar a moderação persistida." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    }

    const body = await request.json();
    const postId = parseId(body.postId);
    if (!postId) return NextResponse.json({ error: "postId inválido." }, { status: 400 });

    const existingPost = await db.query.forumPosts.findFirst({ where: eq(forumPosts.id, postId) });
    if (!existingPost) return NextResponse.json({ error: "Tópico não encontrado." }, { status: 404 });

    const updates: Partial<typeof forumPosts.$inferInsert> = { updatedAt: new Date() };
    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status as ForumStatus)) {
        return NextResponse.json({ error: "Status de moderação inválido." }, { status: 400 });
      }
      updates.status = body.status as ForumStatus;
      updates.moderatedBy = Number(session.user.id);
      updates.moderatedAt = new Date();
    }
    for (const field of ["title", "content", "category", "moderationNote"] as const) {
      if (body[field] !== undefined) {
        if (body[field] !== null && typeof body[field] !== "string") {
          return NextResponse.json({ error: `Campo ${field} inválido.` }, { status: 400 });
        }
        updates[field] = body[field] === null ? null : body[field].trim();
      }
    }
    if (updates.title !== undefined && (!updates.title || updates.title.length > 200)) {
      return NextResponse.json({ error: "Título inválido." }, { status: 400 });
    }
    if (updates.content !== undefined && (!updates.content || updates.content.length > 10000)) {
      return NextResponse.json({ error: "Conteúdo inválido." }, { status: 400 });
    }

    const [updatedPost] = await db.update(forumPosts).set(updates).where(eq(forumPosts.id, postId)).returning();
    const auditAction = updatedPost.status === "rejected" ? ADMIN_AUDIT_ACTIONS.REJECT : ADMIN_AUDIT_ACTIONS.APPROVE;
    await logAdminActivity({
      adminEmail: session.user.email || "admin",
      action: auditAction,
      targetName: existingPost.title,
      details: `Moderação do tópico #${postId}: ${existingPost.status} → ${updatedPost.status}.`,
    });

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    console.error("Error updating admin forum post:", error);
    return NextResponse.json({ error: "Não foi possível atualizar o tópico." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    }

    const postId = parseId(new URL(request.url).searchParams.get("id"));
    if (!postId) return NextResponse.json({ error: "id inválido." }, { status: 400 });
    const existingPost = await db.query.forumPosts.findFirst({ where: eq(forumPosts.id, postId) });
    if (!existingPost) return NextResponse.json({ error: "Tópico não encontrado." }, { status: 404 });

    await db.update(forumPosts).set({ status: "rejected", moderationNote: "Rejeitado pelo administrador.", moderatedBy: Number(session.user.id), moderatedAt: new Date(), updatedAt: new Date() }).where(eq(forumPosts.id, postId));
    await logAdminActivity({
      adminEmail: session.user.email || "admin",
      action: ADMIN_AUDIT_ACTIONS.REJECT,
      targetName: existingPost.title,
      details: `Tópico #${postId} rejeitado pela moderação.`,
    });
    return NextResponse.json({ message: "Tópico rejeitado." });
  } catch (error) {
    console.error("Error rejecting admin forum post:", error);
    return NextResponse.json({ error: "Não foi possível rejeitar o tópico." }, { status: 500 });
  }
}
