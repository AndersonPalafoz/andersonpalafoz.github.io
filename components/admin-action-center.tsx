"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, FileSignature, Loader2, MessageSquare, ShieldCheck, Users, CalendarDays, ClipboardList, Mic2, GraduationCap } from "lucide-react";

type PendingCounts = {
  users: number;
  certificates: number;
  forum: number;
  messages: number;
};

const initialCounts: PendingCounts = { users: 0, certificates: 0, forum: 0, messages: 0 };

type PendingFilter = "all" | "records" | "communication" | "academic";
type PendingSort = "priority" | "type";

const pendingFilters: Array<{ value: PendingFilter; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "records", label: "Cadastros" },
  { value: "communication", label: "Comunicação" },
  { value: "academic", label: "Acadêmicas" },
];

export function AdminActionCenter() {
  const [counts, setCounts] = useState<PendingCounts>(initialCounts);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PendingFilter>("all");
  const [sort, setSort] = useState<PendingSort>("priority");

  useEffect(() => {
    let mounted = true;
    const loadCounts = async () => {
      const requests = await Promise.allSettled([
        fetch("/api/admin/users", { cache: "no-store" }).then(response => response.ok ? response.json() : null),
        fetch("/api/admin/certificates", { cache: "no-store" }).then(response => response.ok ? response.json() : null),
        fetch("/api/admin/forum?status=pending", { cache: "no-store" }).then(response => response.ok ? response.json() : null),
        fetch("/api/admin/messages", { cache: "no-store" }).then(response => response.ok ? response.json() : null),
      ]);
      if (!mounted) return;
      const [usersResult, certificatesResult, forumResult, messagesResult] = requests;
      const users = usersResult.status === "fulfilled" && Array.isArray(usersResult.value?.users) ? usersResult.value.users : [];
      const certificates = certificatesResult.status === "fulfilled" && Array.isArray(certificatesResult.value?.certificates) ? certificatesResult.value.certificates : [];
      const forum = forumResult.status === "fulfilled" ? forumResult.value?.posts || forumResult.value?.topics || [] : [];
      const messages = messagesResult.status === "fulfilled" && Array.isArray(messagesResult.value?.messages) ? messagesResult.value.messages : [];
      setCounts({
        users: users.filter((item: { approvalStatus?: string; deletedAt?: string | null }) => item.approvalStatus === "pending" && !item.deletedAt).length,
        certificates: certificates.filter((item: { hasSignedPdf?: boolean; signedAt?: string | null }) => !item.hasSignedPdf && !item.signedAt).length,
        forum: Array.isArray(forum) ? forum.length : 0,
        messages: messages.filter((item: { isRead?: boolean }) => !item.isRead).length,
      });
      setLoading(false);
    };
    void loadCounts();
    return () => { mounted = false; };
  }, []);

  const total = useMemo(() => Object.values(counts).reduce((sum, value) => sum + value, 0), [counts]);
  const items = [
    { key: "users", category: "records" as const, label: "Aprovações de usuários", description: "Cadastros aguardando análise", count: counts.users, href: "/admin/usuarios", icon: Users, tone: "amber" },
    { key: "certificates", category: "records" as const, label: "Certificados", description: "Documentos sem assinatura final", count: counts.certificates, href: "/admin/certificados", icon: FileSignature, tone: "red" },
    { key: "forum", category: "communication" as const, label: "Moderação do fórum", description: "Tópicos aguardando revisão", count: counts.forum, href: "/admin/forum", icon: MessageSquare, tone: "violet" },
    { key: "messages", category: "communication" as const, label: "Mensagens recebidas", description: "Contatos ainda não lidos", count: counts.messages, href: "/admin/mensagens", icon: AlertCircle, tone: "blue" },
    { key: "external-classes", category: "academic" as const, label: "Turmas externas", description: "Calendário, alunos, notas e frequência", count: null, href: "/professor/turmas-externas", icon: CalendarDays, tone: "emerald" },
    { key: "tasks", category: "academic" as const, label: "Tarefas e prazos", description: "Criar, duplicar, revisar e corrigir atividades", count: null, href: "/professor/tarefas", icon: ClipboardList, tone: "indigo" },
    { key: "speaking", category: "academic" as const, label: "Speaking e progresso", description: "Avaliar gravações e acompanhar evolução", count: null, href: "/professor/progresso-aulas", icon: Mic2, tone: "cyan" },
    { key: "students", category: "academic" as const, label: "Operação acadêmica", description: "Alunos, certificados e acompanhamento docente", count: null, href: "/professor/alunos", icon: GraduationCap, tone: "orange" },
  ];
  const visibleItems = useMemo(() => items
    .filter((item) => filter === "all" || item.category === filter)
    .sort((a, b) => {
      if (sort === "type") return a.label.localeCompare(b.label, "pt-BR");
      return (b.count ?? -1) - (a.count ?? -1);
    }), [filter, items, sort]);

  return (
    <section className="surface-card overflow-hidden rounded-3xl border border-border/70 shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 border-b border-border/70 bg-gradient-to-r from-red-50/80 via-card to-card p-5 dark:from-red-950/20 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/20"><ShieldCheck size={21} /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-700 dark:text-red-300">Central de Pendências</p>
            <h2 className="mt-1 text-xl font-black text-foreground">O que precisa da sua atenção</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Filtre e priorize os atalhos operacionais com base nos registros reais do painel.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 text-xs font-black text-foreground">
          {loading ? <Loader2 size={14} className="animate-spin text-red-600" /> : total > 0 ? <span className="flex h-2 w-2 rounded-full bg-amber-500" /> : <CheckCircle2 size={15} className="text-emerald-600" />}
          {loading ? "Atualizando" : total > 0 ? `${total} pendência(s)` : "Tudo em dia"}
        </div>
      </div>
      <div className="flex flex-col gap-3 border-b border-border/70 bg-background/35 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5" aria-label="Filtros das pendências">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {pendingFilters.map((option) => <button key={option.value} type="button" onClick={() => setFilter(option.value)} aria-pressed={filter === option.value} className={`min-h-10 rounded-xl px-3 text-xs font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${filter === option.value ? "bg-red-600 text-white shadow-sm shadow-red-600/20" : "border border-border bg-card text-muted-foreground hover:border-red-200 hover:text-red-700 dark:hover:text-red-300"}`}>{option.label}</button>)}
        </div>
        <label className="flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-bold text-muted-foreground">
          <span className="shrink-0">Ordenar</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as PendingSort)} className="min-w-0 flex-1 bg-transparent font-black text-foreground outline-none">
            <option value="priority">Maior prioridade</option>
            <option value="type">Tipo de operação</option>
          </select>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2.5 p-3 sm:gap-3 sm:p-5 lg:grid-cols-4">
        {visibleItems.length === 0 ? <p className="col-span-2 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground lg:col-span-4">Não há pendências nesta categoria.</p> : visibleItems.map(item => {
          const Icon = item.icon;
          const toneClasses = item.tone === "amber" ? "border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100" : item.tone === "violet" ? "border-violet-200 bg-violet-50/70 text-violet-900 dark:border-violet-900/50 dark:bg-violet-950/20 dark:text-violet-100" : item.tone === "blue" ? "border-blue-200 bg-blue-50/70 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-100" : item.tone === "emerald" ? "border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-100" : item.tone === "indigo" ? "border-indigo-200 bg-indigo-50/70 text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:text-indigo-100" : item.tone === "cyan" ? "border-cyan-200 bg-cyan-50/70 text-cyan-900 dark:border-cyan-900/50 dark:bg-cyan-950/20 dark:text-cyan-100" : item.tone === "orange" ? "border-orange-200 bg-orange-50/70 text-orange-900 dark:border-orange-900/50 dark:bg-orange-950/20 dark:text-orange-100" : "border-red-200 bg-red-50/70 text-red-900 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-100";
          return (
            <Link key={item.key} href={item.href} className={`group min-h-40 rounded-2xl border p-3 transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] sm:min-h-0 sm:p-4 ${toneClasses}`}>
              <div className="flex items-start justify-between gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 shadow-sm dark:bg-black/10 sm:h-9 sm:w-9"><Icon size={16} /></span><span className="text-xl font-black sm:text-2xl">{loading || item.count === null ? "—" : item.count}</span></div>
              <p className="mt-3 text-xs font-black leading-snug sm:text-sm">{item.label}</p>
              <p className="mt-1 text-[10px] leading-relaxed opacity-75 sm:text-[11px]">{item.description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-black sm:text-[11px]">{item.count === null ? "Abrir operação" : "Abrir fila"} <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" /></span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
