import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { GraduationCap, ArrowRight } from "lucide-react";
import { getTeacherDashboardData, getTeacherCourses, getTeacherStudents, getTeacherMaterials } from "@/lib/teacher";
import { TeacherMaterialsZipExport } from "@/components/teacher-materials-zip-export";
import { TeacherSearchWidget } from "@/components/teacher-search-widget";
import { ProfessorSummaryDashboard } from "@/components/professor-summary-dashboard";
import { ProfessorCoursesTrashManager } from "@/components/professor-courses-trash-manager";
import { ProfessorCoursesList } from "@/components/professor-courses-list";
import { StudentStyleDashboardStats } from "@/components/student-style-dashboard-stats";
import { authOptions } from "@/lib/auth";
import { canAccessProfessorPortal, type StoredRole } from "@/lib/role-capabilities";

export const metadata = {
  title: "Painel do Professor | Anderson Palafoz",
  description: "Gerenciamento acadêmico de cursos, alunos, materiais e atividades.",
};

export default async function TeacherDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canAccessProfessorPortal({ email: session.user.email, role: session.user.role as StoredRole })) redirect("/login?callbackUrl=/professor");
  const teacherEmail = session.user.email ?? undefined;
  const [data, allCourses, allStudents, allMaterials] = await Promise.all([
    getTeacherDashboardData(teacherEmail),
    getTeacherCourses(teacherEmail),
    getTeacherStudents(teacherEmail),
    getTeacherMaterials(teacherEmail),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="page-container space-y-6">
        {/* Header */}
        <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8 xl:grid-cols-[minmax(0,1fr)_minmax(23rem,0.86fr)] xl:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
              <GraduationCap size={16} aria-hidden="true" />
              Área Acadêmica do Professor
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">Painel do Professor</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
              Gerencie conteúdos, acompanhe o engajamento dos alunos e organize o Academic Knowledge Hub com alta governança e dados em tempo real.
            </p>
          </div>
          <div className="relative z-[1] rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/20">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">Organize por área</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
              <Link href="/professor/cursos" className="group rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 p-3 transition hover:border-red-300 hover:bg-card">
                <span className="text-sm font-black text-slate-900 dark:text-white">Cursos</span>
                <span className="mt-1 block text-xs text-slate-600 dark:text-slate-300">Criar, editar e publicar conteúdo</span>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-600">Gerenciar <ArrowRight size={13} aria-hidden="true" /></span>
              </Link>
              <Link href="/professor/turmas-internas" className="group rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 p-3 transition hover:border-red-300 hover:bg-card">
                <span className="text-sm font-black text-slate-900 dark:text-white">Turmas internas</span>
                <span className="mt-1 block text-xs text-slate-600 dark:text-slate-300">Oferta, agenda e progresso</span>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-600">Abrir área <ArrowRight size={13} aria-hidden="true" /></span>
              </Link>
              <Link href="/professor/turmas-externas" className="group rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 p-3 transition hover:border-red-300 hover:bg-card">
                <span className="text-sm font-black text-slate-900 dark:text-white">Turmas externas</span>
                <span className="mt-1 block text-xs text-slate-600 dark:text-slate-300">Instituições, alunos e registros</span>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-600">Abrir área <ArrowRight size={13} aria-hidden="true" /></span>
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-border/60 pt-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Link href="/professor/alunos" className="hover:text-red-600">Alunos</Link>
              <Link href="/professor/progresso-aulas" className="hover:text-red-600">Aulas e speaking</Link>
              <Link href="/professor/tarefas" className="hover:text-red-600">Tarefas</Link>
              <Link href="/professor/certificados" className="hover:text-red-600">Certificados</Link>
            </div>
          </div>
        </section>

        {/* Painel Estatístico Estilo Dashboard do Aluno */}
        <StudentStyleDashboardStats
          coursesCount={data.stats.totalCourses}
          studentsCount={data.stats.totalStudents}
          materialsCount={data.stats.totalMaterials}
          enrollmentsCount={data.stats.totalEnrollments}
          contextLabel="Visão docente"
          contextDescription="Acompanhe o alcance dos seus cursos, a produção de materiais e as matrículas ativas."
        />

        {/* Motor de Busca Acadêmica do Professor */}
        <TeacherSearchWidget courses={allCourses} students={allStudents} />

        {/* Painel de Resumo: Dúvidas Pendentes e Médias por Turma */}
        <ProfessorSummaryDashboard />

        <TeacherMaterialsZipExport
          materials={allMaterials.map((material) => ({
            id: material.id,
            title: material.title,
            category: material.category,
            level: material.level,
            fileUrl: material.fileUrl,
          }))}
        />

        <ProfessorCoursesTrashManager
          initialCourses={allCourses.map((c) => ({
            id: c.id,
            title: c.title,
            level: c.level,
            category: c.category,
          }))}
        />

        {/* Seções de Conteúdo Recente */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Lista de Cursos com Paginação e Ações Rápidas */}
          <ProfessorCoursesList initialCourses={allCourses.map((course) => ({
            id: course.id,
            title: course.title,
            level: course.level,
            category: course.category,
            modules: course.modules ?? 0,
            isFree: course.isFree ?? true,
            price: Number(course.price ?? 0),
          }))} />

          {/* Materiais Recentes */}
          <div className="surface-card space-y-6 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Biblioteca de Materiais</h2>
              <Link href="/materiais" className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1">
                Ver biblioteca <ArrowRight size={16} />
              </Link>
            </div>
            <div className="space-y-4">
              {data.recentMaterials.length === 0 ? (
                <p className="text-slate-600 dark:text-slate-300 text-sm">Nenhum material cadastrado ainda.</p>
              ) : (
                data.recentMaterials.map((material) => (
                  <div key={material.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{material.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{material.category} • Nível {material.level}</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-200 text-slate-900 dark:text-white">
                      {material.downloads} downloads
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Alunos Recentes */}
        <div className="surface-card space-y-6 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Alunos Ativos Recentes</h2>
            <Link href="/professor/alunos" className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1">
              Revisar solicitações <ArrowRight size={16} />
            </Link>
          </div>
          <div className="space-y-3 md:hidden">
            {data.recentStudents.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-slate-600 dark:text-slate-300">Nenhum aluno ativo no momento.</div> : data.recentStudents.map((student) => (
              <article key={student.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-background p-4 shadow-sm">
                <div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 font-black text-red-700 dark:border-slate-700 dark:bg-slate-900 dark:text-red-300">{(student.name || student.email || "?").slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate font-bold text-slate-900 dark:text-white">{student.name || "Aluno sem nome"}</p><p className="truncate text-xs text-slate-600 dark:text-slate-300">{student.email}</p></div><span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-black uppercase text-red-700">{student.role}</span></div>
                <p className="mt-3 text-[11px] text-slate-600 dark:text-slate-300">Último acesso: {new Date(student.lastSignedIn).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</p>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-600 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="pb-3">Nome</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Função</th>
                  <th className="pb-3">Último Acesso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {data.recentStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-600 dark:text-slate-300">Nenhum aluno ativo no momento.</td>
                  </tr>
                ) : (
                  data.recentStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="py-4 font-medium text-slate-900 dark:text-white">{student.name || "Aluno sem nome"}</td>
                      <td className="py-4">{student.email}</td>
                      <td className="py-4 uppercase text-xs font-bold text-red-600">{student.role}</td>
                      <td className="py-4">
                        {new Date(student.lastSignedIn).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
