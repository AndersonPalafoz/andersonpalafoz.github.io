import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { ArrowLeft } from "lucide-react";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { courseOfferStudents, courseOffers, courses } from "@/drizzle/schema";
import { canAccessProfessorPortal } from "@/lib/role-capabilities";
import { canManageCourseOffer, type AdminAuthSession } from "@/lib/admin-auth";
import { InternalClassDetail } from "@/components/internal-class-detail";

type PageProps = { params: Promise<{ id: string }> };

export default async function InternalClassDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!session?.user || !canAccessProfessorPortal({ email, role: session.user.role })) redirect("/login");
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0 || !await canManageCourseOffer(session as AdminAuthSession, id)) notFound();
  const offer = await db.query.courseOffers.findFirst({ where: eq(courseOffers.id, id) });
  if (!offer) notFound();
  const course = await db.query.courses.findFirst({ where: eq(courses.id, offer.courseId) });
  const students = await db.query.courseOfferStudents.findMany({ where: eq(courseOfferStudents.offerId, id), orderBy: (table, { asc }) => [asc(table.name)] });

  return <main className="site-shell px-4 py-8 sm:px-6 lg:px-8"><div className="page-container space-y-5"><Link href="/professor/turmas-internas" className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline"><ArrowLeft size={16} /> Voltar para turmas internas</Link><InternalClassDetail offer={offer} course={course ? { title: course.title, level: course.level } : null} students={students.map((student) => ({ id: student.id, name: student.name, email: student.email }))} role={session.user.role ?? "admin"} /></div></main>;
}
