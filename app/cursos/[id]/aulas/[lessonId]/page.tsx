import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, Play } from "lucide-react";
import { getLessonById } from "@/lib/db";

async function LessonContent({ lessonId }: { lessonId: number }) {
  const lesson = await getLessonById(lessonId);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Aula não encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/dashboard/cursos"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
          >
            <ChevronLeft size={20} />
            Voltar
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Video Player */}
        <div className="bg-black rounded-lg overflow-hidden mb-8 aspect-video flex items-center justify-center">
          {lesson.videoUrl ? (
            <iframe
              width="100%"
              height="100%"
              src={lesson.videoUrl}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="flex flex-col items-center gap-4 text-white">
              <Play size={48} className="text-muted-foreground" />
              <p className="text-muted-foreground">Vídeo não disponível</p>
            </div>
          )}
        </div>

        {/* Lesson Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {lesson.title}
            </h1>
            <p className="text-muted-foreground">
              {lesson.duration && `${lesson.duration} minutos`}
            </p>
          </div>

          {/* Description */}
          {lesson.description && (
            <div className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Descrição
              </h2>
              <p className="text-muted-foreground">{lesson.description}</p>
            </div>
          )}

          {/* Content */}
          {lesson.content && (
            <div className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Conteúdo da Aula
              </h2>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {lesson.content}
              </div>
            </div>
          )}

          {/* Mark Complete Button */}
          <div className="flex gap-4">
            <form action={`/api/lessons/${lesson.id}/progress`} method="POST">
              <input type="hidden" name="completed" value="1" />
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition"
              >
                <CheckCircle2 size={20} />
                Marcar como Concluída
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { lessonId } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Carregando aula...</p>
        </div>
      }
    >
      <LessonContent lessonId={parseInt(lessonId)} />
    </Suspense>
  );
}
