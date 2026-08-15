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
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold mb-3">
              <GraduationCap size={16} />
              Área Acadêmica do Professor
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Painel do Professor</h1>
            <p className="text-gray-600 mt-1">
              Gerencie conteúdos, acompanhe o engajamento dos alunos e organize o Academic Knowledge Hub.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Painel Admin
            </Link>
            <Link
              href="/admin/cursos"
              className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            >
              Novo Curso / Material
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-sm font-medium">Cursos Ativos</span>
              <BookOpen className="text-red-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.stats.totalCourses}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-sm font-medium">Alunos Aprovados</span>
              <Users className="text-red-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.stats.totalStudents}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-sm font-medium">Materiais Publicados</span>
              <FileText className="text-red-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.stats.totalMaterials}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-sm font-medium">Atividades Criadas</span>
              <CheckSquare className="text-red-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.stats.totalActivities}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-sm font-medium">Total de Matrículas</span>
              <UserCheck className="text-red-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.stats.totalEnrollments}</p>
          </div>
        </div>

        {/* Seções de Conteúdo Recente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cursos Recentes */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Cursos e Módulos</h2>
              <Link href="/admin/cursos" className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1">
                Gerenciar <ArrowRight size={16} />
              </Link>
            </div>
            <div className="space-y-4">
              {data.recentCourses.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum curso cadastrado ainda.</p>
              ) : (
                data.recentCourses.map((course) => (
                  <div key={course.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-xs text-gray-500">Nível {course.level} • {course.modules} módulos</p>
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
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Biblioteca de Materiais</h2>
              <Link href="/admin/materiais" className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1">
                Gerenciar <ArrowRight size={16} />
              </Link>
            </div>
            <div className="space-y-4">
              {data.recentMaterials.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum material cadastrado ainda.</p>
              ) : (
                data.recentMaterials.map((material) => (
                  <div key={material.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{material.title}</h3>
                      <p className="text-xs text-gray-500">{material.category} • Nível {material.level}</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700">
                      {material.downloads} downloads
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Alunos Recentes */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Alunos Ativos Recentes</h2>
            <Link href="/admin/usuarios" className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1">
              Ver Todos os Alunos <ArrowRight size={16} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="border-b border-gray-200 text-xs uppercase text-gray-400 font-semibold">
                <tr>
                  <th className="pb-3">Nome</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Função</th>
                  <th className="pb-3">Último Acesso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">Nenhum aluno ativo no momento.</td>
                  </tr>
                ) : (
                  data.recentStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="py-4 font-medium text-gray-900">{student.name || "Aluno sem nome"}</td>
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
