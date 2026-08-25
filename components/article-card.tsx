import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArticleCardProps {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  author: string;
}

export function ArticleCard({ slug, title, excerpt, publishedAt, author }: ArticleCardProps) {
  return (
    <article className="surface-card interactive-card group relative flex h-full flex-col overflow-hidden rounded-3xl p-5 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-900 via-red-600 to-amber-400 opacity-80" aria-hidden="true" />
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground">
        <span className="inline-flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-primary dark:bg-slate-800"><FileText size={15} /></span> Artigo</span>
        <time className="rounded-full bg-muted/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide">{publishedAt}</time>
      </div>
      <h3 className="mt-5 text-xl font-black tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{excerpt}</p>
      <p className="mt-5 text-xs font-semibold text-muted-foreground">Por {author}</p>
      <Button asChild variant="outline" className="mt-5 w-full">
        <Link href={`/blog/${slug}`}>Ler artigo <ArrowRight size={16} /></Link>
      </Button>
    </article>
  );
}
