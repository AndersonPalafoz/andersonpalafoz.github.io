"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Loader2, MessageSquare, MessagesSquare, ShieldCheck, Star } from "lucide-react";

type ModerationCounts = { forum: number; messages: number };

export function AdminModerationHub() {
  const [counts, setCounts] = useState<ModerationCounts>({ forum: 0, messages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      fetch("/api/admin/forum?status=pending", { cache: "no-store" }).then((response) => response.ok ? response.json() : null),
      fetch("/api/admin/messages", { cache: "no-store" }).then((response) => response.ok ? response.json() : null),
    ]).then(([forumResult, messagesResult]) => {
      if (!mounted) return;
      const forumData = forumResult.status === "fulfilled" ? forumResult.value : null;
      const messageData = messagesResult.status === "fulfilled" ? messagesResult.value : null;
      const posts = Array.isArray(forumData?.posts) ? forumData.posts : [];
      const messages = Array.isArray(messageData?.messages) ? messageData.messages : [];
      setCounts({ forum: posts.length, messages: messages.filter((item: { isRead?: boolean }) => !item.isRead).length });
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const items = [
    { href: "/admin/forum", label: "Fórum", description: "Tópicos aguardando moderação", count: counts.forum, icon: MessageSquare, tone: "violet" },
    { href: "/admin/mensagens", label: "Mensagens", description: "Contatos ainda não lidos", count: counts.messages, icon: MessagesSquare, tone: "blue" },
    { href: "/admin/reviews", label: "Avaliações de cursos", description: "Escolha um curso para responder avaliações", count: null, icon: Star, tone: "amber" },
    { href: "/admin/reviews?mode=articles", label: "Comentários do blog", description: "Revisar conversas e respostas editoriais", count: null, icon: BookOpen, tone: "emerald" },
  ] as const;

  return (
    <section className="surface-card overflow-hidden rounded-3xl border border-border/70 shadow-sm">
      <div className="flex items-start gap-3 border-b border-border/70 bg-muted/20 p-5 sm:p-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg dark:bg-white dark:text-slate-900"><ShieldCheck size={20} /></div>
        <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Moderação e comunicação</p><h2 className="mt-1 text-xl font-black text-foreground">Caixa de entrada editorial</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Concentre respostas, revisão e acompanhamento das conversas do site.</p></div>
        {loading && <Loader2 size={16} className="ml-auto mt-1 animate-spin text-primary" />}
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const tone = item.tone === "violet" ? "border-violet-200 bg-violet-50/70 text-violet-900 dark:border-violet-900/50 dark:bg-violet-950/20 dark:text-violet-100" : item.tone === "blue" ? "border-blue-200 bg-blue-50/70 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-100" : item.tone === "amber" ? "border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100" : "border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-100";
          return <Link key={item.href} href={item.href} className={`group rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${tone}`}><div className="flex items-start justify-between gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 shadow-sm dark:bg-black/10"><Icon size={17} /></span>{item.count === null ? <span className="text-[10px] font-black uppercase tracking-wide">Abrir</span> : <span className="text-2xl font-black">{loading ? "—" : item.count}</span>}</div><p className="mt-3 text-sm font-black">{item.label}</p><p className="mt-1 text-[11px] leading-relaxed opacity-75">{item.description}</p><span className="mt-3 inline-flex items-center gap-1 text-[11px] font-black">Acessar <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" /></span></Link>;
        })}
      </div>
    </section>
  );
}
