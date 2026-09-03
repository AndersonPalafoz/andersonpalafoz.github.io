import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { ArrowLeft, Layers3 } from "lucide-react";
import { and, count, eq, isNull } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { courseOfferStudents, courseOffers, courses, users } from "@/drizzle/schema";
import { canAccessProfessorPortal, getEffectiveRole } from "@/lib/role-capabilities";
import { listCourseOffers } from "@/lib/course-offer-service";
import { InternalClassesWorkspace, type InternalClass } from "@/components/internal-classes-workspace";

export const metadata = { title: "Turmas Internas | Anderson Palafoz", description: "Gestão das turmas vinculadas aos cursos internos da plataforma." };

export default async function InternalClassesPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!session?.user || !canAccessProfessorPortal({ email, role: session.user.role })) redirect("/login?callbackUrl=/professor/turmas-internas");
  const role = getEffectiveRole({ email, role: session.user.role });
  const user = email ? await db.query.users.findFirst({ where: eq(users.email, email) }) : undefined;
  if (!user) redirect("/login?callbackUrl=/professor/turmas-internas");
  const offers = await listCourseOffers({ userId: user.id, globalAdmin: role === "admin" || role === "superadmin" });
  const rows: InternalClass[] = [];
  for (const offer of offers) {
    const course = await db.query.courses.findFirst({ where: eq(courses.id, offer.courseId) });
    const [studentCount] = await db.select({ value: count(courseOfferStudents.id) }).from(courseOfferStudents).where(and(eq(courseOfferStudents.offerId, offer.id), isNull(courseOfferStudents.completedAt)));
    if (course) rows.push({ id: offer.id, offerName: offer.offerName, academicTerm: offer.academicTerm, institution: offer.institution, status: offer.status, modality: offer.modality, classDays: offer.classDays, classTime: offer.classTime, courseTitle: course.title, courseLevel: course.level, studentCount: Number(studentCount?.value ?? 0) });
  }

  return <main className="site-shell px-4 py-8 sm:px-6 lg:px-8"><div className="page-container space-y-8"><header className="dashboard-hero rounded-3xl p-5 sm:p-8"><Link href="/professor" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline"><ArrowLeft size={16} /> Voltar ao painel</Link><div className="flex items-start gap-4"><div className="rounded-2xl bg-red-100 p-3 text-red-700 dark:bg-red-950/50 dark:text-red-300"><Layers3 size={26} /></div><div><p className="text-xs font-black uppercase tracking-[0.16em] text-red-600">Gestão acadêmica</p><h1 className="mt-1 text-3xl font-black tracking-tight text-foreground sm:text-4xl">Turmas internas</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Organize as ofertas dos cursos que acontecem dentro da plataforma, acompanhe alunos e mantenha conteúdo, presença e progresso no mesmo lugar.</p></div></div></header><InternalClassesWorkspace classes={rows} canCreate={role !== "student"} /></div></main>;
}
