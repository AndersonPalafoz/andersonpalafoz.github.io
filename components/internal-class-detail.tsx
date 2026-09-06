"use client";

import { useState } from "react";
import { Activity, CalendarDays, CheckCircle2, ClipboardCheck, GraduationCap, Users } from "lucide-react";

type Student = { id: number; name: string | null; email: string | null };

type InternalClassDetailProps = {
  offer: { offerName: string; academicTerm: string; institution: string | null; status: string; modality: string | null; classDays: string | null; classTime: string | null };
  course: { title: string; level: string } | null;
  students: Student[];
  role: string;
};

const tabs = [
  { id: "overview", label: "Visão geral", icon: Activity },
  { id: "students", label: "Alunos", icon: Users },
  { id: "sessions", label: "Sessões", icon: CalendarDays },
  { id: "attendance", label: "Presença", icon: ClipboardCheck },
  { id: "activities", label: "Atividades", icon: GraduationCap },
  { id: "progress", label: "Progresso", icon: CheckCircle2 },
] as const;

export function InternalClassDetail({ offer, course, students, role }: InternalClassDetailProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("overview");
  const statusLabel = offer.status === "published" ? "Publicada" : offer.status === "archived" ? "Arquivada" : "Rascunho";

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.16em] text-red-600">{course?.level ?? "Curso interno"} · {offer.academicTerm}</p><h1 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">{offer.offerName}</h1><p className="mt-2 text-sm text-muted-foreground">{course?.title ?? "Curso não informado"}{offer.institution ? ` · ${offer.institution}` : ""}</p></div>
          <span className="w-fit rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{statusLabel}</span>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-muted/50 p-4"><p className="text-xs font-semibold text-muted-foreground">Alunos vinculados</p><p className="mt-1 text-2xl font-black text-foreground">{students.length}</p></div><div className="rounded-2xl bg-muted/50 p-4"><p className="text-xs font-semibold text-muted-foreground">Agenda</p><p className="mt-1 text-sm font-bold text-foreground">{offer.classDays || "A definir"}{offer.classTime ? ` · ${offer.classTime}` : ""}</p></div><div className="rounded-2xl bg-muted/50 p-4"><p className="text-xs font-semibold text-muted-foreground">Modalidade</p><p className="mt-1 text-sm font-bold text-foreground">{offer.modality || "A definir"}</p></div></div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card p-2 shadow-sm"><div className="flex min-w-max gap-1" role="tablist" aria-label="Seções da turma">{tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${activeTab === id ? "bg-red-600 text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><Icon size={16} aria-hidden="true" />{label}</button>)}</div></div>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6" role="tabpanel">
        {activeTab === "students" ? <><h2 className="text-xl font-black text-foreground">Alunos vinculados</h2><p className="mt-1 text-sm text-muted-foreground">Somente professores e administradores podem gerenciar estes vínculos.</p><div className="mt-5 divide-y divide-border">{students.length === 0 ? <p className="py-8 text-sm text-muted-foreground">Nenhum aluno vinculado ainda.</p> : students.map((student) => <div key={student.id} className="flex items-center justify-between gap-4 py-3"><div><p className="font-bold text-foreground">{student.name || "Aluno sem nome"}</p><p className="text-sm text-muted-foreground">{student.email || "E-mail não informado"}</p></div><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">Ativo</span></div>)}</div></> : <><h2 className="text-xl font-black text-foreground">{tabs.find((tab) => tab.id === activeTab)?.label}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{activeTab === "overview" ? "Acompanhe a operação da turma e mantenha conteúdo, progresso, atividades e presença organizados em um único lugar." : "Esta seção está preparada para receber os registros acadêmicos desta turma conforme as sessões, atividades e presenças forem lançadas."}</p><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-dashed border-border p-4"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Progresso médio</p><p className="mt-2 text-2xl font-black text-foreground">—</p></div><div className="rounded-2xl border border-dashed border-border p-4"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Registros</p><p className="mt-2 text-2xl font-black text-foreground">0</p></div><div className="rounded-2xl border border-dashed border-border p-4"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Acesso</p><p className="mt-2 text-sm font-bold text-foreground">{role === "professor" ? "Gestão docente" : "Visão administrativa"}</p></div></div></>}
      </section>
    </div>
  );
}
