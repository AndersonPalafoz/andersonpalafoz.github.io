export const dynamic = "force-dynamic";

import Link from "next/link";
import { Clock, Users, Award, BookOpen } from "lucide-react";
import { CourseCatalog } from "@/components/course-catalog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCourses, db } from "@/lib/db";
import { coursePurchases, enrollments, users, wishlistItems } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const metadata = {
  title: "Aulas de Inglês | Anderson Palafoz",
  description: "Explore as aulas de inglês de Anderson Palafoz, com cursos do A1 ao B2.",
};

const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default async function AulasPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user?.email ? await db.query.users.findFirst({ where: eq(users.email, session.user.email) }) : null;
  const [cursosDb, purchasedRows, enrollmentRows, wishlistRows] = await Promise.all([
    getCourses(),
    user ? db.select({ courseId: coursePurchases.courseId }).from(coursePurchases).where(eq(coursePurchases.userId, user.id)) : Promise.resolve([]),
    user ? db.select({ courseId: enrollments.courseId }).from(enrollments).where(eq(enrollments.userId, user.id)) : Promise.resolve([]),
    user ? db.select({ courseId: wishlistItems.courseId }).from(wishlistItems).where(eq(wishlistItems.userId, user.id)) : Promise.resolve([]),
  ]);
  const purchasedCourseIds = new Set(purchasedRows.map((row) => row.courseId));
  const enrolledCourseIds = new Set(enrollmentRows.map((row) => row.courseId));
  const wishlistCourseIds = new Set(wishlistRows.map((row) => row.courseId));
  const cursos = [...cursosDb].sort(
    (a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level)
  );
  const totalModulos = cursos.reduce((sum, c) => sum + (c.modules ?? 0), 0);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto w-full">
          <div className="space-y-8 max-w-3xl">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Aulas de
                <br />
                <span className="text-red-600">Inglês Completas</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Cursos estruturados do A1 ao B2, com metodologia ESA (Engage, Study, Activate) e foco em comunicação prática.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <p className="text-3xl font-bold text-red-600">{cursos.length}</p>
                <p className="text-gray-600 text-sm">Cursos Disponíveis</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">{totalModulos}</p>
                <p className="text-gray-600 text-sm">Módulos ao Todo</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">100%</p>
                <p className="text-gray-600 text-sm">Prático</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            O que você vai aprender
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Gramática",
                description: "Estruturas essenciais com foco em aplicação prática",
              },
              {
                icon: Users,
                title: "Conversação",
                description: "Comunicação fluida em situações reais",
              },
              {
                icon: Clock,
                title: "Pronúncia",
                description: "Sotaque natural e compreensão auditiva",
              },
              {
                icon: Award,
                title: "Certificação",
                description: "Certificado ao final de cada nível",
              },
            ].map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="text-red-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cursos */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Nossos Cursos
          </h2>

          {cursos.length === 0 ? (
            <p className="text-center text-gray-600">
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
            Comece sua Transformação Hoje
          </h2>
          <p className="text-lg text-red-100">
            Escolha seu nível e inicie sua jornada rumo à fluência em inglês.
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
