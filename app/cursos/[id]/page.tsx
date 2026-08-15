import { Suspense } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getCourseById, getModulesByCourse, getLessonsByModule } from "@/lib/db";
import { EnrollButton } from "@/components/enroll-button";
import { BookOpen, Layers, PlayCircle, Clock } from "lucide-react";

async function CourseModulesList({ courseId }: { courseId: number }) {
  const modules = await getModulesByCourse(courseId);
  if (modules.length === 0) {
    return <p className="text-gray-500 text-sm">Nenhum módulo cadastrado para este curso ainda.</p>;
  }

  return (
    <div className="space-y-6">
      {modules.map(async (mod) => {
        const lessons = await getLessonsByModule(mod.id);
        return (
          <div key={mod.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-600">Módulo {mod.order}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{mod.title}</h3>
                {mod.description && <p className="text-gray-600 text-sm mt-1">{mod.description}</p>}
              </div>
              <span className="text-xs font-semibold bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                {lessons.length} aulas
              </span>
            </div>

            {lessons.length > 0 ? (
              <div className="divide-y divide-gray-100 border-t border-gray-100 pt-3">
                {lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/cursos/${courseId}/aulas/${lesson.id}`}
                    className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-red-50/50 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <PlayCircle className="text-red-600 group-hover:scale-110 transition" size={22} />
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-red-600 transition">
                          Aula #{lesson.order}: {lesson.title}
                        </p>
                        {lesson.description && (
                          <p className="text-xs text-gray-500 line-clamp-1">{lesson.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={14} />
                      <span>{lesson.duration || 15} min</span>
                    </div>
                  </Link>
                ))}
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
  const course = await getCourseById(courseId);

  if (!course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Curso não encontrado.</p>
      </div>
    );
  }

  const modules = await getModulesByCourse(courseId);

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
          <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
            {course.level}
          </span>

          <h1 className="text-4xl font-bold text-gray-900">{course.title}</h1>

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

          <div className="pt-4 pb-2">
            <EnrollButton courseId={course.id} />
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Módulos e Aulas do Curso</h2>
            <CourseModulesList courseId={course.id} />
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
