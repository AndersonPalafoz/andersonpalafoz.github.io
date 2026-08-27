export const dynamic = "force-dynamic";

import Link from "next/link";
import { Clock, Users, Award, BookOpen } from "lucide-react";
import { CourseCatalog } from "@/components/course-catalog";
import { CourseTypeLegend } from "@/components/course-type-legend";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCourses, db } from "@/lib/db";
import { coursePurchases, enrollments, users, wishlistItems } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { isLearnerVisibleCourse } from "@/lib/course-visibility";

export const metadata = {
  title: "Cursos de Inglês | Anderson Palafoz",
  description: "Explore os cursos de inglês de Anderson Palafoz, com metodologias do Básico ao Avançado.",
};

const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2", "Básico", "Intermediário", "Avançado"];

export default async function CursosPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user?.email ? await db.query.users.findFirst({ where: eq(users.email, session.user.email) }) : null;
  const [rawCursos, purchasedRows, enrollmentRows, wishlistRows] = await Promise.all([
    getCourses(),
    user ? db.select({ courseId: coursePurchases.courseId }).from(coursePurchases).where(eq(coursePurchases.userId, user.id)) : Promise.resolve([]),
    user ? db.select({ courseId: enrollments.courseId }).from(enrollments).where(eq(enrollments.userId, user.id)) : Promise.resolve([]),
    user ? db.select({ courseId: wishlistItems.courseId }).from(wishlistItems).where(eq(wishlistItems.userId, user.id)) : Promise.resolve([]),
  ]);
  const cursosDb = rawCursos.filter((c) => Number(c.courseType) !== 4 && c.category !== "Curso Externo / Avulso" && isLearnerVisibleCourse(c));
  const purchasedCourseIds = new Set(purchasedRows.map((row) => row.courseId));
  const enrolledCourseIds = new Set(enrollmentRows.map((row) => row.courseId));
  const wishlistCourseIds = new Set(wishlistRows.map((row) => row.courseId));
  const cursos = [...cursosDb];
  const totalModulos = cursos.reduce((sum, c) => sum + (c.modules ?? 0), 0);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative flex min-h-[68vh] items-center overflow-hidden bg-white px-4 py-20 md:px-8 lg:px-16">
        <div className="pointer-events-none absolute -right-32 top-16 h-80 w-80 rounded-full bg-red-100/60 blur-3xl" />
        <div className="max-w-7xl mx-auto w-full">
          <div className="space-y-8 max-w-3xl">
            <div className="space-y-4">
              <span className="eyebrow">Trilha de aprendizagem</span>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Cursos de
                <br />
                <span className="text-red-600">Inglês Completos</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-slate-300 leading-relaxed">
                Cursos estruturados do Básico ao Avançado, com metodologia ESA (Engage, Study, Activate) e foco em comunicação prática.
              </p>
            </div>

            {/* Stats */}
            <div className="grid max-w-2xl grid-cols-3 gap-3 pt-8 sm:gap-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 p-4 sm:p-5">
                <p className="text-3xl font-black text-red-600">{cursos.length}</p>
                <p className="text-gray-600 dark:text-slate-400 text-sm">Cursos Disponíveis</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 p-4 sm:p-5">
                <p className="text-3xl font-black text-red-600">{totalModulos}</p>
                <p className="text-gray-600 dark:text-slate-400 text-sm">Módulos ao Todo</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 p-4 sm:p-5">
                <p className="text-3xl font-black text-red-600">100%</p>
                <p className="text-gray-600 dark:text-slate-400 text-sm">Prático</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cursos */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Nossos Cursos
          </h2>

          <CourseTypeLegend />

          {cursos.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-slate-400">
              Nenhum curso publicado no momento. Volte em breve!
            </p>
          ) : (
            <CourseCatalog
              courses={cursos.map((curso) => ({
                id: curso.id,
                level: curso.level,
                title: curso.title,
                description: curso.description,
                modules: curso.modules,
                imageUrl: curso.imageUrl,
                isFree: curso.isFree,
                price: curso.price,
                category: curso.category,
                courseType: curso.courseType,
                externalRedirectUrl: curso.externalRedirectUrl,
                syncModality: curso.syncModality,
              }))}
              purchasedCourseIds={Array.from(purchasedCourseIds)}
              enrolledCourseIds={Array.from(enrolledCourseIds)}
              wishlistCourseIds={Array.from(wishlistCourseIds)}
            />
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-red-600">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Estruture seu próximo passo no inglês
          </h2>
          <p className="text-lg text-red-100">
            Escolha um nível, acompanhe sua evolução e pratique com uma trilha organizada.
          </p>
          <Link href="/dashboard">
            <button className="bg-white hover:bg-gray-100 text-red-600 px-8 py-6 text-lg rounded-lg font-semibold">
              Explorar Cursos
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
