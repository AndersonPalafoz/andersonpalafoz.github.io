import { Suspense } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getCourseById, getModulesByCourse, getLessonsByModule, db } from "@/lib/db";
import { EnrollButton } from "@/components/enroll-button";
import { CertificateModal } from "@/components/certificate-modal";
import { BookOpen, Layers, PlayCircle, Clock, CheckCircle } from "lucide-react";
import { lessonProgress } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

async function CourseModulesList({ courseId, userId }: { courseId: number; userId?: number }) {
  const modules = await getModulesByCourse(courseId);
  if (modules.length === 0) {
    return <p className="text-gray-500 text-sm">Nenhum módulo cadastrado para este curso ainda.</p>;
  }

  // Buscar progresso de aulas do usuário se logado
  let completedLessonIds = new Set<number>();
  if (userId) {
    const allModuleIds = modules.map(m => m.id);
    if (allModuleIds.length > 0) {
      // Obter todas as aulas do curso
      const courseLessons = [];
      for (const modId of allModuleIds) {
        const lessonsInMod = await getLessonsByModule(modId);
        courseLessons.push(...lessonsInMod);
      }
      const lessonIds = courseLessons.map(l => l.id);
      if (lessonIds.length > 0) {
        const progressRecords = await db.query.lessonProgress.findMany({
          where: eq(lessonProgress.userId, userId),
        });
        progressRecords.forEach(p => {
          if (p.completed === 1) completedLessonIds.add(p.lessonId);
        });
      }
    }
  }

  return (
    <div className="space-y-6">
      {modules.map(async (mod) => {
        const lessons = await getLessonsByModule(mod.id);
        const completedInMod = lessons.filter(l => completedLessonIds.has(l.id)).length;

        return (
          <div key={mod.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-600">Módulo {mod.order}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{mod.title}</h3>
                {mod.description && <p className="text-gray-600 text-sm mt-1">{mod.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                  {completedInMod}/{lessons.length} concluídas
                </span>
              </div>
            </div>

            {lessons.length > 0 ? (
              <div className="divide-y divide-gray-100 border-t border-gray-100 pt-3">
                {lessons.map((lesson) => {
                  const isDone = completedLessonIds.has(lesson.id);
                  return (
                    <Link
                      key={lesson.id}
                      href={`/cursos/${courseId}/aulas/${lesson.id}`}
                      className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-red-50/50 transition group"
                    >
                      <div className="flex items-center gap-3">
                        {isDone ? (
                          <CheckCircle className="text-green-600 flex-shrink-0" size={22} />
                        ) : (
                          <PlayCircle className="text-red-600 group-hover:scale-110 transition flex-shrink-0" size={22} />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold transition ${isDone ? "text-green-700 line-through" : "text-gray-900 group-hover:text-red-600"}`}>
                              Aula #{lesson.order}: {lesson.title}
                            </p>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Listening & Speaking</span>
                          </div>
                          {lesson.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">{lesson.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                        <Clock size={14} />
                        <span>{lesson.duration || 15} min</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">Nenhuma aula cadastrada neste módulo.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

async function CourseDetail({ courseId }: { courseId: number }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const course = await getCourseById(courseId);

  if (!course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Curso não encontrado.</p>
      </div>
    );
  }

  const modules = await getModulesByCourse(courseId);

  // Calcular progresso total do curso para exibição visual
  let totalLessonsCount = 0;
  let completedLessonsCount = 0;
  if (user?.id) {
    for (const mod of modules) {
      const lessonsInMod = await getLessonsByModule(mod.id);
      totalLessonsCount += lessonsInMod.length;
      for (const l of lessonsInMod) {
        const lp = await db.query.lessonProgress.findFirst({
          where: (table) => and(eq(table.userId, Number(user.id)), eq(table.lessonId, l.id)),
        });
        if (lp && lp.completed === 1) completedLessonsCount++;
      }
    }
  }

  const progressPercentage = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Aulas", href: "/aulas" },
            { label: course.title, href: `/cursos/${course.id}` },
          ]}
        />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
              {course.level}
            </span>
            {user && (
              <span className="text-sm font-bold text-gray-700 bg-gray-100 px-4 py-1.5 rounded-full">
                Progresso: {progressPercentage}% concluído ({completedLessonsCount}/{totalLessonsCount} aulas)
              </span>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900">{course.title}</h1>

          {/* Barra de Progresso Visual */}
          {user && (
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-red-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}

          {course.description && (
            <p className="text-lg text-gray-600 leading-relaxed">{course.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-red-600" />
              <span>{course.modules ?? modules.length} módulos</span>
            </div>
            {course.instructor && (
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-red-600" />
                <span>{course.instructor}</span>
              </div>
            )}
          </div>

          <div className="pt-4 pb-2 flex flex-col sm:flex-row items-center gap-4">
            <EnrollButton courseId={course.id} />
            <CertificateModal courseId={course.id} courseName={course.title} percentage={progressPercentage} />
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Módulos e Aulas do Curso</h2>
            <CourseModulesList courseId={course.id} userId={user?.id ? Number(user.id) : undefined} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-600">Carregando curso...</p>
        </div>
      }
    >
      <CourseDetail courseId={parseInt(id)} />
    </Suspense>
  );
}
