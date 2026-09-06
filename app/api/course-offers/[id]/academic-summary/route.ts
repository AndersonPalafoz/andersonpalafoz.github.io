import { NextResponse } from "next/server";
import { and, asc, eq, inArray, isNotNull } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { canManageCourseOffer, type AdminAuthSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { activities, attendances, classSessions, courseOfferStudents, courseOffers, progress, userActivityProgress } from "@/drizzle/schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const offerId = Number((await params).id);
  if (!Number.isInteger(offerId) || !await canManageCourseOffer(session as AdminAuthSession, offerId)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const offer = await db.query.courseOffers.findFirst({ where: eq(courseOffers.id, offerId) });
  if (!offer) return NextResponse.json({ error: "Turma não encontrada." }, { status: 404 });
  const students = await db.select({ id: courseOfferStudents.id, userId: courseOfferStudents.userId }).from(courseOfferStudents).where(and(eq(courseOfferStudents.offerId, offerId), isNotNull(courseOfferStudents.userId)));
  const studentIds = students.flatMap((student) => student.userId == null ? [] : [student.userId]);
  const [sessions, activityRows] = await Promise.all([
    db.select().from(classSessions).where(eq(classSessions.courseId, offer.courseId)).orderBy(asc(classSessions.scheduledAt)),
    db.select({ id: activities.id, title: activities.title, dueDate: activities.dueDate }).from(activities).where(eq(activities.offerId, offerId)).orderBy(asc(activities.dueDate)),
  ]);
  const sessionIds = sessions.map((item) => item.id);
  const [attendanceRows, progressRows, activityProgressRows] = await Promise.all([
    sessionIds.length ? db.select().from(attendances).where(inArray(attendances.sessionId, sessionIds)) : Promise.resolve([]),
    studentIds.length ? db.select().from(progress).where(and(eq(progress.courseId, offer.courseId), inArray(progress.userId, studentIds))) : Promise.resolve([]),
    activityRows.length && studentIds.length ? db.select().from(userActivityProgress).where(and(inArray(userActivityProgress.activityId, activityRows.map((item) => item.id)), inArray(userActivityProgress.userId, studentIds))) : Promise.resolve([]),
  ]);

  const averageProgress = progressRows.length ? Math.round(progressRows.reduce((sum, row) => sum + (row.percentageCompleted ?? 0), 0) / progressRows.length) : 0;
  const present = attendanceRows.filter((row) => row.status === "present").length;
  const attendanceRate = attendanceRows.length ? Math.round((present / attendanceRows.length) * 100) : 0;
  const completedActivities = activityProgressRows.filter((row) => row.status === "completed").length;

  return NextResponse.json({ sessions, activities: activityRows, attendances: attendanceRows, averageProgress, attendanceRate, completedActivities, totalActivities: activityRows.length });
}
