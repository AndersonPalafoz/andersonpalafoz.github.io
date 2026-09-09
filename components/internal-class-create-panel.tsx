"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";

type CourseOption = { id: number; title: string; level: string };

export function InternalClassCreatePanel({ courses }: { courses: CourseOption[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const closePanel = () => router.push("/professor/turmas-internas");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/course-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: Number(form.get("courseId")),
          offerName: form.get("offerName"),
          academicTerm: form.get("academicTerm"),
          modality: form.get("modality"),
          classDays: form.get("classDays"),
          classTime: form.get("classTime"),
          workloadHours: Number(form.get("workloadHours") || 40),
          status: "draft",
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível criar a turma interna.");
      router.push(`/professor/turmas-internas/${payload.offer.id}`);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Não foi possível criar a turma interna.");
      setIsSubmitting(false);
    }
  }

  return <section className="rounded-2xl border border-red-200 bg-red-50/60 p-4 shadow-sm dark:border-red-950/60 dark:bg-red-950/20 sm:p-6" aria-labelledby="create-internal-class-title"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-red-600">Novo registro interno</p><h2 id="create-internal-class-title" className="mt-1 text-xl font-black text-foreground">Criar turma dentro da plataforma</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Escolha um curso existente e crie uma oferta interna. Esta ação não cria turma externa nem copia alunos.</p></div><button type="button" onClick={closePanel} aria-label="Fechar formulário de nova turma" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"><X size={18} aria-hidden="true" /></button></div>
    <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="grid gap-1.5 text-sm font-bold text-foreground sm:col-span-2">Curso base<select name="courseId" required defaultValue="" className="min-h-11 rounded-xl border border-border bg-background px-3 py-2.5 font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"><option value="" disabled>Selecione um curso existente</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title} · {course.level}</option>)}</select></label>
      <label className="grid gap-1.5 text-sm font-bold text-foreground">Nome da turma<input name="offerName" required maxLength={180} placeholder="Ex.: Inglês B1 — Turma da noite" className="min-h-11 rounded-xl border border-border bg-background px-3 py-2.5 font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20" /></label>
      <label className="grid gap-1.5 text-sm font-bold text-foreground">Período acadêmico<input name="academicTerm" required maxLength={80} placeholder="Ex.: 2026.2" className="min-h-11 rounded-xl border border-border bg-background px-3 py-2.5 font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20" /></label>
      <label className="grid gap-1.5 text-sm font-bold text-foreground">Modalidade<select name="modality" defaultValue="Remota" className="min-h-11 rounded-xl border border-border bg-background px-3 py-2.5 font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"><option>Remota</option><option>Presencial</option><option>Híbrida</option></select></label>
      <label className="grid gap-1.5 text-sm font-bold text-foreground">Carga horária<input name="workloadHours" type="number" min="1" max="1000" defaultValue="40" className="min-h-11 rounded-xl border border-border bg-background px-3 py-2.5 font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20" /></label>
      <label className="grid gap-1.5 text-sm font-bold text-foreground">Dias de aula<input name="classDays" placeholder="Ex.: Terças e quintas" className="min-h-11 rounded-xl border border-border bg-background px-3 py-2.5 font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20" /></label>
      <label className="grid gap-1.5 text-sm font-bold text-foreground">Horário<input name="classTime" placeholder="Ex.: 19h às 21h" className="min-h-11 rounded-xl border border-border bg-background px-3 py-2.5 font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20" /></label>
      {error && <p role="alert" className="sm:col-span-2 rounded-xl border border-red-300 bg-red-100 px-3 py-2.5 text-sm font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
      <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:justify-end"><button type="button" onClick={closePanel} className="min-h-11 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground hover:bg-background">Cancelar</button><button type="submit" disabled={isSubmitting || courses.length === 0} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Criando...</> : <><CheckCircle2 size={16} aria-hidden="true" /> Criar turma interna</>}</button></div>
    </form>
  </section>;
}
