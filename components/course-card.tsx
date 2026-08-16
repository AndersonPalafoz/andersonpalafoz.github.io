import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  id: number;
  level: string;
  title: string;
  description: string;
}

export function CourseCard({ id, level, title, description }: CourseCardProps) {
  return (
    <article className="surface-card interactive-card flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-red-700 dark:bg-red-950/40 dark:text-red-300">{level}</span>
        <BookOpen size={18} className="text-primary" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-xl font-black tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{description}</p>
      <Button asChild variant="outline" className="mt-6 w-full">
        <Link href={`/cursos/${id}`}>Ver detalhes <ArrowRight size={16} /></Link>
      </Button>
    </article>
  );
}
