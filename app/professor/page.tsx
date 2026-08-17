export const dynamic = "force-dynamic";

import Link from "next/link";
import { BookOpen, Users, FileText, CheckSquare, GraduationCap, ArrowRight, UserCheck } from "lucide-react";
import { getTeacherDashboardData } from "@/lib/teacher";

export const metadata = {
  title: "Painel do Professor | Anderson Palafoz",
  description: "Gerenciamento acadêmico de cursos, alunos, materiais e atividades.",
};

export default async function TeacherDashboardPage() {
  const data = await getTeacherDashboardData();

  return (
    <div className="site-shell px-4 py-8 sm:px-6 lg:px-8">
      <div className="page-container space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 surface-card p-5 sm:p-7">
          <div>
            <div className="eyebrow mb-3">
              <GraduationCap size={16} />
              Área Acadêmica do Professor
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Painel do Professor</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
              Gerencie conteúdos, acompanhe o engajamento dos alunos e organize o Academic Knowledge Hub.
            </p>
          </div>
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 text-sm whitespace-nowrap">
            <Link
              href="/professor/progresso-aulas"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
            >
              Aulas & Speaking (Prática)
            </Link>
            <Link
              href="/professor/tarefas"
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground transition hover:border-red-200 hover:bg-muted"
            >
              Tarefas e Deadlines
            </Link>
            <Link
              href="/professor/alunos"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
            >
              Aprovar Alunos
            </Link>
            <Link
              href="/admin/cursos"
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm shadow-red-600/15 transition hover:-translate-y-0.5 hover:bg-primary/90"
            >
              Novo Curso / Material
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-sm font-medium">Cursos Ativos</span>
              <BookOpen className="text-red-600" size={20} />
            </div>
            <p className="text-3xl font-black tracking-tight text-foreground">{data.stats.totalCourses}</p>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-sm font-medium">Alunos Aprovados</span>
              <Users className="text-red-600" size={20} />
            </div>
            <p className="text-3xl font-black tracking-tight text-foreground">{data.stats.totalStudents}</p>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-sm font-medium">Materiais Publicados</span>
              <FileText className="text-red-600" size={20} />
            </div>
            <p className="text-3xl font-black tracking-tight text-foreground">{data.stats.totalMaterials}</p>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-sm font-medium">Atividades Criadas</span>
              <CheckSquare className="text-red-600" size={20} />
            </div>
            <p className="text-3xl font-black tracking-tight text-foreground">{data.stats.totalActivities}</p>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-sm font-medium">Total de Matrículas</span>
              <UserCheck className="text-red-600" size={20} />
            </div>
            <p className="text-3xl font-black tracking-tight text-foreground">{data.stats.totalEnrollments}</p>
          </div>
        </div>

        {/* Seções de Conteúdo Recente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cursos Recentes */}
          <div className="surface-card space-y-6 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Cursos e Módulos</h2>
              <Link href="/admin/cursos" className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1">
                Gerenciar <ArrowRight size={16} />
              </Link>
            </div>
            <div className="space-y-4">
              {data.recentCourses.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum curso cadastrado ainda.</p>
              ) : (
                data.recentCourses.map((course) => (
                  <div key={course.id} className="rounded-2xl border border-border/70 bg-muted/50 p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{course.title}</h3>
                      <p className="text-xs text-muted-foreground">Nível {course.level} • {course.modules} módulos</p>
                    </div>
                    <Link
                      href={`/cursos/${course.id}`}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                    >
                      Visualizar
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Materiais Recentes */}
          <div className="surface-card space-y-6 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Biblioteca de Materiais</h2>
              <Link href="/admin/materiais" className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1">
                Gerenciar <ArrowRight size={16} />
              </Link>
            </div>
            <div className="space-y-4">
              {data.recentMaterials.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum material cadastrado ainda.</p>
              ) : (
                data.recentMaterials.map((material) => (
                  <div key={material.id} className="rounded-2xl border border-border/70 bg-muted/50 p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{material.title}</h3>
                      <p className="text-xs text-muted-foreground">{material.category} • Nível {material.level}</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-200 text-foreground">
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
            <h2 className="text-xl font-bold text-foreground">Alunos Ativos Recentes</h2>
            <Link href="/admin/usuarios" className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1">
              Ver Todos os Alunos <ArrowRight size={16} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="border-b border-border/70 text-xs uppercase text-muted-foreground font-semibold">
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
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">Nenhum aluno ativo no momento.</td>
                  </tr>
                ) : (
                  data.recentStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="py-4 font-medium text-foreground">{student.name || "Aluno sem nome"}</td>
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
    </div>
  );
}
