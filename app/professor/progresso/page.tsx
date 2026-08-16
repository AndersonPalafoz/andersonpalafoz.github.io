import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { db } from "@/lib/db";
import { users, progress, enrollments, courses } from "@/drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Progresso dos Alunos | Painel do Professor",
  description: "Acompanhamento detalhado do progresso dos alunos nos cursos da plataforma.",
};

export default async function TeacherStudentProgressPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "professor" && session.user.role !== "admin")) {
    redirect("/");
  }

  const [students, allProgress, allEnrollments, courseRows] = await Promise.all([
    db.select().from(users).where(and(eq(users.role, "user"), isNull(users.deletedAt))),
    db.select().from(progress),
    db.select().from(enrollments),
    db.select({ id: courses.id, title: courses.title }).from(courses),
  ]);
  const courseTitles = new Map(courseRows.map((course) => [course.id, course.title]));

  return (
    <div className="site-shell px-4 py-8 sm:px-6 lg:px-8">
      <div className="page-container space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 surface-card p-5 sm:p-7">
          <div>
            <Link href="/professor" className="text-sm font-semibold text-red-600 hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft size={16} /> Voltar ao Painel do Professor
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <Users className="text-red-600" size={32} />
              Acompanhamento de Progresso Individual
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
              Visualize o andamento de cada aluno nos cursos, percentuais concluídos e histórico de matrículas.
            </p>
          </div>
        </div>

        <div className="surface-card overflow-hidden p-5 sm:p-6">
          <h2 className="text-xl font-black text-foreground mb-6">Alunos Cadastrados e Desempenho</h2>

          {students.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">Nenhum aluno cadastrado no momento.</p>
          ) : (
            <div className="space-y-6">
              {students.map((student) => {
                const studentProgressList = allProgress.filter((p) => p.userId === student.id);
                const studentEnrollments = allEnrollments.filter((e) => e.userId === student.id);

                return (
                  <div key={student.id} className="rounded-2xl border border-border/70 bg-muted/50 p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-lg">
                          {student.name ? student.name.charAt(0).toUpperCase() : "A"}
                        </div>
                        <div>
                          <h3 className="font-black text-foreground text-lg">{student.name || "Aluno sem nome"}</h3>
                          <p className="text-sm text-muted-foreground">{student.email} • {student.phone || "Sem telefone cadastrado"}</p>
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
                        <p className="text-xs text-muted-foreground col-span-3">Nenhum curso matriculado para este aluno.</p>
                      ) : (
                        studentEnrollments.map((enr) => {
                          const prog = studentProgressList.find((p) => p.courseId === enr.courseId);
                          const percentage = prog?.percentageCompleted ?? 0;

                          return (
                            <div key={enr.id} className="surface-card p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-foreground text-sm truncate">{courseTitles.get(enr.courseId) || "Curso"}</span>
                                <span className="text-xs font-bold text-red-600">{percentage}%</span>
                              </div>
                              <div className="w-full overflow-hidden rounded-full bg-muted h-2">
                                <div className="bg-red-600 h-full transition-all duration-300" style={{ width: `${percentage}%` }} />
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
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
