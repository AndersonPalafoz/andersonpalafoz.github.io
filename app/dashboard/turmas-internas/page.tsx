import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { eq, and, isNull } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { courseOfferStudents, courseOffers, courses, users } from "@/drizzle/schema";
import { StudentInternalClasses, type StudentClass } from "@/components/student-internal-classes";
import { Layers3, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Minhas turmas internas | Anderson Palafoz", description: "Consulte suas turmas internas, agenda e progresso." };

export default async function StudentInternalClassesPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!session?.user || !email) redirect("/login?callbackUrl=/dashboard/turmas-internas");
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) redirect("/login?callbackUrl=/dashboard/turmas-internas");

  const memberships = await db.query.courseOfferStudents.findMany({
    where: and(eq(courseOfferStudents.userId, user.id), isNull(courseOfferStudents.completedAt)),
  });
  const classes: StudentClass[] = [];
  for (const membership of memberships) {
    const offer = await db.query.courseOffers.findFirst({ where: and(eq(courseOffers.id, membership.offerId), isNull(courseOffers.deletedAt)) });
    if (!offer) continue;
    const course = await db.query.courses.findFirst({ where: eq(courses.id, offer.courseId) });
    if (!course) continue;
    classes.push({ id: offer.id, offerName: offer.offerName, academicTerm: offer.academicTerm, courseTitle: course.title, courseLevel: course.level, institution: offer.institution, status: offer.status, modality: offer.modality, classDays: offer.classDays, classTime: offer.classTime, progress: 0 });
  }

  return (
    <main className="site-shell px-4 py-8 sm:px-6 lg:px-8">
      <div className="page-container space-y-8">
        <header className="dashboard-hero rounded-3xl p-5 sm:p-8">
          <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline"><ArrowLeft size={16} aria-hidden="true" /> Voltar ao painel</Link>
          <div className="flex items-start gap-4"><div className="rounded-2xl bg-red-100 p-3 text-red-700 dark:bg-red-950/50 dark:text-red-300"><Layers3 size={26} aria-hidden="true" /></div><div><p className="text-xs font-black uppercase tracking-[0.16em] text-red-600">Sua jornada</p><h1 className="mt-1 text-3xl font-black tracking-tight text-foreground sm:text-4xl">Minhas turmas internas</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Acompanhe as turmas em que você está matriculado e acesse seus cursos com clareza.</p></div></div>
        </header>
        <StudentInternalClasses classes={classes} />
      </div>
    </main>
  );
}
