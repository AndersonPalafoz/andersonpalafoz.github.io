export const dynamic = "force-dynamic";

import Link from "next/link";
import { Clock, Users, Award, BookOpen, MessageCircle, Target, ArrowRight } from "lucide-react";
import { CourseCatalog } from "@/components/course-catalog";
import { CourseTypeLegend } from "@/components/course-type-legend";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCourses, db } from "@/lib/db";
import { coursePurchases, enrollments, users, wishlistItems, courseOffers } from "@/drizzle/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";
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
  const publishedOffersByCourse = new Map<number, Array<{
    id: number;
    offerName: string;
    academicTerm: string;
    institution: string | null;
    modality: string | null;
    classDays: string | null;
    classTime: string | null;
  }>>();
  if (cursosDb.length > 0) {
    try {
      const offerRows = await db.select({
        id: courseOffers.id,
        courseId: courseOffers.courseId,
        offerName: courseOffers.offerName,
        academicTerm: courseOffers.academicTerm,
        institution: courseOffers.institution,
        modality: courseOffers.modality,
        classDays: courseOffers.classDays,
        classTime: courseOffers.classTime,
      }).from(courseOffers).where(and(
        inArray(courseOffers.courseId, cursosDb.map((course) => course.id)),
        eq(courseOffers.status, "published"),
        isNull(courseOffers.deletedAt),
      ));
      for (const offer of offerRows) {
        const current = publishedOffersByCourse.get(offer.courseId) ?? [];
        current.push(offer);
        publishedOffersByCourse.set(offer.courseId, current);
      }
    } catch (error) {
      console.error("CursosPage: failed to load published offers", error);
    }
  }
  const purchasedCourseIds = new Set(purchasedRows.map((row) => row.courseId));
  const enrolledCourseIds = new Set(enrollmentRows.map((row) => row.courseId));
  const wishlistCourseIds = new Set(wishlistRows.map((row) => row.courseId));
  const cursos = [...cursosDb];
  const totalModulos = cursos.reduce((sum, c) => sum + (c.modules ?? 0), 0);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative flex min-h-[68vh] items-center overflow-hidden bg-white px-4 py-20 md:px-8 lg:px-16">
        <div className="pointer-events-none absolute -right-32 top-16 h-80 w-80 rounded-full bg-slate-200/70 blur-3xl dark:bg-slate-800/50" />
        <div className="max-w-7xl mx-auto w-full">
          <div className="space-y-8 max-w-3xl">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-red-600 dark:border-slate-700 dark:bg-slate-900">Trilha de aprendizagem</span>
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

      {/* Descoberta por objetivo */}
      <section className="border-y border-slate-200 bg-slate-50 px-4 py-16 dark:border-slate-800 dark:bg-slate-950 md:px-8 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-600">Comece pelo seu objetivo</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">Qual é o próximo passo que você quer dar?</h2>
            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">Explore uma trilha organizada ou fale comigo para escolher o nível mais adequado para sua rotina.</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { icon: Target, title: "Construir base", text: "Começar do zero ou reorganizar seus fundamentos.", href: "#catalogo-cursos" },
              { icon: BookOpen, title: "Avançar com estrutura", text: "Seguir uma trilha do Básico ao Avançado.", href: "#catalogo-cursos" },
              { icon: MessageCircle, title: "Entender meu caminho", text: "Conversar sobre objetivos, nível e formato.", href: "/contato" },
            ].map(({ icon: Icon, title, text, href }) => (
              <Link key={title} href={href} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-red-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <Icon className="text-red-600" size={24} aria-hidden="true" />
                <h3 className="mt-5 font-black text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-red-600">Explorar <ArrowRight size={14} aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cursos */}
      <section id="catalogo-cursos" className="scroll-mt-24 bg-white px-4 py-20 dark:bg-slate-950 md:px-8 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-16 text-center text-4xl font-black text-slate-900 dark:text-white md:text-5xl">
            Encontre seu curso
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
                publishedOffers: publishedOffersByCourse.get(curso.id) ?? [],
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
          <Link href="#catalogo-cursos" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-white px-8 py-4 text-lg font-semibold text-red-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-red-600">
            Explorar Cursos
          </Link>
        </div>
      </section>
    </div>
  );
}
