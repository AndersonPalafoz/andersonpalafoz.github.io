import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { ArrowLeft, BookOpen } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getTeacherCourses } from "@/lib/teacher";
import { canAccessProfessorPortal, type StoredRole } from "@/lib/role-capabilities";
import { TeacherCourseStudio } from "@/components/teacher-course-studio";

export const metadata = {
  title: "Cursos do Professor | Anderson Palafoz",
  description: "Criação e organização de cursos sob responsabilidade docente.",
};

export default async function ProfessorCoursesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canAccessProfessorPortal({ email: session.user.email, role: session.user.role as StoredRole })) {
    redirect("/login?callbackUrl=/professor/cursos");
  }

  const courses = await getTeacherCourses(session.user.email ?? undefined);

  return (
    <div className="site-shell px-4 py-8 sm:px-6 lg:px-8">
      <div className="page-container space-y-8">
        <header className="dashboard-hero rounded-3xl p-5 sm:p-8">
          <Link href="/professor" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline"><ArrowLeft size={16} /> Voltar ao painel do professor</Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-red-600">Laboratório de criação</p>
              <h1 className="mt-2 flex flex-wrap items-center gap-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl"><BookOpen className="text-red-600" size={32} /> Meus cursos</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Crie e acompanhe cursos sob sua responsabilidade. O status, a lixeira e as ações permanecem restritos aos seus próprios cursos.</p>
            </div>
            <span className="self-start rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700 dark:bg-red-950/30 dark:text-red-300 sm:self-auto">{courses.length} curso(s) no seu escopo</span>
          </div>
        </header>
        <TeacherCourseStudio initialCourses={courses.map((course) => ({ id: course.id, title: course.title, level: course.level, category: course.category, modules: course.modules ?? 0, isFree: course.isFree ?? true, price: Number(course.price ?? 0) }))} />
      </div>
    </div>
  );
}
