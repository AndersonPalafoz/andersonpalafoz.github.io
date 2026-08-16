import Link from "next/link";
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserEnrollments, getResumeLesson } from "@/lib/db";
import { BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";

export default async function CursosPage() {
  const session = await getServerSession(authOptions);
  const userId = parseInt(session?.user?.id ?? "");
  const enrollments = !isNaN(userId) && userId > 0 ? await getUserEnrollments(userId) : [];
  const enrichedEnrollments = await Promise.all(enrollments.map(async (enrollment) => ({ ...enrollment, resume: enrollment.course ? await getResumeLesson(userId, enrollment.course.id) : null })));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Cursos</h1>
        <p className="text-gray-600">
          Acompanhe seu progresso nos cursos de inglês
        </p>
      </div>

      {enrollments.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrichedEnrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="p-6 rounded-xl border border-gray-200 bg-white hover:shadow-md transition space-y-4"
            >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <BookOpen className="text-red-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{enrollment.course?.title}</h3>
                    <p className="text-xs text-gray-500">{enrollment.course?.level}</p>
                  </div>
                                    </div>
                    {Number(enrollment.progress) >= 100 || enrollment.status === "completed" ? <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700"><CheckCircle2 size={13} /> Concluído</span> : null}
                  </div>

                  {enrollment.course?.description && <p className="text-sm text-gray-600">{enrollment.course.description}</p>}
              {enrollment.resume?.lesson && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-800"><span className="font-black">Retomar em:</span> {enrollment.resume.lesson.title}</p>}

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">Progresso</span>
                  <span className="font-semibold text-gray-900">
                    {enrollment.resume?.percentage ?? enrollment.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all"
                    style={{ width: `${enrollment.resume?.percentage ?? enrollment.progress}%` }}
                  />
                </div>
              </div>

              {enrollment.course && (
                <Link href={`/cursos/${enrollment.course.id}`}>
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium text-sm transition-colors">
                    {enrollment.resume?.lesson ? "Continuar de onde parei" : enrollment.progress > 0 ? "Continuar" : "Começar"}
                  </button>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
