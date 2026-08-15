export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";

export const metadata = {
  title: "Progresso dos Alunos | Painel do Professor",
  description: "Acompanhamento detalhado do progresso dos alunos nos cursos da plataforma.",
};

export default async function TeacherStudentProgressPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "professor" && session.user.role !== "admin")) {
    redirect("/");
  }

  const students = await db.query.users.findMany({
    where: and(eq(users.role, "user"), isNull(users.deletedAt)),
  });

  const allProgress = await db.query.progress.findMany({
    with: { course: true },
  });

  const allEnrollments = await db.query.enrollments.findMany({
    with: { course: true },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <Link href="/professor" className="text-sm font-semibold text-red-600 hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft size={16} /> Voltar ao Painel do Professor
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="text-red-600" size={32} />
              Acompanhamento de Progresso Individual
            </h1>
            <p className="text-gray-600 mt-1">
              Visualize o andamento de cada aluno nos cursos, percentuais concluídos e histórico de matrículas.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Alunos Cadastrados e Desempenho</h2>

          {students.length === 0 ? (
            <p className="text-gray-500 py-8 text-center">Nenhum aluno cadastrado no momento.</p>
          ) : (
            <div className="space-y-6">
              {students.map((student) => {
                const studentProgressList = allProgress.filter((p) => p.userId === student.id);
                const studentEnrollments = allEnrollments.filter((e) => e.userId === student.id);

                return (
                  <div key={student.id} className="p-6 rounded-xl bg-gray-50 border border-gray-200 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-lg">
                          {student.name ? student.name.charAt(0).toUpperCase() : "A"}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{student.name || "Aluno sem nome"}</h3>
                          <p className="text-sm text-gray-500">{student.email} • {student.phone || "Sem telefone cadastrado"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                          {student.approvalStatus === "approved" ? "Aprovado" : "Pendente"}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                          {studentEnrollments.length} cursos matriculados
                        </span>
                      </div>
                    </div>

                    {/* Progresso por curso */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      {studentEnrollments.length === 0 ? (
                        <p className="text-xs text-gray-500 col-span-3">Nenhum curso matriculado para este aluno.</p>
                      ) : (
                        studentEnrollments.map((enr) => {
                          const prog = studentProgressList.find((p) => p.courseId === enr.courseId);
                          const percentage = prog?.percentageCompleted ?? 0;

                          return (
                            <div key={enr.id} className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-900 text-sm truncate">{enr.course?.title || "Curso"}</span>
                                <span className="text-xs font-bold text-red-600">{percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-red-600 h-full transition-all duration-300" style={{ width: `${percentage}%` }} />
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                                <span>{prog?.lessonsCompleted ?? 0} de {prog?.totalLessons ?? 0} aulas</span>
                                <span className="capitalize">{prog?.status === "completed" ? "Concluído" : "Em andamento"}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
