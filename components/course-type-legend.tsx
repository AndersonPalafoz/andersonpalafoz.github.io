import { BookOpen, CalendarDays, ExternalLink, Users } from "lucide-react";
import { COURSE_TYPE_OPTIONS } from "@/lib/course-types";

const TYPE_ICONS = [BookOpen, Users, BookOpen, ExternalLink, CalendarDays];

export function CourseTypeLegend() {
  return (
    <details className="group surface-card mb-10 overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-inset sm:p-6">
        <span>
          <span className="eyebrow">Escolha o formato ideal</span>
          <span className="mt-1 block text-lg font-black text-foreground">Como funcionam os tipos de curso?</span>
          <span className="mt-1 block text-sm text-muted-foreground">Entenda o acesso, o contato com o professor e a forma de participação antes de escolher.</span>
        </span>
        <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700 transition-transform duration-200 group-open:rotate-180 dark:bg-red-950/40 dark:text-red-200">⌄</span>
      </summary>
      <div className="grid gap-3 border-t border-border bg-muted/20 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-5">
        {COURSE_TYPE_OPTIONS.map((courseType, index) => {
          const Icon = TYPE_ICONS[index];
          return (
            <article key={courseType.id} className={`rounded-2xl border p-4 ${courseType.className}`}>
              <div className="flex items-start justify-between gap-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${courseType.accentClassName}`} aria-hidden="true">
                  <Icon size={17} />
                </span>
                <span className="text-[10px] font-black uppercase tracking-wide">Tipo {courseType.id}</span>
              </div>
              <h3 className="mt-4 text-sm font-black">{courseType.shortLabel}</h3>
              <p className="mt-2 text-xs leading-5 opacity-90">{courseType.description}</p>
            </article>
          );
        })}
      </div>
    </details>
  );
}
