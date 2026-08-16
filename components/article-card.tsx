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
    <article className="surface-card interactive-card flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground">
        <span className="inline-flex items-center gap-2"><FileText size={15} className="text-primary" /> Artigo</span>
        <time>{publishedAt}</time>
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
