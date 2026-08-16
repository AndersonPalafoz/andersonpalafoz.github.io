import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MaterialCardProps {
  id: number;
  title: string;
  type: string;
  level: string;
  description: string;
}

export function MaterialCard({ id, title, type, level, description }: MaterialCardProps) {
  return (
    <article className="surface-card interactive-card flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-red-700 dark:bg-red-950/40 dark:text-red-300">{type}</span>
          <p className="mt-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Nível {level}</p>
        </div>
        <FileText size={19} className="text-primary" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-xl font-black tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{description}</p>
      <Button asChild variant="outline" className="mt-6 w-full">
        <Link href={`/materiais/${id}`}>Ver material <ArrowRight size={16} /></Link>
      </Button>
    </article>
  );
}
