import Link from "next/link";
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserEnrollments, getCertificates, getUserActivityProgress, getResumeLesson } from "@/lib/db";
import { BookOpen, Award, CheckSquare, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = parseInt(session?.user?.id ?? "");

  let enrollments: Awaited<ReturnType<typeof getUserEnrollments>> = [];
  let certificates: Awaited<ReturnType<typeof getCertificates>> = [];
  let atividades: Awaited<ReturnType<typeof getUserActivityProgress>> = [];

  if (!isNaN(userId) && userId > 0) {
    [enrollments, certificates, atividades] = await Promise.all([
      getUserEnrollments(userId),
      getCertificates(userId),
      getUserActivityProgress(userId),
    ]);
  }

  const cursosAtivos = await Promise.all(enrollments.filter((e) => e.status === "active").map(async (enrollment) => ({ ...enrollment, resume: enrollment.course ? await getResumeLesson(userId, enrollment.course.id) : null })));

  const atividadesPendentes = atividades.filter((a) => a.status !== "completed");
  const primeiroNome = session?.user?.name?.split(" ")[0] || "aluno(a)";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Olá, {primeiroNome}
        </h1>
        <p className="text-gray-600">
          Aqui está um resumo do seu progresso.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-lg bg-red-100 flex items-center justify-center">
              <BookOpen className="text-red-600" size={22} />
            </div>
            <span className="text-3xl font-bold text-gray-900">{cursosAtivos.length}</span>
          </div>
          <p className="text-gray-600 text-sm">Cursos Ativos</p>
        </div>

        <div className="p-6 rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-lg bg-amber-100 flex items-center justify-center">
              <CheckSquare className="text-amber-600" size={22} />
            </div>
            <span className="text-3xl font-bold text-gray-900">{atividadesPendentes.length}</span>
          </div>
          <p className="text-gray-600 text-sm">Atividades Pendentes</p>
        </div>

        <div className="p-6 rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-lg bg-green-100 flex items-center justify-center">
              <Award className="text-green-600" size={22} />
            </div>
            <span className="text-3xl font-bold text-gray-900">{certificates.length}</span>
          </div>
          <p className="text-gray-600 text-sm">Certificados Obtidos</p>
        </div>
      </div>

      {/* Continuar aprendendo */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Continuar Aprendendo</h2>

        {cursosAtivos.length === 0 ? (
          <div className="p-8 rounded-xl border border-gray-200 bg-white text-center space-y-4">
            <p className="text-gray-600">
              Você ainda não está inscrito em nenhum curso.
            </p>
            <Link href="/aulas">
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold inline-flex items-center gap-2">
                Explorar Cursos
                <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cursosAtivos.map((enrollment) => (
              <div
                key={enrollment.id}
                className="p-6 rounded-xl border border-gray-200 bg-white space-y-4"
              >
                  <div className="flex items-start gap-3">
                    {enrollment.course?.imageUrl ? <img src={enrollment.course.imageUrl} alt="" className="h-14 w-20 rounded-xl object-cover" /> : <div className="h-14 w-20 rounded-xl bg-red-50" />}
                    <div><span className="inline-block bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2">{enrollment.course?.level}</span><h3 className="font-bold text-gray-900">{enrollment.course?.title}</h3></div>
                  </div>

                <div className="space-y-1.5"><div className="flex justify-between text-xs text-gray-600"><span>Progresso</span><span className="font-semibold">{enrollment.resume?.percentage ?? enrollment.progress}%</span></div><div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-red-600 h-2 rounded-full transition-all" style={{ width: `${enrollment.resume?.percentage ?? enrollment.progress}%` }} /></div></div>
                {enrollment.resume?.lesson && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-800"><span className="font-black">Próxima aula:</span> {enrollment.resume.lesson.title}</p>}


                {enrollment.course && (
                  <Link href={enrollment.resume?.lesson ? `/cursos/${enrollment.course.id}/aulas/${enrollment.resume.lesson.id}` : `/cursos/${enrollment.course.id}`} className="block">
                    <button className="w-full border border-gray-300 hover:border-red-600 hover:text-red-600 text-gray-700 py-2 rounded-lg font-medium text-sm transition-colors">
                      {enrollment.resume?.lesson ? "Continuar da última aula" : "Abrir curso"}
                    </button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
